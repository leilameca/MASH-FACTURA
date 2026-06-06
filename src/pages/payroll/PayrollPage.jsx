import { pdf } from '@react-pdf/renderer';
import { ChevronDown, ChevronUp, DollarSign, FileDown } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { PayrollReceiptPdf } from '../../components/documents/PayrollReceiptPdf';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Toast } from '../../components/ui/Toast';
import { paymentMethods } from '../../constants/options';
import { supabase } from '../../lib/supabaseClient';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { createRow, listRows } from '../../services/crudService';

const todayStr = () => new Date().toISOString().slice(0, 10);

function currentPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function periodRange(period) {
  const [year, month] = period.split('-').map(Number);
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  return { start, end: `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}` };
}

function fmtPeriod(periodKey) {
  const [year, month] = periodKey.split('-');
  return new Date(Number(year), Number(month) - 1, 1)
    .toLocaleDateString('es-DO', { month: 'long', year: 'numeric' });
}

const METHOD_LABELS = { efectivo: 'Efectivo', transferencia: 'Transferencia', tarjeta: 'Tarjeta', qik: 'Qik', cheque: 'Cheque', otro: 'Otro' };

export function PayrollPage() {
  const [period, setPeriod] = useState(currentPeriod);
  const [records, setRecords] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [toast, setToast] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [taxId, setTaxId] = useState('');

  // Pay modal
  const [payModal, setPayModal] = useState(null); // { employee, unpaidRecords }
  const [selected, setSelected] = useState(new Set());
  const [payForm, setPayForm] = useState({ payment_method: 'efectivo', payment_date: todayStr(), order_id: '', notes: '' });

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { start, end } = periodRange(period);
      const { data, error } = await supabase
        .from('production_records')
        .select('*, employees(id, name, area, employee_id), tarifario(work_name, unit, area), payroll_payments(id, payment_method, payment_date, amount, orders(order_number))')
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false });
      if (error) throw error;
      setRecords(data ?? []);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!supabase) return;
    supabase.from('business_settings').select('tax_id').limit(1).maybeSingle()
      .then(({ data }) => { if (data?.tax_id) setTaxId(data.tax_id); });
  }, []);

  useEffect(() => {
    if (!supabase) return;
    listRows('orders', { select: 'id, order_number, order_type, clients(full_name)', orderBy: 'created_at', ascending: false })
      .then(setOrders).catch(() => {});
  }, []);

  // Group records by employee
  const byEmployee = records.reduce((map, r) => {
    const emp = r.employees;
    if (!emp) return map;
    if (!map[emp.id]) map[emp.id] = { employee: emp, records: [] };
    map[emp.id].records.push(r);
    return map;
  }, {});

  const employeeGroups = Object.values(byEmployee)
    .sort((a, b) => a.employee.name.localeCompare(b.employee.name));

  // Stats
  const totalProduction = records.reduce((s, r) => s + Number(r.total || 0), 0);
  const totalPaid = records.filter((r) => r.payment_id).reduce((s, r) => s + Number(r.total || 0), 0);
  const totalPending = totalProduction - totalPaid;

  // Pay modal helpers
  function openPayModal(group) {
    const unpaid = group.records.filter((r) => !r.payment_id);
    setSelected(new Set(unpaid.map((r) => r.id)));
    setPayForm({ payment_method: 'efectivo', payment_date: todayStr(), order_id: '', notes: '' });
    setPayModal({ employee: group.employee, unpaidRecords: unpaid });
  }

  function toggleRecord(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const selectedRecords = payModal?.unpaidRecords.filter((r) => selected.has(r.id)) ?? [];
  const selectedTotal = selectedRecords.reduce((s, r) => s + Number(r.total || 0), 0);

  async function handlePay() {
    if (!payModal || selected.size === 0) {
      setToast({ type: 'error', message: 'Selecciona al menos un trabajo.' });
      return;
    }
    setSaving(true);
    try {
      const { employee } = payModal;

      // Create expense
      const expense = await createRow('expenses', {
        category: 'nomina',
        description: `Pago trabajos ${fmtPeriod(period)} — ${employee.name}`,
        amount: selectedTotal,
        payment_method: payForm.payment_method,
        expense_date: payForm.payment_date,
        notes: payForm.notes || null,
      });

      // Create payroll_payment
      const payment = await createRow('payroll_payments', {
        employee_id: employee.id,
        period_key: period,
        amount: selectedTotal,
        payment_method: payForm.payment_method,
        payment_date: payForm.payment_date,
        order_id: payForm.order_id || null,
        expense_id: expense.id,
        notes: payForm.notes || null,
      });

      // Mark selected records as paid
      const ids = Array.from(selected);
      const { error } = await supabase
        .from('production_records')
        .update({ payment_id: payment.id })
        .in('id', ids);
      if (error) throw error;

      setToast({ type: 'success', message: `${ids.length} trabajo(s) pagado(s). Gasto registrado.` });
      setPayModal(null);
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleReceipt(payment, employee, paidRecords) {
    setGeneratingPdf(true);
    try {
      const blob = await pdf(
        <PayrollReceiptPdf
          bonus={0}
          discount={0}
          employee={employee}
          net={payment.amount}
          payment={{ ...payment, order_number: payment.orders?.order_number }}
          period={period}
          production={payment.amount}
          records={paidRecords}
          taxId={taxId}
        />
      ).toBlob();
      window.open(URL.createObjectURL(blob), '_blank');
    } catch (err) {
      setToast({ type: 'error', message: 'Error generando comprobante.' });
    } finally {
      setGeneratingPdf(false);
    }
  }

  return (
    <div className="space-y-6">
      <Toast message={toast?.message} type={toast?.type} />

      <PageHeader
        count={employeeGroups.length ? `${employeeGroups.length} empleados` : undefined}
        subtitle="Pagos individuales por trabajo realizado."
        title="Nómina"
      />

      <div className="flex items-center gap-3">
        <span className="text-sm text-mash-text3">Período</span>
        <input
          className="rounded-[10px] border border-mash-borderMd bg-white px-3.5 py-2 text-sm text-mash-text1 outline-none focus:border-mash-brand"
          onChange={(e) => setPeriod(e.target.value)}
          type="month"
          value={period}
        />
      </div>

      {records.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="flex flex-col gap-1 p-4">
            <span className="text-xs text-mash-text3">Total producción</span>
            <span className="font-mono text-lg font-bold text-mash-text1">{formatCurrency(totalProduction)}</span>
          </Card>
          <Card className="flex flex-col gap-1 p-4">
            <span className="text-xs text-mash-text3">Total pagado</span>
            <span className="font-mono text-lg font-bold text-green-700">{formatCurrency(totalPaid)}</span>
          </Card>
          <Card className="flex flex-col gap-1 p-4">
            <span className="text-xs text-mash-text3">Pendiente de pago</span>
            <span className="font-mono text-lg font-bold text-amber-600">{formatCurrency(totalPending)}</span>
          </Card>
        </div>
      )}

      {!loading && !employeeGroups.length && (
        <EmptyState
          description="No hay registros de producción para este período."
          icon={DollarSign}
          title="Sin producción en este período"
        />
      )}

      <div className="space-y-3">
        {employeeGroups.map((group) => {
          const unpaid = group.records.filter((r) => !r.payment_id);
          const paid = group.records.filter((r) => r.payment_id);
          const unpaidTotal = unpaid.reduce((s, r) => s + Number(r.total || 0), 0);
          const paidTotal = paid.reduce((s, r) => s + Number(r.total || 0), 0);
          const isOpen = expanded[group.employee.id];

          // Group paid records by payment
          const paymentGroups = paid.reduce((map, r) => {
            const pid = r.payment_id;
            if (!map[pid]) map[pid] = { payment: r.payroll_payments, records: [] };
            map[pid].records.push(r);
            return map;
          }, {});

          return (
            <Card key={group.employee.id} className="overflow-hidden">
              {/* Employee header */}
              <div className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[15px] font-semibold text-mash-text1">{group.employee.name}</p>
                  <p className="text-[13px] text-mash-text3">{group.employee.employee_id} · {group.employee.area}</p>
                  <div className="mt-2 flex flex-wrap gap-3 text-[13px]">
                    {unpaid.length > 0 && (
                      <span className="text-amber-700">
                        {unpaid.length} pendiente{unpaid.length !== 1 ? 's' : ''} · <span className="font-semibold">{formatCurrency(unpaidTotal)}</span>
                      </span>
                    )}
                    {paid.length > 0 && (
                      <span className="text-green-700">
                        {paid.length} pagado{paid.length !== 1 ? 's' : ''} · <span className="font-semibold">{formatCurrency(paidTotal)}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                  {unpaid.length > 0 && (
                    <Button icon={DollarSign} onClick={() => openPayModal(group)} size="sm">
                      Pagar trabajos
                    </Button>
                  )}
                  <button
                    className="flex items-center gap-1 rounded-[8px] border border-mash-borderMd px-2.5 py-1.5 text-xs font-medium text-mash-text2 hover:bg-mash-bg"
                    onClick={() => setExpanded((e) => ({ ...e, [group.employee.id]: !e[group.employee.id] }))}
                    type="button"
                  >
                    {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    {isOpen ? 'Ocultar' : 'Ver trabajos'}
                  </button>
                </div>
              </div>

              {/* Expanded records */}
              {isOpen && (
                <div className="border-t border-mash-border">
                  {/* Pending records */}
                  {unpaid.length > 0 && (
                    <div>
                      <p className="bg-amber-50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                        Pendientes de pago
                      </p>
                      {unpaid.map((r) => (
                        <RecordRow key={r.id} record={r} />
                      ))}
                    </div>
                  )}

                  {/* Paid records grouped by payment */}
                  {Object.values(paymentGroups).map(({ payment, records: paidRecs }) => (
                    <div key={payment?.id ?? 'unknown'}>
                      <div className="flex items-center justify-between bg-green-50 px-4 py-2">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-green-700">
                          Pagado el {payment?.payment_date ? formatDate(payment.payment_date + 'T00:00:00') : '—'} · {METHOD_LABELS[payment?.payment_method] ?? payment?.payment_method} · {formatCurrency(payment?.amount ?? 0)}
                        </p>
                        {payment && (
                          <button
                            className="flex items-center gap-1 rounded-[6px] border border-green-200 px-2 py-1 text-[11px] font-medium text-green-700 hover:bg-green-100"
                            onClick={() => handleReceipt(payment, group.employee, paidRecs)}
                            type="button"
                          >
                            <FileDown className="h-3 w-3" /> Comprobante
                          </button>
                        )}
                      </div>
                      {paidRecs.map((r) => (
                        <RecordRow key={r.id} record={r} paid />
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Pay modal */}
      <Modal
        footer={(
          <>
            <Button className="w-full md:w-auto" disabled={saving} onClick={() => setPayModal(null)} variant="secondary">Cancelar</Button>
            <Button className="w-full md:w-auto" disabled={selected.size === 0} loading={saving} onClick={handlePay}>
              Pagar {selected.size > 0 ? `(${selected.size})` : ''}
            </Button>
          </>
        )}
        onClose={() => setPayModal(null)}
        open={payModal !== null}
        size="lg"
        title={`Pagar trabajos — ${payModal?.employee?.name ?? ''}`}
      >
        <div className="space-y-4">
          {/* Work checklist */}
          <div className="rounded-[10px] border border-mash-borderMd overflow-hidden">
            <div className="flex items-center justify-between bg-mash-bg px-4 py-2.5">
              <span className="text-[12px] font-semibold text-mash-text2">Selecciona los trabajos a pagar</span>
              <button
                className="text-[12px] font-medium text-mash-brand hover:underline"
                onClick={() => {
                  const allIds = new Set(payModal?.unpaidRecords.map((r) => r.id));
                  setSelected(selected.size === allIds.size ? new Set() : allIds);
                }}
                type="button"
              >
                {selected.size === payModal?.unpaidRecords.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
            </div>
            {payModal?.unpaidRecords.map((r) => (
              <label
                className={cn(
                  'flex cursor-pointer items-center gap-3 border-t border-mash-border px-4 py-3 transition hover:bg-mash-bg',
                  selected.has(r.id) && 'bg-mash-brand/5',
                )}
                key={r.id}
              >
                <input
                  checked={selected.has(r.id)}
                  className="h-4 w-4 accent-mash-brand"
                  onChange={() => toggleRecord(r.id)}
                  type="checkbox"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-mash-text1">{r.tarifario?.work_name}</p>
                  <p className="text-xs text-mash-text3">{formatDate(r.date + 'T00:00:00')} · {r.quantity} × {formatCurrency(r.unit_price)}</p>
                </div>
                <span className="font-mono text-sm font-semibold text-mash-text1">{formatCurrency(r.total)}</span>
              </label>
            ))}
          </div>

          {/* Selected total */}
          <div className="flex items-center justify-between rounded-[10px] border border-mash-brand/40 bg-mash-brand/5 px-4 py-3">
            <span className="text-[13px] font-medium text-mash-text3">Total a pagar</span>
            <span className="font-mono text-[20px] font-bold text-mash-brand">{formatCurrency(selectedTotal)}</span>
          </div>

          {/* Payment details */}
          <div className="grid gap-4 md:grid-cols-2">
            <Select
              label="Método de pago"
              onChange={(e) => setPayForm((f) => ({ ...f, payment_method: e.target.value }))}
              value={payForm.payment_method}
            >
              {paymentMethods.map((m) => (
                <option key={m} value={m}>{METHOD_LABELS[m] ?? m}</option>
              ))}
            </Select>
            <Input
              label="Fecha de pago"
              onChange={(e) => setPayForm((f) => ({ ...f, payment_date: e.target.value }))}
              type="date"
              value={payForm.payment_date}
            />
            <Select
              label="Vincular a pedido (opcional)"
              onChange={(e) => setPayForm((f) => ({ ...f, order_id: e.target.value }))}
              value={payForm.order_id}
            >
              <option value="">Sin pedido</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {[o.order_number, o.clients?.full_name, o.order_type].filter(Boolean).join(' · ')}
                </option>
              ))}
            </Select>
            <div className="md:col-span-2">
              <Textarea
                label="Notas (opcional)"
                onChange={(e) => setPayForm((f) => ({ ...f, notes: e.target.value }))}
                value={payForm.notes}
              />
            </div>
          </div>

          <p className="rounded-[8px] border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
            Este pago se registrará automáticamente como gasto en la sección de Gastos.
          </p>
        </div>
      </Modal>
    </div>
  );
}

function RecordRow({ record, paid = false }) {
  return (
    <div className={cn('flex items-center justify-between px-4 py-3 border-t border-mash-border', paid && 'opacity-60')}>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-mash-text1">{record.tarifario?.work_name}</p>
        <p className="text-xs text-mash-text3">
          {formatDate(record.date + 'T00:00:00')} · {record.quantity} × {formatCurrency(record.unit_price)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm font-semibold text-mash-text1">{formatCurrency(record.total)}</span>
        {paid
          ? <Badge variant="olive">Pagado</Badge>
          : <Badge variant="warning">Pendiente</Badge>
        }
      </div>
    </div>
  );
}

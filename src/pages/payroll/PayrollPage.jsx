import { pdf } from '@react-pdf/renderer';
import { DollarSign, FileDown, Pencil } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { PayrollReceiptPdf } from '../../components/documents/PayrollReceiptPdf';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Toast } from '../../components/ui/Toast';
import { paymentMethods } from '../../constants/options';
import { supabase } from '../../lib/supabaseClient';
import { formatCurrency } from '../../lib/utils';
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
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
}

function fmtPeriod(periodKey) {
  const [year, month] = periodKey.split('-');
  return new Date(Number(year), Number(month) - 1, 1)
    .toLocaleDateString('es-DO', { month: 'long', year: 'numeric' });
}

const METHOD_LABELS = Object.fromEntries(
  paymentMethods.map((m) => [m, m.charAt(0).toUpperCase() + m.slice(1)])
);

export function PayrollPage() {
  const [period, setPeriod] = useState(currentPeriod);
  const [summary, setSummary] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [toast, setToast] = useState(null);

  // Adjustment modal
  const [adjEditing, setAdjEditing] = useState(null);
  const [adjForm, setAdjForm] = useState({ bonus: '', discount: '', notes: '' });

  // Payment modal
  const [payEditing, setPayEditing] = useState(null);
  const [payForm, setPayForm] = useState({ amount: '', payment_method: 'efectivo', payment_date: todayStr(), order_id: '', notes: '' });

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { start, end } = periodRange(period);

      const [{ data: records, error: recErr }, { data: adjustments, error: adjErr }, { data: payments, error: payErr }] = await Promise.all([
        supabase
          .from('production_records')
          .select('employee_id, total, employees(id, name, area, employee_id)')
          .gte('date', start)
          .lte('date', end),
        supabase.from('payroll_adjustments').select('*').eq('period_key', period),
        supabase.from('payroll_payments').select('*, orders(order_number)').eq('period_key', period),
      ]);

      if (recErr) throw recErr;
      if (adjErr) throw adjErr;
      if (payErr) throw payErr;

      const map = {};
      for (const r of records ?? []) {
        const emp = r.employees;
        if (!emp) continue;
        if (!map[emp.id]) map[emp.id] = { employee: emp, production: 0 };
        map[emp.id].production += Number(r.total || 0);
      }

      const adjMap = {};
      for (const a of adjustments ?? []) adjMap[a.employee_id] = a;

      const payMap = {};
      for (const p of payments ?? []) payMap[p.employee_id] = p;

      const rows = Object.values(map)
        .map((item) => {
          const adj = adjMap[item.employee.id] ?? { bonus: 0, discount: 0, notes: '' };
          const net = item.production + Number(adj.bonus || 0) - Number(adj.discount || 0);
          const payment = payMap[item.employee.id] ?? null;
          return { ...item, adj, net, payment };
        })
        .sort((a, b) => a.employee.name.localeCompare(b.employee.name));

      setSummary(rows);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!supabase) return;
    listRows('orders', {
      select: 'id, order_number, order_type, clients(full_name)',
      orderBy: 'created_at',
      ascending: false,
    })
      .then(setOrders)
      .catch(() => {});
  }, []);

  // ── Adjustment ──────────────────────────────────────────────────────────────

  function openAdj(row) {
    setAdjForm({ bonus: String(row.adj?.bonus ?? 0), discount: String(row.adj?.discount ?? 0), notes: row.adj?.notes ?? '' });
    setAdjEditing(row);
  }

  async function handleSaveAdj() {
    if (!adjEditing) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('payroll_adjustments')
        .upsert(
          { employee_id: adjEditing.employee.id, period_key: period, bonus: Number(adjForm.bonus || 0), discount: Number(adjForm.discount || 0), notes: adjForm.notes || null },
          { onConflict: 'employee_id,period_key' },
        );
      if (error) throw error;
      setToast({ type: 'success', message: 'Ajustes guardados.' });
      setAdjEditing(null);
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  // ── Payment ──────────────────────────────────────────────────────────────────

  function openPay(row) {
    const existing = row.payment;
    setPayForm({
      amount: existing ? String(existing.amount) : String(Math.round(row.net * 100) / 100),
      payment_method: existing?.payment_method ?? 'efectivo',
      payment_date: existing?.payment_date ?? todayStr(),
      order_id: existing?.order_id ?? '',
      notes: existing?.notes ?? '',
    });
    setPayEditing(row);
  }

  async function handleSavePay() {
    if (!payEditing) return;
    if (!payForm.amount || Number(payForm.amount) <= 0) {
      setToast({ type: 'error', message: 'Ingresa un monto válido.' });
      return;
    }
    setSaving(true);
    try {
      const { employee, production, adj, net } = payEditing;

      // Create or update expense record
      const expensePayload = {
        category: 'nomina',
        description: `Nómina ${fmtPeriod(period)} — ${employee.name}`,
        amount: Number(payForm.amount),
        payment_method: payForm.payment_method,
        expense_date: payForm.payment_date,
        notes: payForm.notes || null,
      };

      let expenseId = payEditing.payment?.expense_id ?? null;
      if (expenseId) {
        await supabase.from('expenses').update(expensePayload).eq('id', expenseId);
      } else {
        const expense = await createRow('expenses', expensePayload);
        expenseId = expense.id;
      }

      // Upsert payment record
      const { error } = await supabase
        .from('payroll_payments')
        .upsert(
          {
            employee_id: employee.id,
            period_key: period,
            amount: Number(payForm.amount),
            payment_method: payForm.payment_method,
            payment_date: payForm.payment_date,
            order_id: payForm.order_id || null,
            expense_id: expenseId,
            notes: payForm.notes || null,
          },
          { onConflict: 'employee_id,period_key' },
        );
      if (error) throw error;

      setToast({ type: 'success', message: 'Pago registrado y sumado a gastos.' });
      setPayEditing(null);
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handlePrintReceipt(row) {
    if (!row.payment) return;
    setGeneratingPdf(true);
    try {
      const blob = await pdf(
        <PayrollReceiptPdf
          bonus={Number(row.adj?.bonus || 0)}
          discount={Number(row.adj?.discount || 0)}
          employee={row.employee}
          net={row.net}
          payment={{ ...row.payment, order_number: row.payment?.orders?.order_number }}
          period={period}
          production={row.production}
        />
      ).toBlob();
      window.open(URL.createObjectURL(blob), '_blank');
    } catch (err) {
      setToast({ type: 'error', message: 'Error generando comprobante.' });
    } finally {
      setGeneratingPdf(false);
    }
  }

  const totalNomina = summary.reduce((sum, r) => sum + r.net, 0);
  const totalPagado = summary.filter((r) => r.payment).reduce((sum, r) => sum + Number(r.payment?.amount || 0), 0);
  const pendienteCount = summary.filter((r) => !r.payment).length;

  const adjPreviewNet = adjEditing
    ? (adjEditing.production ?? 0) + Number(adjForm.bonus || 0) - Number(adjForm.discount || 0)
    : 0;

  return (
    <div className="space-y-6">
      <Toast message={toast?.message} type={toast?.type} />

      <PageHeader
        count={summary.length ? `${summary.length} empleados` : undefined}
        subtitle="Resumen de producción, pagos y estado por período."
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

      {summary.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="flex flex-col gap-1 p-4">
            <span className="text-xs text-mash-text3">Total nómina</span>
            <span className="font-mono text-lg font-bold text-mash-brand">{formatCurrency(totalNomina)}</span>
          </Card>
          <Card className="flex flex-col gap-1 p-4">
            <span className="text-xs text-mash-text3">Total pagado</span>
            <span className="font-mono text-lg font-bold text-green-700">{formatCurrency(totalPagado)}</span>
          </Card>
          <Card className="flex flex-col gap-1 p-4">
            <span className="text-xs text-mash-text3">Pendientes de pago</span>
            <span className="font-mono text-lg font-bold text-amber-600">{pendienteCount} empleado{pendienteCount !== 1 ? 's' : ''}</span>
          </Card>
        </div>
      )}

      {!loading && !summary.length && (
        <EmptyState
          description="No hay registros de producción para este período."
          icon={DollarSign}
          title="Sin producción en este período"
        />
      )}

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {summary.map((row) => (
          <Card className="p-4" key={row.employee.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-[15px] font-semibold text-mash-text1">{row.employee.name}</p>
                  <StatusBadge paid={Boolean(row.payment)} />
                </div>
                <p className="text-[13px] text-mash-text3">{row.employee.area} · {row.employee.employee_id}</p>
                <div className="mt-2 space-y-0.5 text-[13px] text-mash-text3">
                  <p>Producción: <span className="font-medium text-mash-text2">{formatCurrency(row.production)}</span></p>
                  {Number(row.adj?.bonus) > 0 && <p>Bono: <span className="font-medium text-green-700">+{formatCurrency(row.adj.bonus)}</span></p>}
                  {Number(row.adj?.discount) > 0 && <p>Descuento: <span className="font-medium text-red-700">−{formatCurrency(row.adj.discount)}</span></p>}
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-[17px] font-bold text-mash-brand">{formatCurrency(row.net)}</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  <ActionBtn label={row.payment ? 'Editar pago' : 'Pagar'} onClick={() => openPay(row)} primary={!row.payment} />
                  {row.payment && <ActionBtn icon={FileDown} label="Comprobante" onClick={() => handlePrintReceipt(row)} />}
                  <ActionBtn label="Ajustes" onClick={() => openAdj(row)} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {summary.length > 0 && (
        <DataTable
          columns={[
            { key: 'employee',   label: 'Empleado' },
            { key: 'area',       label: 'Área' },
            { key: 'production', label: 'Producción',  align: 'right' },
            { key: 'bonus',      label: 'Bono',        align: 'right' },
            { key: 'discount',   label: 'Descuento',   align: 'right' },
            { key: 'net',        label: 'Neto',        align: 'right' },
            { key: 'status',     label: 'Estado',      align: 'center' },
            { key: 'actions',    label: '',            align: 'right' },
          ]}
          renderRow={(row) => (
            <tr className="border-b border-mash-surface2 transition hover:bg-mash-bg" key={row.employee.id}>
              <td className="px-4 py-4">
                <p className="text-sm font-medium text-mash-text1">{row.employee.name}</p>
                <p className="text-xs text-mash-text3">{row.employee.employee_id}</p>
              </td>
              <td className="px-4 py-4 text-sm capitalize text-mash-text2">{row.employee.area}</td>
              <td className="px-4 py-4 text-right font-mono text-sm text-mash-text2">{formatCurrency(row.production)}</td>
              <td className="px-4 py-4 text-right font-mono text-sm text-green-700">
                {Number(row.adj?.bonus) > 0 ? `+${formatCurrency(row.adj.bonus)}` : '—'}
              </td>
              <td className="px-4 py-4 text-right font-mono text-sm text-red-700">
                {Number(row.adj?.discount) > 0 ? `−${formatCurrency(row.adj.discount)}` : '—'}
              </td>
              <td className="px-4 py-4 text-right font-mono text-sm font-bold text-mash-brand">{formatCurrency(row.net)}</td>
              <td className="px-4 py-4 text-center">
                <StatusBadge paid={Boolean(row.payment)} />
              </td>
              <td className="px-4 py-4 text-right">
                <div className="flex justify-end gap-1">
                  {row.payment && (
                    <button
                      className="flex items-center gap-1 rounded-[8px] border border-mash-borderMd px-2.5 py-1.5 text-xs font-medium text-mash-text2 hover:bg-mash-bg"
                      onClick={() => handlePrintReceipt(row)}
                      type="button"
                    >
                      <FileDown className="h-3 w-3" />
                    </button>
                  )}
                  <button
                    className="flex items-center gap-1 rounded-[8px] border border-mash-borderMd px-2.5 py-1.5 text-xs font-medium text-mash-text2 hover:bg-mash-bg"
                    onClick={() => openAdj(row)}
                    type="button"
                  >
                    <Pencil className="h-3 w-3" /> Ajustes
                  </button>
                  <button
                    className={`flex items-center gap-1 rounded-[8px] px-2.5 py-1.5 text-xs font-semibold ${row.payment ? 'border border-mash-borderMd text-mash-text2 hover:bg-mash-bg' : 'bg-mash-brand text-white hover:opacity-90'}`}
                    onClick={() => openPay(row)}
                    type="button"
                  >
                    <DollarSign className="h-3 w-3" /> {row.payment ? 'Editar pago' : 'Pagar'}
                  </button>
                </div>
              </td>
            </tr>
          )}
          rows={summary}
        />
      )}

      {/* Adjustment modal */}
      <Modal
        footer={(
          <>
            <Button className="w-full md:w-auto" disabled={saving} onClick={() => setAdjEditing(null)} variant="secondary">Cancelar</Button>
            <Button className="w-full md:w-auto" loading={saving} onClick={handleSaveAdj}>Guardar ajustes</Button>
          </>
        )}
        onClose={() => setAdjEditing(null)}
        open={adjEditing !== null}
        title={`Ajustes — ${adjEditing?.employee?.name ?? ''}`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col justify-center rounded-[10px] border border-mash-borderMd bg-mash-bg px-4 py-3 md:col-span-2">
            <p className="text-[12px] font-medium text-mash-text3">Producción del período</p>
            <p className="mt-1 font-mono text-[20px] font-bold text-mash-text1">{formatCurrency(adjEditing?.production ?? 0)}</p>
          </div>
          <Input label="Bono (RD$)" min="0" onChange={(e) => setAdjForm((f) => ({ ...f, bonus: e.target.value }))} step="0.01" type="number" value={adjForm.bonus} />
          <Input label="Descuento (RD$)" min="0" onChange={(e) => setAdjForm((f) => ({ ...f, discount: e.target.value }))} step="0.01" type="number" value={adjForm.discount} />
          <div className="flex flex-col justify-center rounded-[10px] border border-mash-brand/40 bg-mash-brand/5 px-4 py-3 md:col-span-2">
            <p className="text-[12px] font-medium text-mash-text3">Neto a pagar</p>
            <p className="mt-1 font-mono text-[22px] font-bold text-mash-brand">{formatCurrency(adjPreviewNet)}</p>
          </div>
          <div className="md:col-span-2">
            <Textarea label="Notas" onChange={(e) => setAdjForm((f) => ({ ...f, notes: e.target.value }))} value={adjForm.notes} />
          </div>
        </div>
      </Modal>

      {/* Payment modal */}
      <Modal
        footer={(
          <>
            <Button className="w-full md:w-auto" disabled={saving} onClick={() => setPayEditing(null)} variant="secondary">Cancelar</Button>
            <Button className="w-full md:w-auto" loading={saving} onClick={handleSavePay}>
              {payEditing?.payment ? 'Actualizar pago' : 'Registrar pago'}
            </Button>
          </>
        )}
        onClose={() => setPayEditing(null)}
        open={payEditing !== null}
        size="lg"
        title={`Pago — ${payEditing?.employee?.name ?? ''}`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col justify-center rounded-[10px] border border-mash-borderMd bg-mash-bg px-4 py-3 md:col-span-2">
            <p className="text-[12px] font-medium text-mash-text3">Neto a pagar según nómina</p>
            <p className="mt-1 font-mono text-[20px] font-bold text-mash-text1">{formatCurrency(payEditing?.net ?? 0)}</p>
          </div>
          <Input
            label="Monto a pagar (RD$)"
            min="0.01"
            onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))}
            required
            step="0.01"
            type="number"
            value={payForm.amount}
          />
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
          <div className="rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800 md:col-span-2">
            Este pago se registrará automáticamente como gasto de nómina en la sección de Gastos.
          </div>
        </div>
      </Modal>
    </div>
  );
}

function StatusBadge({ paid }) {
  return paid
    ? <Badge variant="olive">Pagado</Badge>
    : <Badge variant="warning">Pendiente</Badge>;
}

function ActionBtn({ label, onClick, primary = false, icon: Icon }) {
  return (
    <button
      className={`flex items-center justify-center gap-1 rounded-[8px] px-2.5 py-1.5 text-xs font-medium ${primary ? 'bg-mash-brand text-white hover:opacity-90' : 'border border-mash-borderMd text-mash-text2 hover:bg-mash-bg'}`}
      onClick={onClick}
      type="button"
    >
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </button>
  );
}

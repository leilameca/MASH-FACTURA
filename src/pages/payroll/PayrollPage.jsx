import { DollarSign, Pencil } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Textarea } from '../../components/ui/Textarea';
import { Toast } from '../../components/ui/Toast';
import { supabase } from '../../lib/supabaseClient';
import { formatCurrency } from '../../lib/utils';

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

export function PayrollPage() {
  const [period, setPeriod] = useState(currentPeriod);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(null);
  const [adjForm, setAdjForm] = useState({ bonus: '', discount: '', notes: '' });

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { start, end } = periodRange(period);

      const [{ data: records, error: recErr }, { data: adjustments, error: adjErr }] = await Promise.all([
        supabase
          .from('production_records')
          .select('employee_id, total, employees(id, name, area, employee_id)')
          .gte('date', start)
          .lte('date', end),
        supabase
          .from('payroll_adjustments')
          .select('*')
          .eq('period_key', period),
      ]);

      if (recErr) throw recErr;
      if (adjErr) throw adjErr;

      const map = {};
      for (const r of records ?? []) {
        const emp = r.employees;
        if (!emp) continue;
        if (!map[emp.id]) map[emp.id] = { employee: emp, production: 0 };
        map[emp.id].production += Number(r.total || 0);
      }

      const adjMap = {};
      for (const a of adjustments ?? []) adjMap[a.employee_id] = a;

      const rows = Object.values(map)
        .map((item) => {
          const adj = adjMap[item.employee.id] ?? { bonus: 0, discount: 0, notes: '' };
          const net = item.production + Number(adj.bonus || 0) - Number(adj.discount || 0);
          return { ...item, adj, net };
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

  function openAdjust(row) {
    setAdjForm({
      bonus: String(row.adj?.bonus ?? 0),
      discount: String(row.adj?.discount ?? 0),
      notes: row.adj?.notes ?? '',
    });
    setEditing(row);
  }

  async function handleSaveAdj() {
    if (!editing) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('payroll_adjustments')
        .upsert(
          {
            employee_id: editing.employee.id,
            period_key: period,
            bonus: Number(adjForm.bonus || 0),
            discount: Number(adjForm.discount || 0),
            notes: adjForm.notes || null,
          },
          { onConflict: 'employee_id,period_key' },
        );
      if (error) throw error;
      setToast({ type: 'success', message: 'Ajustes guardados.' });
      setEditing(null);
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  const previewNet = editing
    ? (editing.production ?? 0) + Number(adjForm.bonus || 0) - Number(adjForm.discount || 0)
    : 0;

  const totalNomina = summary.reduce((sum, r) => sum + r.net, 0);

  return (
    <div className="space-y-6">
      <Toast message={toast?.message} type={toast?.type} />

      <PageHeader
        count={summary.length ? `${summary.length} empleados` : undefined}
        subtitle="Resumen de producción y pagos por período."
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
        <Card className="flex items-center justify-between p-4">
          <span className="text-sm text-mash-text3">Total nómina del período</span>
          <span className="font-mono text-lg font-bold text-mash-brand">{formatCurrency(totalNomina)}</span>
        </Card>
      )}

      {!loading && !summary.length && (
        <EmptyState
          description="No hay registros de producción para este período. Registra producción primero."
          icon={DollarSign}
          title="Sin producción en este período"
        />
      )}

      <div className="space-y-3 md:hidden">
        {summary.map((row) => (
          <Card className="p-4" key={row.employee.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-mash-text1">{row.employee.name}</p>
                <p className="text-[13px] text-mash-text3">{row.employee.area} · {row.employee.employee_id}</p>
                <div className="mt-2 space-y-0.5 text-[13px] text-mash-text3">
                  <p>Producción: <span className="font-medium text-mash-text2">{formatCurrency(row.production)}</span></p>
                  {Number(row.adj?.bonus) > 0 && (
                    <p>Bono: <span className="font-medium text-green-700">+{formatCurrency(row.adj.bonus)}</span></p>
                  )}
                  {Number(row.adj?.discount) > 0 && (
                    <p>Descuento: <span className="font-medium text-red-700">−{formatCurrency(row.adj.discount)}</span></p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-[17px] font-bold text-mash-brand">{formatCurrency(row.net)}</p>
                <button
                  className="mt-2 flex items-center gap-1 rounded-[8px] border border-mash-borderMd px-2.5 py-1.5 text-xs font-medium text-mash-text2 hover:bg-mash-bg"
                  onClick={() => openAdjust(row)}
                  type="button"
                >
                  <Pencil className="h-3 w-3" /> Ajustes
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {summary.length > 0 && (
        <DataTable
          columns={[
            { key: 'employee', label: 'Empleado' },
            { key: 'area', label: 'Área' },
            { key: 'production', label: 'Producción', align: 'right' },
            { key: 'bonus', label: 'Bono', align: 'right' },
            { key: 'discount', label: 'Descuento', align: 'right' },
            { key: 'net', label: 'Neto', align: 'right' },
            { key: 'actions', label: '', align: 'right' },
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
              <td className="px-4 py-4 text-right">
                <button
                  className="flex items-center gap-1 rounded-[8px] border border-mash-borderMd px-2.5 py-1.5 text-xs font-medium text-mash-text2 hover:bg-mash-bg"
                  onClick={() => openAdjust(row)}
                  type="button"
                >
                  <Pencil className="h-3 w-3" /> Ajustes
                </button>
              </td>
            </tr>
          )}
          rows={summary}
        />
      )}

      <Modal
        footer={(
          <>
            <Button className="w-full md:w-auto" disabled={saving} onClick={() => setEditing(null)} variant="secondary">Cancelar</Button>
            <Button className="w-full md:w-auto" loading={saving} onClick={handleSaveAdj}>Guardar ajustes</Button>
          </>
        )}
        onClose={() => setEditing(null)}
        open={editing !== null}
        title={`Ajustes — ${editing?.employee?.name ?? ''}`}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col justify-center rounded-[10px] border border-mash-borderMd bg-mash-bg px-4 py-3 md:col-span-2">
            <p className="text-[12px] font-medium text-mash-text3">Producción del período</p>
            <p className="mt-1 font-mono text-[20px] font-bold text-mash-text1">{formatCurrency(editing?.production ?? 0)}</p>
          </div>

          <Input
            label="Bono (RD$)"
            min="0"
            onChange={(e) => setAdjForm((f) => ({ ...f, bonus: e.target.value }))}
            step="0.01"
            type="number"
            value={adjForm.bonus}
          />
          <Input
            label="Descuento (RD$)"
            min="0"
            onChange={(e) => setAdjForm((f) => ({ ...f, discount: e.target.value }))}
            step="0.01"
            type="number"
            value={adjForm.discount}
          />

          <div className="flex flex-col justify-center rounded-[10px] border border-mash-brand/40 bg-mash-brand/5 px-4 py-3 md:col-span-2">
            <p className="text-[12px] font-medium text-mash-text3">Neto a pagar</p>
            <p className="mt-1 font-mono text-[22px] font-bold text-mash-brand">{formatCurrency(previewNet)}</p>
          </div>

          <div className="md:col-span-2">
            <Textarea
              label="Notas"
              onChange={(e) => setAdjForm((f) => ({ ...f, notes: e.target.value }))}
              value={adjForm.notes}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

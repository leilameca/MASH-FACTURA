import { ClipboardList, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { DataTable } from '../../components/ui/DataTable';
import { EmptyState } from '../../components/ui/EmptyState';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { PageHeader } from '../../components/ui/PageHeader';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Toast } from '../../components/ui/Toast';
import { tarifarioAreas } from '../../constants/options';
import { supabase } from '../../lib/supabaseClient';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { createRow, deleteRow, listRows, updateRow } from '../../services/crudService';

const todayStr = () => new Date().toISOString().slice(0, 10);

function firstOfMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
}

const emptyForm = () => ({
  date: todayStr(),
  employee_id: '',
  tarifario_id: '',
  quantity: '1',
  unit_price: 0,
  notes: '',
});

export function ProductionPage() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tarifario, setTarifario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [startDate, setStartDate] = useState(firstOfMonth);
  const [endDate, setEndDate] = useState(todayStr);
  const [filterEmployee, setFilterEmployee] = useState('');
  const [form, setForm] = useState(emptyForm());

  const load = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('production_records')
        .select('*, employees(id, name, area), tarifario(id, work_name, unit, area)')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false });
      if (error) throw error;
      setRecords(data ?? []);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      listRows('employees', { select: 'id, name, area', orderBy: 'name', ascending: true }),
      listRows('tarifario', { select: 'id, code, work_name, area, unit, price', orderBy: 'area', ascending: true }),
    ])
      .then(([emps, tar]) => { setEmployees(emps); setTarifario(tar); })
      .catch(() => {});
  }, []);

  function openNew() {
    setForm(emptyForm());
    setEditing({});
  }

  function openEdit(row) {
    setForm({
      date: row.date,
      employee_id: row.employee_id,
      tarifario_id: row.tarifario_id,
      quantity: String(row.quantity),
      unit_price: row.unit_price,
      notes: row.notes ?? '',
    });
    setEditing(row);
  }

  function handleTarifarioChange(id) {
    const item = tarifario.find((t) => t.id === id);
    setForm((f) => ({ ...f, tarifario_id: id, unit_price: item?.price ?? 0 }));
  }

  const total = Number(form.quantity || 0) * Number(form.unit_price || 0);

  async function handleSave() {
    if (!form.employee_id || !form.tarifario_id || !form.date) {
      setToast({ type: 'error', message: 'Selecciona empleado, trabajo y fecha.' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        date: form.date,
        employee_id: form.employee_id,
        tarifario_id: form.tarifario_id,
        quantity: Number(form.quantity),
        unit_price: Number(form.unit_price),
        total,
        notes: form.notes || null,
      };
      if (editing?.id) {
        await updateRow('production_records', editing.id, payload);
      } else {
        await createRow('production_records', payload);
      }
      setToast({ type: 'success', message: editing?.id ? 'Registro actualizado.' : 'Producción registrada.' });
      setEditing(null);
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true);
    try {
      await deleteRow('production_records', deleting.id);
      setToast({ type: 'success', message: 'Registro eliminado.' });
      setDeleting(null);
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  const filtered = filterEmployee ? records.filter((r) => r.employee_id === filterEmployee) : records;
  const grandTotal = filtered.reduce((sum, r) => sum + Number(r.total || 0), 0);

  return (
    <div className="space-y-6">
      <Toast message={toast?.message} type={toast?.type} />

      <PageHeader
        actions={<Button icon={Plus} onClick={openNew}>Nueva entrada</Button>}
        count={filtered.length ? String(filtered.length) : undefined}
        subtitle="Registro diario de trabajos realizados por cada empleado."
        title="Producción"
      />

      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-mash-text3">Desde</span>
          <input
            className="rounded-[10px] border border-mash-borderMd bg-white px-3.5 py-2 text-sm text-mash-text1 outline-none focus:border-mash-brand"
            onChange={(e) => setStartDate(e.target.value)}
            type="date"
            value={startDate}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-mash-text3">Hasta</span>
          <input
            className="rounded-[10px] border border-mash-borderMd bg-white px-3.5 py-2 text-sm text-mash-text1 outline-none focus:border-mash-brand"
            onChange={(e) => setEndDate(e.target.value)}
            type="date"
            value={endDate}
          />
        </div>
        <select
          className="rounded-[10px] border border-mash-borderMd bg-white px-3.5 py-2 text-sm text-mash-text1 outline-none focus:border-mash-brand"
          onChange={(e) => setFilterEmployee(e.target.value)}
          value={filterEmployee}
        >
          <option value="">Todos los empleados</option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
      </div>

      {filtered.length > 0 && (
        <Card className="flex items-center justify-between p-4">
          <span className="text-sm text-mash-text3">Total producción del período</span>
          <span className="font-mono text-lg font-bold text-mash-brand">{formatCurrency(grandTotal)}</span>
        </Card>
      )}

      {!loading && !filtered.length && (
        <EmptyState
          description="Registra la producción diaria de cada empleado seleccionando el trabajo del tarifario."
          icon={ClipboardList}
          title="Sin registros en este período"
        />
      )}

      <div className="space-y-3 md:hidden">
        {filtered.map((row) => (
          <Card className="p-4" key={row.id}>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[15px] font-semibold text-mash-text1">{row.employees?.name}</p>
                <p className="mt-0.5 text-[13px] text-mash-text3">{row.tarifario?.work_name}</p>
                <p className="mt-1 text-[13px] text-mash-text3">
                  {formatDate(row.date + 'T00:00:00')} · {row.quantity} × {formatCurrency(row.unit_price)}
                </p>
              </div>
              <div className="text-right">
                <p className="font-mono text-[15px] font-semibold text-mash-text1">{formatCurrency(row.total)}</p>
                <div className="mt-2 flex justify-end gap-1">
                  <IconBtn icon={Pencil} onClick={() => openEdit(row)} />
                  <IconBtn destructive icon={Trash2} onClick={() => setDeleting(row)} />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length > 0 && (
        <DataTable
          columns={[
            { key: 'date', label: 'Fecha' },
            { key: 'employee', label: 'Empleado' },
            { key: 'work', label: 'Trabajo' },
            { key: 'quantity', label: 'Cant.', align: 'right' },
            { key: 'unit_price', label: 'Precio unit.', align: 'right' },
            { key: 'total', label: 'Total', align: 'right' },
            { key: 'actions', label: 'Acciones', align: 'right' },
          ]}
          renderRow={(row) => (
            <tr className="border-b border-mash-surface2 transition hover:bg-mash-bg" key={row.id}>
              <td className="px-4 py-4 text-sm text-mash-text2">{formatDate(row.date + 'T00:00:00')}</td>
              <td className="px-4 py-4">
                <p className="text-sm font-medium text-mash-text1">{row.employees?.name}</p>
                <p className="text-xs text-mash-text3">{row.employees?.area}</p>
              </td>
              <td className="px-4 py-4 text-sm text-mash-text2">{row.tarifario?.work_name}</td>
              <td className="px-4 py-4 text-right font-mono text-sm text-mash-text2">{row.quantity}</td>
              <td className="px-4 py-4 text-right font-mono text-sm text-mash-text2">{formatCurrency(row.unit_price)}</td>
              <td className="px-4 py-4 text-right font-mono text-sm font-bold text-mash-text1">{formatCurrency(row.total)}</td>
              <td className="px-4 py-4 text-right">
                <div className="flex justify-end gap-1">
                  <IconBtn icon={Pencil} onClick={() => openEdit(row)} />
                  <IconBtn destructive icon={Trash2} onClick={() => setDeleting(row)} />
                </div>
              </td>
            </tr>
          )}
          rows={filtered}
        />
      )}

      <Modal
        footer={(
          <>
            <Button className="w-full md:w-auto" disabled={saving} onClick={() => setEditing(null)} variant="secondary">Cancelar</Button>
            <Button className="w-full md:w-auto" loading={saving} onClick={handleSave}>Guardar</Button>
          </>
        )}
        onClose={() => setEditing(null)}
        open={editing !== null}
        size="lg"
        title={editing?.id ? 'Editar entrada' : 'Nueva entrada de producción'}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Fecha"
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            type="date"
            value={form.date}
          />
          <Select
            label="Empleado"
            onChange={(e) => setForm((f) => ({ ...f, employee_id: e.target.value }))}
            value={form.employee_id}
          >
            <option value="">Seleccionar empleado</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>{e.name} — {e.area}</option>
            ))}
          </Select>

          <div className="md:col-span-2">
            <Select
              label="Trabajo del tarifario"
              onChange={(e) => handleTarifarioChange(e.target.value)}
              value={form.tarifario_id}
            >
              <option value="">Seleccionar trabajo</option>
              {tarifarioAreas.map((area) => {
                const items = tarifario.filter((t) => t.area === area);
                if (!items.length) return null;
                return (
                  <optgroup key={area} label={area.charAt(0).toUpperCase() + area.slice(1)}>
                    {items.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.code} — {t.work_name} ({formatCurrency(t.price)} / {t.unit})
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </Select>
          </div>

          <Input
            label="Cantidad"
            min="0.01"
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
            step="0.01"
            type="number"
            value={form.quantity}
          />

          <div className="flex flex-col justify-center rounded-[10px] border border-mash-borderMd bg-mash-bg px-4 py-3">
            <p className="text-[12px] font-medium text-mash-text3">Precio unitario (del tarifario)</p>
            <p className="mt-1 font-mono text-[17px] font-semibold text-mash-text1">{formatCurrency(Number(form.unit_price))}</p>
          </div>

          <div className="flex flex-col justify-center rounded-[10px] border border-mash-brand/40 bg-mash-brand/5 px-4 py-3 md:col-span-2">
            <p className="text-[12px] font-medium text-mash-text3">Total calculado</p>
            <p className="mt-1 font-mono text-[22px] font-bold text-mash-brand">{formatCurrency(total)}</p>
          </div>

          <div className="md:col-span-2">
            <Textarea
              label="Notas (opcional)"
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              value={form.notes}
            />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        description="Se eliminará este registro de producción permanentemente."
        loading={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        open={Boolean(deleting)}
      />
    </div>
  );
}

function IconBtn({ icon: Icon, onClick, destructive = false }) {
  return (
    <button
      className={cn(
        'grid h-9 w-9 place-items-center rounded-[10px] text-mash-text3 hover:bg-mash-surface2 hover:text-mash-text1',
        destructive && 'hover:bg-red-50 hover:text-red-800',
      )}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

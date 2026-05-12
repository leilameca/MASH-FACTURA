import { Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Toast } from '../ui/Toast';
import { formatCurrency, formatDate } from '../../lib/utils';
import { createRow, deleteRow, listRows, updateRow } from '../../services/crudService';

export function OrderMaterials({ orderId }) {
  const [materials, setMaterials] = useState([]);
  const [usage, setUsage] = useState([]);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ inventory_item_id: '', quantity: '', notes: '' });

  const selectedMaterial = useMemo(
    () => materials.find((item) => item.id === form.inventory_item_id),
    [form.inventory_item_id, materials],
  );

  const load = useCallback(async () => {
    try {
      const [inventoryRows, usageRows] = await Promise.all([
        listRows('inventory_items', { filters: { is_active: true }, orderBy: 'name', ascending: true }),
        listRows('order_materials', {
          select: '*, inventory_items(name,unit,unit_cost)',
          filters: { order_id: orderId },
          orderBy: 'created_at',
        }),
      ]);
      setMaterials(inventoryRows);
      setUsage(usageRows);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  async function addMaterial() {
    if (!form.inventory_item_id || !form.quantity) return;
    setLoading(true);
    try {
      const quantity = Number(form.quantity);
      const unitCost = Number(selectedMaterial?.unit_cost || 0);

      await createRow('order_materials', {
        order_id: orderId,
        inventory_item_id: form.inventory_item_id,
        quantity,
        unit_cost: unitCost,
        total_cost: quantity * unitCost,
        notes: form.notes || null,
      });

      if (selectedMaterial) {
        await updateRow('inventory_items', selectedMaterial.id, {
          current_stock: Math.max(Number(selectedMaterial.current_stock || 0) - quantity, 0),
        });
      }

      setForm({ inventory_item_id: '', quantity: '', notes: '' });
      setToast({ type: 'success', message: 'Material registrado en el pedido.' });
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }

  async function removeMaterial(row) {
    setLoading(true);
    try {
      await deleteRow('order_materials', row.id);
      const material = materials.find((item) => item.id === row.inventory_item_id);
      if (material) {
        await updateRow('inventory_items', material.id, {
          current_stock: Number(material.current_stock || 0) + Number(row.quantity || 0),
        });
      }
      setToast({ type: 'success', message: 'Material removido del pedido.' });
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }

  const totalCost = usage.reduce((sum, row) => sum + Number(row.total_cost || 0), 0);

  return (
    <div className="space-y-5">
      <Toast message={toast?.message} type={toast?.type} />

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-mash-text1">Materiales usados</h3>
            <p className="text-sm text-mash-text3">Descuenta materiales del inventario y calcula costo real del pedido.</p>
          </div>
          <p className="font-mono text-sm font-semibold text-mash-text1">{formatCurrency(totalCost)}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1.4fr_120px_1fr_auto]">
          <Select
            label="Material"
            onChange={(event) => setForm((current) => ({ ...current, inventory_item_id: event.target.value }))}
            value={form.inventory_item_id}
          >
            <option value="">Seleccionar material</option>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.name} · {material.current_stock ?? 0} {material.unit}
              </option>
            ))}
          </Select>
          <Input
            label="Cantidad"
            onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
            step="0.01"
            type="number"
            value={form.quantity}
          />
          <Input
            label="Nota"
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
            value={form.notes}
          />
          <Button className="md:mt-6" disabled={!form.inventory_item_id || !form.quantity} icon={Plus} loading={loading} onClick={addMaterial}>
            Agregar
          </Button>
        </div>
      </Card>

      <Card>
        <div className="space-y-2">
          {usage.map((row) => (
            <div className="flex items-center justify-between gap-3 rounded-xl bg-mash-bg p-3" key={row.id}>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-mash-text1">{row.inventory_items?.name || 'Material'}</p>
                <p className="text-xs text-mash-text3">
                  {row.quantity} {row.inventory_items?.unit || ''} · {formatDate(row.created_at)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-semibold text-mash-text1">{formatCurrency(row.total_cost)}</p>
                <button className="grid h-9 w-9 place-items-center rounded-[10px] text-red-800 hover:bg-red-50" onClick={() => removeMaterial(row)} type="button">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {!usage.length ? <p className="text-sm text-mash-text3">Sin materiales registrados en este pedido.</p> : null}
        </div>
      </Card>
    </div>
  );
}

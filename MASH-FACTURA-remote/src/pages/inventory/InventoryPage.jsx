import { Boxes } from 'lucide-react';
import { CrudModule } from '../../components/features/CrudModule';

const categoryOptions = [
  'madera',
  'aluminio',
  'tela',
  'cojines',
  'cristal',
  'tornilleria',
  'pintura',
  'herramientas',
  'otros',
].map((value) => ({ value, label: value }));

export function InventoryPage() {
  return (
    <CrudModule
      actionLabel="Nuevo material"
      columns={[
        { key: 'name', label: 'Material' },
        { key: 'category', label: 'Categoría' },
        { key: 'unit', label: 'Unidad' },
        { key: 'current_stock', label: 'Existencia', type: 'number', align: 'right' },
        { key: 'unit_cost', label: 'Costo unitario', type: 'currency', align: 'right' },
        { key: 'is_active', label: 'Estado', type: 'boolean' },
      ]}
      emptyDescription="Registra madera, tela, aluminio, tornillería y otros materiales para descontarlos en pedidos."
      emptyIcon={Boxes}
      emptyTitle="Sin materiales en inventario"
      fields={[
        { name: 'name', label: 'Nombre del material', required: true },
        { name: 'category', label: 'Categoría', type: 'select', options: categoryOptions },
        { name: 'unit', label: 'Unidad', required: true },
        { name: 'current_stock', label: 'Existencia actual', type: 'number', step: '0.01' },
        { name: 'minimum_stock', label: 'Mínimo recomendado', type: 'number', step: '0.01' },
        { name: 'unit_cost', label: 'Costo unitario', type: 'number', step: '0.01' },
        { name: 'supplier_id', label: 'Suplidor', type: 'lookup', lookupTable: 'suppliers', lookupLabel: 'name', lookupOrderBy: 'name' },
        { name: 'notes', label: 'Notas', type: 'textarea', full: true },
        { name: 'is_active', label: 'Activo', type: 'checkbox' },
      ]}
      filters={[{ name: 'category', options: categoryOptions }]}
      getSubtitle={(row) => `${row.current_stock ?? 0} ${row.unit || ''} · costo ${row.unit_cost ?? 0}`}
      getTitle={(row) => row.name}
      searchColumns={['name', 'category', 'unit', 'notes']}
      subtitle="Materiales, costos y existencias para producción."
      table="inventory_items"
      title="Inventario"
    />
  );
}

import { ShoppingBag } from 'lucide-react';
import { CrudModule } from '../../components/features/CrudModule';
import { productCategories } from '../../constants/options';

const categoryOptions = productCategories.map((value) => ({ value, label: value }));

export function ProductsPage() {
  return (
    <CrudModule
      actionLabel="Nuevo producto"
      columns={[
        { key: 'name', label: 'Producto' },
        { key: 'category', label: 'Categoría' },
        { key: 'suggested_price', label: 'Precio', type: 'currency', align: 'right' },
        { key: 'internal_cost', label: 'Costo', type: 'currency', align: 'right' },
        { key: 'estimated_margin', label: 'Margen', accessor: (row) => `${Math.round(Number(row.estimated_margin || 0) * 100)}%`, align: 'right' },
        { key: 'is_active', label: 'Estado', type: 'boolean' },
      ]}
      emptyDescription="Agrega muebles, servicios y variaciones para usarlos en cotizaciones y facturas."
      emptyIcon={ShoppingBag}
      emptyTitle="Sin productos aún"
      fields={[
        { name: 'name', label: 'Nombre', required: true },
        { name: 'category', label: 'Categoría', type: 'select', options: categoryOptions, required: true },
        { name: 'suggested_price', label: 'Precio sugerido', type: 'number', step: '0.01' },
        { name: 'internal_cost', label: 'Costo interno', type: 'number', step: '0.01' },
        { name: 'image_url', label: 'URL de imagen' },
        { name: 'description', label: 'Descripción', type: 'textarea', full: true },
        { name: 'is_active', label: 'Activo', type: 'checkbox' },
      ]}
      filters={[{ name: 'category', options: categoryOptions }]}
      getSubtitle={(row) => `${row.category || 'Sin categoría'} · ${row.description || 'Sin descripción'}`}
      getTitle={(row) => row.name}
      searchColumns={['name', 'category', 'description']}
      subtitle="Catálogo reutilizable para cotizaciones, facturas y reparaciones."
      table="products"
      title="Productos y servicios"
    />
  );
}

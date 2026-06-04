import { Tag } from 'lucide-react';
import { CrudModule } from '../../components/features/CrudModule';
import { tarifarioAreas, tarifarioUnits } from '../../constants/options';

const areaOptions = tarifarioAreas.map((v) => ({
  value: v,
  label: v.charAt(0).toUpperCase() + v.slice(1),
}));

const unitOptions = tarifarioUnits.map((v) => ({ value: v, label: v }));

export function TarifarioPage() {
  return (
    <CrudModule
      actionLabel="Nuevo trabajo"
      columns={[
        { key: 'code', label: 'Código' },
        { key: 'work_name', label: 'Trabajo' },
        { key: 'area', label: 'Área', accessor: (row) => row.area ? row.area.charAt(0).toUpperCase() + row.area.slice(1) : '—' },
        { key: 'unit', label: 'Unidad' },
        { key: 'price', label: 'Precio', type: 'currency', align: 'right' },
        { key: 'is_active', label: 'Estado', type: 'boolean' },
      ]}
      emptyDescription="Define los trabajos y sus precios para calcular automáticamente la producción de cada empleado."
      emptyIcon={Tag}
      emptyTitle="Sin trabajos en el tarifario"
      fields={[
        { name: 'code', label: 'Código', required: true, placeholder: 'TEJ-01' },
        { name: 'work_name', label: 'Nombre del trabajo', required: true },
        { name: 'area', label: 'Área', type: 'select', options: areaOptions, required: true },
        { name: 'unit', label: 'Unidad', type: 'select', options: unitOptions },
        { name: 'price', label: 'Precio (RD$)', type: 'number', step: '0.01', required: true },
        { name: 'notes', label: 'Notas', type: 'textarea', full: true },
        { name: 'is_active', label: 'Activo', type: 'checkbox' },
      ]}
      filters={[{ name: 'area', options: areaOptions }]}
      getSubtitle={(row) => `${row.code ?? ''} · ${row.area ?? ''}`}
      getTitle={(row) => row.work_name}
      orderBy="area"
      searchColumns={['code', 'work_name', 'area']}
      subtitle="Precios estándar por tipo de trabajo. Solo el admin puede modificarlos."
      table="tarifario"
      title="Tarifario"
    />
  );
}

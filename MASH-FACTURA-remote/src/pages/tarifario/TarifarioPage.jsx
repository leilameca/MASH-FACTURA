import { Tag } from 'lucide-react';
import { CrudModule } from '../../components/features/CrudModule';
import { tarifarioAreas, tarifarioUnits } from '../../constants/options';
import { createRow, listRows } from '../../services/crudService';

const areaOptions = tarifarioAreas.map((v) => ({
  value: v,
  label: v.charAt(0).toUpperCase() + v.slice(1),
}));

const unitOptions = tarifarioUnits.map((v) => ({ value: v, label: v }));

const areaPrefixes = {
  tejido: 'TEJ',
  soldadura: 'SOL',
  pintura: 'PIN',
};

async function generateTarifarioCode(area) {
  const prefix = areaPrefixes[area] ?? area.slice(0, 3).toUpperCase();
  const existing = await listRows('tarifario', { select: 'code' });
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  const maxNum = existing.reduce((max, t) => {
    const match = t.code?.match(pattern);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `${prefix}-${String(maxNum + 1).padStart(2, '0')}`;
}

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
      onCreate={async (payload) => {
        const code = await generateTarifarioCode(payload.area);
        await createRow('tarifario', { ...payload, code });
      }}
      orderBy="area"
      searchColumns={['code', 'work_name', 'area']}
      subtitle="Precios estándar por tipo de trabajo. Solo el admin puede modificarlos."
      table="tarifario"
      title="Tarifario"
    />
  );
}

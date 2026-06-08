import { Users2 } from 'lucide-react';
import { CrudModule } from '../../components/features/CrudModule';
import { employeeAreas, employeePaymentTypes } from '../../constants/options';
import { createRow, deleteRow, listRows } from '../../services/crudService';

const areaOptions = employeeAreas.map((v) => ({
  value: v,
  label: v.charAt(0).toUpperCase() + v.slice(1),
}));

const paymentTypeLabels = Object.fromEntries(employeePaymentTypes.map((t) => [t.value, t.label]));

async function deleteEmployee(employee) {
  await deleteRow('employees', employee.id);
}

async function generateEmployeeId() {
  const existing = await listRows('employees', { select: 'employee_id' });
  const maxNum = existing.reduce((max, e) => {
    const match = e.employee_id?.match(/^EMP-(\d+)$/);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 0);
  return `EMP-${String(maxNum + 1).padStart(3, '0')}`;
}

export function EmployeesPage() {
  return (
    <CrudModule
      actionLabel="Nuevo empleado"
      columns={[
        { key: 'employee_id', label: 'ID' },
        { key: 'name', label: 'Nombre' },
        { key: 'area', label: 'Área', accessor: (row) => row.area ? row.area.charAt(0).toUpperCase() + row.area.slice(1) : '—' },
        { key: 'payment_type', label: 'Tipo de pago', accessor: (row) => paymentTypeLabels[row.payment_type] ?? row.payment_type ?? '—' },
        { key: 'phone', label: 'Teléfono' },
        { key: 'hire_date', label: 'Ingreso', type: 'date' },
        { key: 'is_active', label: 'Estado', type: 'boolean' },
      ]}
      emptyDescription="Registra el personal de cada área para llevar el control de producción y nómina."
      emptyIcon={Users2}
      emptyTitle="Sin empleados registrados"
      fields={[
        { name: 'name', label: 'Nombre completo', required: true },
        { name: 'area', label: 'Área', type: 'select', options: areaOptions, required: true },
        { name: 'payment_type', label: 'Tipo de pago', type: 'select', options: employeePaymentTypes },
        { name: 'phone', label: 'Teléfono' },
        { name: 'hire_date', label: 'Fecha de ingreso', type: 'date' },
        { name: 'notes', label: 'Notas', type: 'textarea', full: true },
        { name: 'is_active', label: 'Empleado activo', type: 'checkbox', full: true },
      ]}
      filters={[{ name: 'area', options: areaOptions }]}
      getSubtitle={(row) => `${row.employee_id ?? ''} · ${row.area ?? ''}`}
      getTitle={(row) => row.name}
      onDelete={deleteEmployee}
      onCreate={async (payload) => {
        const employee_id = await generateEmployeeId();
        await createRow('employees', { ...payload, employee_id });
      }}
      orderBy="name"
      searchColumns={['employee_id', 'name', 'phone']}
      subtitle="Registro maestro del personal de producción."
      table="employees"
      title="Empleados"
    />
  );
}

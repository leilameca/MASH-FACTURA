import { Users2 } from 'lucide-react';
import { CrudModule } from '../../components/features/CrudModule';
import { employeeAreas, employeePaymentTypes } from '../../constants/options';

const areaOptions = employeeAreas.map((v) => ({
  value: v,
  label: v.charAt(0).toUpperCase() + v.slice(1),
}));

const paymentTypeLabels = Object.fromEntries(employeePaymentTypes.map((t) => [t.value, t.label]));

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
        { name: 'employee_id', label: 'ID Empleado', required: true, placeholder: 'EMP-001' },
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
      orderBy="name"
      searchColumns={['employee_id', 'name', 'phone']}
      subtitle="Registro maestro del personal de producción."
      table="employees"
      title="Empleados"
    />
  );
}

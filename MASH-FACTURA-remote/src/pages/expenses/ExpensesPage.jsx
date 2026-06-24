import { TrendingDown } from 'lucide-react';
import { CrudModule } from '../../components/features/CrudModule';
import { expenseCategories, paymentMethods } from '../../constants/options';

const categoryOptions = expenseCategories.map((value) => ({ value, label: value }));
const methodOptions = paymentMethods.map((value) => ({ value, label: value }));

export function ExpensesPage() {
  return (
    <CrudModule
      actionLabel="Registrar gasto"
      columns={[
        { key: 'description', label: 'Descripción' },
        { key: 'category', label: 'Categoría' },
        { key: 'supplier_name', label: 'Suplidor', accessor: (row) => row.suppliers?.name },
        { key: 'expense_date', label: 'Fecha', type: 'date' },
        { key: 'amount', label: 'Monto', type: 'currency', align: 'right' },
      ]}
      emptyDescription="Registra los gastos del negocio para tener control de tus márgenes."
      emptyIcon={TrendingDown}
      emptyTitle="Sin gastos este mes"
      fields={[
        { name: 'description', label: 'Descripción', required: true },
        { name: 'category', label: 'Categoría', type: 'select', options: categoryOptions },
        { name: 'supplier_id', label: 'Suplidor', type: 'lookup', lookupTable: 'suppliers', lookupLabel: 'name', lookupOrderBy: 'name' },
        { name: 'amount', label: 'Monto', type: 'number', step: '0.01', required: true },
        { name: 'expense_date', label: 'Fecha', type: 'date' },
        { name: 'payment_method', label: 'Método de pago', type: 'select', options: methodOptions },
        { name: 'receipt_url', label: 'URL del recibo' },
        { name: 'notes', label: 'Notas', type: 'textarea', full: true },
      ]}
      filters={[{ name: 'category', options: categoryOptions }]}
      getSubtitle={(row) => `${row.category} · ${row.suppliers?.name || 'Sin suplidor'}`}
      getTitle={(row) => row.description}
      searchColumns={['description', 'notes']}
      select="*, suppliers(name)"
      subtitle="Materiales, servicios, nómina, envíos y otros costos."
      table="expenses"
      title="Gastos"
    />
  );
}

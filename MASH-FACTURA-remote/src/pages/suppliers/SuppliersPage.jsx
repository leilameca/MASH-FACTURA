import { Truck } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { CrudModule } from '../../components/features/CrudModule';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { paymentMethods } from '../../constants/options';
import { formatCurrency, formatDate } from '../../lib/utils';
import { createRow, listRows } from '../../services/crudService';

const methodOptions = paymentMethods.map((value) => ({ value, label: value }));

export function SuppliersPage() {
  return (
    <CrudModule
      actionLabel="Nuevo suplidor"
      columns={[
        { key: 'name', label: 'Suplidor' },
        { key: 'contact_name', label: 'Contacto' },
        { key: 'phone', label: 'Teléfono' },
        { key: 'category', label: 'Categoría' },
        { key: 'is_active', label: 'Estado', type: 'boolean' },
      ]}
      emptyDescription="Centraliza proveedores, contactos, categorías y compras relacionadas."
      emptyIcon={Truck}
      emptyTitle="Sin suplidores aún"
      detail={(supplier) => <SupplierDetail supplier={supplier} />}
      fields={[
        { name: 'name', label: 'Nombre', required: true },
        { name: 'contact_name', label: 'Contacto' },
        { name: 'phone', label: 'Teléfono' },
        { name: 'whatsapp', label: 'WhatsApp' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'category', label: 'Categoría' },
        { name: 'tax_id', label: 'RNC/Cédula' },
        { name: 'address', label: 'Dirección', full: true },
        { name: 'notes', label: 'Notas', type: 'textarea', full: true },
        { name: 'is_active', label: 'Activo', type: 'checkbox' },
      ]}
      getSubtitle={(row) => `${row.contact_name || 'Sin contacto'} · ${row.phone || 'Sin teléfono'}`}
      getTitle={(row) => row.name}
      searchColumns={['name', 'contact_name', 'phone', 'email', 'category']}
      subtitle="Proveedores, materiales y compras recurrentes."
      table="suppliers"
      title="Suplidores"
    />
  );
}

function SupplierDetail({ supplier }) {
  const [expenses, setExpenses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ amount: '', payment_method: 'transferencia', payment_date: new Date().toISOString().slice(0, 10), reference: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [expenseRows, paymentRows] = await Promise.all([
        listRows('expenses', { filters: { supplier_id: supplier.id }, orderBy: 'expense_date' }),
        listRows('supplier_payments', { filters: { supplier_id: supplier.id }, orderBy: 'payment_date' }),
      ]);
      setExpenses(expenseRows);
      setPayments(paymentRows);
    } catch (err) {
      setError(err.message);
    }
  }, [supplier.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function savePayment() {
    setLoading(true);
    setError('');
    try {
      await createRow('supplier_payments', {
        supplier_id: supplier.id,
        amount: Number(form.amount),
        payment_method: form.payment_method,
        payment_date: form.payment_date,
        reference: form.reference || null,
        notes: form.notes || null,
      });
      setForm((current) => ({ ...current, amount: '', reference: '', notes: '' }));
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const totalExpenses = expenses.reduce((sum, row) => sum + Number(row.amount || 0), 0);
  const totalPayments = payments.reduce((sum, row) => sum + Number(row.amount || 0), 0);

  return (
    <div className="space-y-5">
      {error ? <Card className="border-red-200 bg-red-50 text-sm text-red-900">{error}</Card> : null}
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-4"><p className="text-xs text-mash-text3">Gastos</p><p className="mt-2 font-mono text-xl font-bold">{formatCurrency(totalExpenses)}</p></Card>
        <Card className="p-4"><p className="text-xs text-mash-text3">Pagos</p><p className="mt-2 font-mono text-xl font-bold">{formatCurrency(totalPayments)}</p></Card>
        <Card className="p-4"><p className="text-xs text-mash-text3">Balance estimado</p><p className="mt-2 font-mono text-xl font-bold">{formatCurrency(totalExpenses - totalPayments)}</p></Card>
      </div>

      <Card>
        <h3 className="mb-4 text-base font-semibold text-mash-text1">Registrar pago al suplidor</h3>
        <div className="grid gap-3 md:grid-cols-5">
          <Input label="Monto" onChange={(event) => setForm({ ...form, amount: event.target.value })} step="0.01" type="number" value={form.amount} />
          <Select label="Método" onChange={(event) => setForm({ ...form, payment_method: event.target.value })} value={form.payment_method}>
            {methodOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </Select>
          <Input label="Fecha" onChange={(event) => setForm({ ...form, payment_date: event.target.value })} type="date" value={form.payment_date} />
          <Input label="Referencia" onChange={(event) => setForm({ ...form, reference: event.target.value })} value={form.reference} />
          <Button className="md:mt-6" disabled={!form.amount} loading={loading} onClick={savePayment}>Registrar</Button>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <HistoryList amountKey="amount" dateKey="expense_date" rows={expenses} title="Compras y gastos" />
        <HistoryList amountKey="amount" dateKey="payment_date" rows={payments} title="Pagos realizados" />
      </div>
    </div>
  );
}

function HistoryList({ title, rows, amountKey, dateKey }) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-mash-text1">{title}</h3>
        <Badge>{rows.length}</Badge>
      </div>
      <div className="space-y-2">
        {rows.map((row) => (
          <div className="flex items-center justify-between rounded-xl bg-mash-bg p-3" key={row.id}>
            <div>
              <p className="text-sm font-medium text-mash-text1">{row.description || row.reference || row.payment_method}</p>
              <p className="text-xs text-mash-text3">{formatDate(row[dateKey] || row.created_at)}</p>
            </div>
            <p className="font-mono text-sm font-semibold">{formatCurrency(row[amountKey])}</p>
          </div>
        ))}
        {!rows.length ? <p className="text-sm text-mash-text3">Sin registros.</p> : null}
      </div>
    </Card>
  );
}

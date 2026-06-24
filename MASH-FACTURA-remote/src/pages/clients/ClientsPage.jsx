import { Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CrudModule } from '../../components/features/CrudModule';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { listRows } from '../../services/crudService';
import { formatCurrency, formatDate } from '../../lib/utils';

export function ClientsPage() {
  return (
    <CrudModule
      actionLabel="Nuevo cliente"
      columns={[
        { key: 'full_name', label: 'Cliente' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Teléfono' },
        { key: 'whatsapp', label: 'WhatsApp' },
        { key: 'created_at', label: 'Creado', type: 'date' },
      ]}
      detail={(client) => <ClientDetail client={client} />}
      emptyDescription="Agrega tu primer cliente para comenzar a gestionar tus ventas."
      emptyIcon={Users}
      emptyTitle="Sin clientes aún"
      fields={[
        { name: 'full_name', label: 'Nombre completo', required: true },
        { name: 'phone', label: 'Teléfono' },
        { name: 'whatsapp', label: 'WhatsApp' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'address', label: 'Dirección', full: true },
        { name: 'reference', label: 'Referencia', full: true },
        { name: 'notes', label: 'Notas', type: 'textarea', full: true },
      ]}
      getSubtitle={(row) => `${row.phone || 'Sin teléfono'} · ${row.email || 'Sin email'}`}
      getTitle={(row) => row.full_name}
      searchColumns={['full_name', 'email', 'phone', 'whatsapp']}
      subtitle="Relaciones, historial y facturación de cada cliente."
      table="clients"
      title="Clientes"
    />
  );
}

function ClientDetail({ client }) {
  const [history, setHistory] = useState({ quotes: [], invoices: [], orders: [], payments: [], documents: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHistory() {
      try {
        const [quotes, invoices, orders, payments, documents] = await Promise.all([
          listRows('quotes', { filters: { client_id: client.id }, orderBy: 'created_at' }),
          listRows('invoices', { filters: { client_id: client.id }, orderBy: 'created_at' }),
          listRows('orders', { filters: { client_id: client.id }, orderBy: 'created_at' }),
          listRows('payments', { filters: { client_id: client.id }, orderBy: 'payment_date' }),
          listRows('documents', { filters: { client_id: client.id }, orderBy: 'created_at' }),
        ]);
        setHistory({ quotes, invoices, orders, payments, documents });
      } catch (err) {
        setError(err.message);
      }
    }
    loadHistory();
  }, [client.id]);

  const groups = [
    { label: 'Cotizaciones', rows: history.quotes, number: 'quote_number', amount: 'total' },
    { label: 'Facturas', rows: history.invoices, number: 'invoice_number', amount: 'total' },
    { label: 'Pedidos', rows: history.orders, number: 'order_number' },
    { label: 'Pagos', rows: history.payments, number: 'payment_method', amount: 'amount', date: 'payment_date' },
    { label: 'Documentos', rows: history.documents, number: 'document_number' },
  ];

  return (
    <div className="space-y-5">
      {error ? <Card className="border-red-200 bg-red-50 text-sm text-red-900">{error}</Card> : null}
      <div className="grid gap-3 md:grid-cols-2">
        {[
          ['Email', client.email],
          ['Teléfono', client.phone],
          ['WhatsApp', client.whatsapp],
          ['Dirección', client.address],
          ['Referencia', client.reference],
          ['Notas', client.notes],
        ].map(([label, value]) => (
          <div className="rounded-2xl border border-mash-border bg-mash-bg p-4" key={label}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-mash-text3">{label}</p>
            <p className="mt-2 text-sm font-medium text-mash-text1">{value || '—'}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((group) => (
          <Card className="p-4" key={group.label}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-mash-text1">{group.label}</h3>
              <Badge>{group.rows.length}</Badge>
            </div>
            <div className="space-y-2">
              {group.rows.slice(0, 5).map((row) => (
                <div className="rounded-xl bg-mash-bg p-3" key={row.id}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-mono text-xs text-mash-text2">{row[group.number] || row.id.slice(0, 8)}</p>
                    {group.amount ? <p className="font-mono text-sm font-semibold text-mash-text1">{formatCurrency(row[group.amount])}</p> : null}
                  </div>
                  <p className="mt-1 text-xs text-mash-text3">{formatDate(row[group.date] || row.created_at)}</p>
                </div>
              ))}
              {!group.rows.length ? <p className="text-sm text-mash-text3">Sin registros.</p> : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

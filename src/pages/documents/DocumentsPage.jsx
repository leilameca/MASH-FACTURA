import { FileBadge } from 'lucide-react';
import { CrudModule } from '../../components/features/CrudModule';
import { documentStatuses, documentTypes, statusLabels } from '../../constants/options';

const typeOptions = documentTypes.map((value) => ({ value, label: value }));
const statusOptions = documentStatuses.map((value) => ({ value, label: statusLabels[value] || value }));

export function DocumentsPage() {
  return (
    <CrudModule
      actionLabel="Registrar documento"
      columns={[
        { key: 'document_number', label: 'Número' },
        { key: 'document_type', label: 'Tipo' },
        { key: 'client_name', label: 'Cliente', accessor: (row) => row.clients?.full_name },
        { key: 'status', label: 'Estado', type: 'status' },
        { key: 'created_at', label: 'Fecha', type: 'date' },
      ]}
      emptyDescription="Aquí vivirán cotizaciones, facturas, garantías y albaranes listos para ver, descargar o compartir."
      emptyIcon={FileBadge}
      emptyTitle="Sin documentos"
      fields={[
        { name: 'client_id', label: 'Cliente', type: 'lookup', lookupTable: 'clients', lookupLabel: 'full_name', lookupOrderBy: 'full_name' },
        { name: 'order_id', label: 'Pedido', type: 'lookup', lookupTable: 'orders', lookupLabel: 'order_number', lookupOrderBy: 'created_at' },
        { name: 'invoice_id', label: 'Factura', type: 'lookup', lookupTable: 'invoices', lookupLabel: 'invoice_number', lookupOrderBy: 'created_at' },
        { name: 'quote_id', label: 'Cotización', type: 'lookup', lookupTable: 'quotes', lookupLabel: 'quote_number', lookupOrderBy: 'created_at' },
        { name: 'repair_id', label: 'Reparación', type: 'lookup', lookupTable: 'repairs', lookupLabel: 'repair_number', lookupOrderBy: 'created_at' },
        { name: 'document_type', label: 'Tipo', type: 'select', options: typeOptions, required: true },
        { name: 'document_number', label: 'Número', required: true },
        { name: 'pdf_url', label: 'URL del PDF', required: true },
        { name: 'status', label: 'Estado', type: 'select', options: statusOptions },
      ]}
      filters={[
        { name: 'document_type', options: typeOptions },
        { name: 'status', options: statusOptions },
      ]}
      getSubtitle={(row) => `${row.document_type} · ${row.clients?.full_name || 'Sin cliente'}`}
      getTitle={(row) => row.document_number}
      searchColumns={['document_number', 'pdf_url']}
      select="*, clients(full_name)"
      subtitle="PDFs corporativos, monocromáticos y listos para cliente."
      table="documents"
      title="Documentos"
    />
  );
}

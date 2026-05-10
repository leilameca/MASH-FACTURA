import { FileText, Package } from 'lucide-react';
import { useState } from 'react';
import { CrudModule } from '../../components/features/CrudModule';
import { ImageManager } from '../../components/features/ImageManager';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { orderStatuses, orderTypes, priorities, statusLabels } from '../../constants/options';
import { getRow, listRows } from '../../services/crudService';
import { generateDeliveryNotePdf, generateWarrantyPdf } from '../../services/pdfService.jsx';

const statusOptions = orderStatuses.map((value) => ({ value, label: statusLabels[value] }));
const priorityOptions = priorities.map((value) => ({ value, label: statusLabels[value] }));
const typeOptions = orderTypes.map((value) => ({ value, label: value }));

export function OrdersPage() {
  const [toast, setToast] = useState(null);
  const [generating, setGenerating] = useState(null);

  async function handleWarrantyPdf(row) {
    setGenerating(row.id);
    try {
      const order = await getRow('orders', row.id, '*, clients(full_name,email,phone)');
      const invoiceItems = await getOrderItems(order);
      await generateWarrantyPdf({ order, client: order.clients, items: invoiceItems });
      setToast({ type: 'success', message: 'Garantía generada y descargada.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setGenerating(null);
    }
  }

  async function handleDeliveryPdf(row) {
    setGenerating(`delivery-${row.id}`);
    try {
      const order = await getRow('orders', row.id, '*, clients(full_name,email,phone)');
      const invoiceItems = await getOrderItems(order);
      await generateDeliveryNotePdf({ order, client: order.clients, items: invoiceItems });
      setToast({ type: 'success', message: 'Albarán de entrega generado y descargado.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setGenerating(null);
    }
  }

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} />
      <CrudModule
        actionLabel="Nuevo pedido"
        columns={[
          { key: 'order_number', label: 'Pedido' },
          { key: 'client_name', label: 'Cliente', accessor: (row) => row.clients?.full_name },
          { key: 'order_type', label: 'Tipo' },
          { key: 'status', label: 'Estado', type: 'status' },
          { key: 'priority', label: 'Prioridad', type: 'status' },
          { key: 'estimated_delivery_date', label: 'Entrega', type: 'date' },
        ]}
        emptyDescription="Aquí aparecerán los pedidos en producción."
        emptyIcon={Package}
        emptyTitle="Sin pedidos activos"
        detail={(order) => (
          <ImageManager
            bucket="order-images"
            foreignKey="order_id"
            parentId={order.id}
            table="order_images"
            title="Imágenes del pedido"
          />
        )}
        fields={[
          { name: 'client_id', label: 'Cliente', type: 'lookup', lookupTable: 'clients', lookupLabel: 'full_name', lookupOrderBy: 'full_name', required: true },
          { name: 'quote_id', label: 'Cotización', type: 'lookup', lookupTable: 'quotes', lookupLabel: 'quote_number', lookupOrderBy: 'created_at' },
          { name: 'invoice_id', label: 'Factura', type: 'lookup', lookupTable: 'invoices', lookupLabel: 'invoice_number', lookupOrderBy: 'created_at' },
          { name: 'order_number', label: 'Número de pedido' },
          { name: 'order_type', label: 'Tipo', type: 'select', options: typeOptions },
          { name: 'status', label: 'Estado', type: 'select', options: statusOptions },
          { name: 'priority', label: 'Prioridad', type: 'select', options: priorityOptions },
          { name: 'estimated_delivery_date', label: 'Fecha estimada', type: 'date' },
          { name: 'actual_delivery_date', label: 'Fecha real', type: 'date' },
          { name: 'internal_notes', label: 'Notas internas', type: 'textarea', full: true },
        ]}
        filters={[
          { name: 'status', options: statusOptions },
          { name: 'priority', options: priorityOptions },
        ]}
        getSubtitle={(row) => `${row.clients?.full_name || 'Cliente'} · ${statusLabels[row.status] || row.status}`}
        getTitle={(row) => row.order_number || `Pedido ${row.id.slice(0, 8)}`}
        rowActions={(row) => (
          <>
            <Button
              disabled={generating === row.id}
              icon={FileText}
              loading={generating === row.id}
              onClick={() => handleWarrantyPdf(row)}
              size="sm"
              variant="champagne"
            >
              Garantía
            </Button>
            <Button
              disabled={generating === `delivery-${row.id}`}
              icon={FileText}
              loading={generating === `delivery-${row.id}`}
              onClick={() => handleDeliveryPdf(row)}
              size="sm"
              variant="secondary"
            >
              Entrega
            </Button>
          </>
        )}
        searchColumns={['order_number', 'internal_notes']}
        select="*, clients(full_name)"
        subtitle="Producción, responsables, prioridades y entregas prometidas."
        table="orders"
        title="Pedidos"
      />
    </>
  );
}

async function getOrderItems(order) {
  if (order.invoice_id) {
    return listRows('invoice_items', { filters: { invoice_id: order.invoice_id }, orderBy: 'sort_order', ascending: true });
  }
  if (order.quote_id) {
    return listRows('quote_items', { filters: { quote_id: order.quote_id }, orderBy: 'sort_order', ascending: true });
  }
  return [];
}

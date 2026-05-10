import { pdf } from '@react-pdf/renderer';
import { DeliveryNotePdf } from '../components/documents/DeliveryNotePdf';
import { FinancialPdf } from '../components/documents/FinancialPdf';
import { PaymentReceiptPdf } from '../components/documents/PaymentReceiptPdf';
import { PickupNotePdf } from '../components/documents/PickupNotePdf';
import { WarrantyPdf } from '../components/documents/WarrantyPdf';
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient';
import { createRow } from './crudService';

export async function generateFinancialPdf({ type, number, client, values, items, links }) {
  const settings = await getBusinessSettings();
  const valuesWithTerms = {
    ...values,
    quote_terms: settings?.quote_terms,
    invoice_terms: settings?.invoice_terms,
  };

  return persistPdfDocument({
    component: <FinancialPdf client={client} items={items} number={number} type={type} values={valuesWithTerms} />,
    path: `${type.toLowerCase()}/${number}.pdf`,
    fileName: `${number}.pdf`,
    documentRow: {
      client_id: links.client_id,
      quote_id: links.quote_id ?? null,
      invoice_id: links.invoice_id ?? null,
      document_type: type === 'FACTURA' ? 'factura' : 'cotizacion',
      document_number: number,
      status: 'generated',
    },
  });
}

async function getBusinessSettings() {
  if (!isSupabaseConfigured) return null;
  const { data } = await supabase.from('business_settings').select('quote_terms,invoice_terms').limit(1).maybeSingle();
  return data;
}

export async function generatePickupNotePdf({ repair, client }) {
  const number = repair?.repair_number || `REP-${repair.id.slice(0, 6)}`;
  const documentNumber = `REC-${number}`;

  return persistPdfDocument({
    component: <PickupNotePdf client={client} repair={repair} />,
    path: `albaran-recogida/${documentNumber}.pdf`,
    fileName: `${documentNumber}.pdf`,
    documentRow: {
      client_id: repair.client_id,
      repair_id: repair.id,
      document_type: 'albaran_recogida',
      document_number: documentNumber,
      status: 'generated',
    },
  });
}

export async function generateWarrantyPdf({ order, client, items }) {
  const number = order?.order_number || `PED-${order.id.slice(0, 6)}`;
  const warrantyNumber = `GAR-${number.replace(/[^0-9]/g, '')}`;

  return persistPdfDocument({
    component: <WarrantyPdf client={client} items={items} order={order} />,
    path: `garantia/${warrantyNumber}.pdf`,
    fileName: `${warrantyNumber}.pdf`,
    documentRow: {
      client_id: order.client_id,
      order_id: order.id,
      invoice_id: order.invoice_id ?? null,
      document_type: 'garantia',
      document_number: warrantyNumber,
      status: 'generated',
    },
  });
}

export async function generateDeliveryNotePdf({ order, client, items }) {
  const number = order?.order_number || `PED-${order.id.slice(0, 6)}`;
  const deliveryNumber = `ENT-${number.replace(/[^0-9]/g, '') || number}`;

  return persistPdfDocument({
    component: <DeliveryNotePdf client={client} items={items} order={order} />,
    path: `albaran-entrega/${deliveryNumber}.pdf`,
    fileName: `${deliveryNumber}.pdf`,
    documentRow: {
      client_id: order.client_id,
      order_id: order.id,
      invoice_id: order.invoice_id ?? null,
      quote_id: order.quote_id ?? null,
      document_type: 'albaran_entrega',
      document_number: deliveryNumber,
      status: 'generated',
    },
  });
}

export async function generatePaymentReceiptPdf({ payment, invoice, client, balanceBefore }) {
  const number = `REC-${payment.id.slice(0, 8).toUpperCase()}`;

  return persistPdfDocument({
    component: <PaymentReceiptPdf balanceBefore={balanceBefore} client={client} invoice={invoice} payment={payment} />,
    path: `recibo-pago/${number}.pdf`,
    fileName: `${number}.pdf`,
    documentRow: {
      client_id: payment.client_id,
      invoice_id: payment.invoice_id ?? null,
      document_type: 'recibo_pago',
      document_number: number,
      status: 'generated',
    },
  });
}

async function persistPdfDocument({ component, path, fileName, documentRow }) {
  const blob = await pdf(component).toBlob();

  if (!isSupabaseConfigured) {
    return downloadBlob(blob, fileName);
  }

  const { error } = await supabase.storage.from('generated-documents').upload(path, blob, {
    contentType: 'application/pdf',
    upsert: true,
  });
  if (error) throw error;

  const { data, error: signedError } = await supabase.storage.from('generated-documents').createSignedUrl(path, 60 * 60 * 24 * 365);
  if (signedError) throw signedError;

  await createRow('documents', {
    ...documentRow,
    pdf_url: data.signedUrl,
    storage_path: path,
  });

  return data.signedUrl;
}

function downloadBlob(blob, fileName) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  return url;
}

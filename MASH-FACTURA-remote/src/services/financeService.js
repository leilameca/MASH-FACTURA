import { supabase } from '../lib/supabaseClient';
import { createRow } from './crudService';

export function calculateTotals(values, items = []) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0), 0);
  const discount = Number(values.discount || 0);
  const deliveryFee = Number(values.delivery_fee || 0);
  const pickupFee = Number(values.pickup_fee || 0);
  const installationFee = Number(values.installation_fee || 0);
  const taxableBase = Math.max(subtotal - discount, 0);
  const taxAmount = values.tax_enabled ? taxableBase * 0.18 : 0;
  const total = Math.max(taxableBase + taxAmount + deliveryFee + pickupFee + installationFee, 0);

  return {
    subtotal: roundMoney(subtotal),
    discount: roundMoney(discount),
    tax_amount: roundMoney(taxAmount),
    delivery_fee: roundMoney(deliveryFee),
    pickup_fee: roundMoney(pickupFee),
    installation_fee: roundMoney(installationFee),
    total: roundMoney(total),
  };
}

export function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

export async function registerPayment(values) {
  const payment = await createRow('payments', values);
  if (!values.invoice_id) return payment;

  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .select('id,total,amount_paid')
    .eq('id', values.invoice_id)
    .single();

  if (invoiceError) throw invoiceError;

  const amountPaid = roundMoney(Number(invoice.amount_paid || 0) + Number(values.amount || 0));
  const balance = roundMoney(Number(invoice.total || 0) - amountPaid);
  const status = balance <= 0 ? 'paid' : amountPaid > 0 ? 'partially_paid' : 'issued';

  const { error: updateError } = await supabase
    .from('invoices')
    .update({ amount_paid: amountPaid, status, payment_method: values.payment_method })
    .eq('id', invoice.id);

  if (updateError) throw updateError;
  return payment;
}

import { CreditCard, FileText } from 'lucide-react';
import { useState } from 'react';
import { CrudModule } from '../../components/features/CrudModule';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { paymentMethods } from '../../constants/options';
import { registerPayment } from '../../services/financeService';
import { getRow } from '../../services/crudService';
import { generatePaymentReceiptPdf } from '../../services/pdfService.jsx';

const methodOptions = paymentMethods.map((value) => ({ value, label: value }));

export function PaymentsPage() {
  const [toast, setToast] = useState(null);
  const [generating, setGenerating] = useState(null);

  async function handleReceipt(row) {
    setGenerating(row.id);
    try {
      const payment = await getRow('payments', row.id, '*, clients(full_name,email,phone), invoices(invoice_number,total,amount_paid,balance_due,status)');
      const invoice = payment.invoices;
      const balanceBefore = Number(invoice?.balance_due || 0) + Number(payment.amount || 0);
      await generatePaymentReceiptPdf({
        payment,
        invoice,
        client: payment.clients,
        balanceBefore,
      });
      setToast({ type: 'success', message: 'Recibo de pago generado y descargado.' });
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
        actionLabel="Registrar pago"
        columns={[
          { key: 'client_name', label: 'Cliente', accessor: (row) => row.clients?.full_name },
          { key: 'invoice_number', label: 'Factura', accessor: (row) => row.invoices?.invoice_number },
          { key: 'payment_method', label: 'Método' },
          { key: 'payment_date', label: 'Fecha', type: 'date' },
          { key: 'amount', label: 'Monto', type: 'currency', align: 'right' },
        ]}
        emptyDescription="Los pagos parciales y completos aparecerán aquí con referencia y método de pago."
        emptyIcon={CreditCard}
        emptyTitle="Sin pagos registrados"
        fields={[
          { name: 'client_id', label: 'Cliente', type: 'lookup', lookupTable: 'clients', lookupLabel: 'full_name', lookupOrderBy: 'full_name', required: true },
          { name: 'invoice_id', label: 'Factura', type: 'lookup', lookupTable: 'invoices', lookupLabel: 'invoice_number', lookupOrderBy: 'created_at', required: true },
          { name: 'amount', label: 'Monto', type: 'number', step: '0.01', required: true },
          { name: 'payment_method', label: 'Método de pago', type: 'select', options: methodOptions, required: true },
          { name: 'payment_date', label: 'Fecha de pago', type: 'date' },
          { name: 'reference', label: 'Referencia' },
          { name: 'notes', label: 'Notas', type: 'textarea', full: true },
        ]}
        filters={[{ name: 'payment_method', options: methodOptions }]}
        getSubtitle={(row) => `${row.invoices?.invoice_number || 'Factura'} · ${row.payment_method}`}
        getTitle={(row) => `${row.clients?.full_name || 'Pago'} - ${row.amount}`}
        onCreate={registerPayment}
        rowActions={(row) => (
          <Button
            disabled={generating === row.id}
            icon={FileText}
            loading={generating === row.id}
            onClick={() => handleReceipt(row)}
            size="sm"
            variant="champagne"
          >
            Recibo
          </Button>
        )}
        searchColumns={['payment_method', 'reference', 'notes']}
        select="*, clients(full_name), invoices(invoice_number,total,amount_paid,balance_due,status)"
        subtitle="Control de cobros, referencias y conciliación."
        table="payments"
        title="Pagos"
      />
    </>
  );
}

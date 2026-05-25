import { FileText, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { DataTable } from '../ui/DataTable';
import { EmptyState } from '../ui/EmptyState';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { PageHeader } from '../ui/PageHeader';
import { SearchBar } from '../ui/SearchBar';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Toast } from '../ui/Toast';
import { formatCurrency, formatDate } from '../../lib/utils';
import { createRow, deleteRow, getRow, listRows, replaceChildren, updateRow } from '../../services/crudService';
import { calculateTotals } from '../../services/financeService';
import { generateFinancialPdf } from '../../services/pdfService.jsx';
import { invoiceStatuses, quoteStatuses, statusLabels, statusVariants } from '../../constants/options';

export function FinancialDocumentModule({ type }) {
  const isInvoice = type === 'invoice';
  const table = isInvoice ? 'invoices' : 'quotes';
  const itemTable = isInvoice ? 'invoice_items' : 'quote_items';
  const foreignKey = isInvoice ? 'invoice_id' : 'quote_id';
  const numberKey = isInvoice ? 'invoice_number' : 'quote_number';
  const statuses = isInvoice ? invoiceStatuses : quoteStatuses;
  const [rows, setRows] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [documents, clientRows, productRows] = await Promise.all([
        listRows(table, { select: '*, clients(full_name,email,phone)', search, searchColumns: [numberKey, 'notes'], orderBy: 'created_at' }),
        listRows('clients', { orderBy: 'full_name', ascending: true }),
        listRows('products', { filters: { is_active: true }, orderBy: 'name', ascending: true }),
      ]);
      setRows(documents);
      setClients(clientRows);
      setProducts(productRows);
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [search, table, numberKey]);

  useEffect(() => {
    load();
  }, [load]);

  async function edit(row) {
    setSaving(true);
    try {
      const [full, items] = await Promise.all([
        getRow(table, row.id),
        listRows(itemTable, { filters: { [foreignKey]: row.id }, orderBy: 'sort_order', ascending: true }),
      ]);
      setEditing({ ...full, items: items.length ? items : [blankItem()] });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function save(values, items) {
    setSaving(true);
    try {
      const totals = calculateTotals(values, items);
      const payload = normalizeDocument(values, totals, isInvoice);
      let saved;
      if (values.id) {
        saved = await updateRow(table, values.id, payload);
      } else {
        saved = await createRow(table, payload);
      }
      await replaceChildren(itemTable, foreignKey, saved.id, items.map((item, index) => normalizeItem(item, foreignKey, saved.id, index)));
      setEditing(null);
      setToast({ type: 'success', message: 'Cambios guardados.' });
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setSaving(true);
    try {
      await deleteRow(table, deleting.id);
      setDeleting(null);
      setToast({ type: 'success', message: 'Registro eliminado.' });
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function convertQuote(row) {
    setSaving(true);
    try {
      const quote = await getRow('quotes', row.id);
      const items = await listRows('quote_items', { filters: { quote_id: row.id } });
      const invoice = await createRow('invoices', {
        client_id: quote.client_id,
        quote_id: quote.id,
        invoice_number: quote.quote_number.replace('COT', 'FAC'),
        status: 'issued',
        issue_date: new Date().toISOString().slice(0, 10),
        subtotal: quote.subtotal,
        discount: quote.discount,
        tax_enabled: quote.tax_enabled,
        tax_amount: quote.tax_amount,
        delivery_fee: quote.delivery_fee,
        pickup_fee: quote.pickup_fee,
        installation_fee: quote.installation_fee,
        total: quote.total,
        amount_paid: 0,
        notes: quote.notes,
      });
      await replaceChildren('invoice_items', 'invoice_id', invoice.id, items.map((item, index) => ({
        invoice_id: invoice.id,
        product_id: item.product_id,
        quote_item_id: item.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        internal_cost: item.internal_cost,
        sort_order: index,
      })));
      await updateRow('quotes', quote.id, { status: 'approved' });
      setToast({ type: 'success', message: 'Cotización convertida en factura.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function makePdf(row) {
    setSaving(true);
    try {
      const full = await getRow(table, row.id, '*, clients(full_name,email,phone)');
      const items = await listRows(itemTable, { filters: { [foreignKey]: row.id } });
      await generateFinancialPdf({
        type: isInvoice ? 'FACTURA' : 'COTIZACION',
        number: full[numberKey],
        client: full.clients,
        values: full,
        items,
        links: { client_id: full.client_id, quote_id: isInvoice ? full.quote_id : full.id, invoice_id: isInvoice ? full.id : null },
      });
      setToast({ type: 'success', message: 'PDF generado y descargado.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: numberKey, label: isInvoice ? 'Factura' : 'Cotización' },
    { key: 'client', label: 'Cliente' },
    { key: 'status', label: 'Estado' },
    { key: 'issue_date', label: 'Fecha' },
    { key: 'total', label: 'Total', align: 'right' },
    ...(isInvoice ? [{ key: 'balance_due', label: 'Balance', align: 'right' }] : []),
    { key: 'actions', label: 'Acciones', align: 'right' },
  ];

  return (
    <div className="space-y-6">
      <Toast message={toast?.message} type={toast?.type} />
      <PageHeader
        actions={<Button icon={Plus} onClick={() => setEditing(defaultDocument(isInvoice, numberKey))}>{isInvoice ? 'Nueva factura' : 'Nueva cotización'}</Button>}
        count={rows.length ? String(rows.length) : undefined}
        subtitle={isInvoice ? 'Facturación, pagos parciales, balances y PDF.' : 'Propuestas, términos, totales y conversión a factura.'}
        title={isInvoice ? 'Facturas' : 'Cotizaciones'}
      />
      <SearchBar onChange={(event) => setSearch(event.target.value)} placeholder={`Buscar ${isInvoice ? 'facturas' : 'cotizaciones'}...`} value={search} />

      {!loading && !rows.length ? (
        <EmptyState
          description={isInvoice ? 'Convierte una cotización aprobada en factura, o crea una directamente.' : 'Crea tu primera cotización y envíasela a un cliente.'}
          icon={FileText}
          title={isInvoice ? 'Sin facturas emitidas' : 'Sin cotizaciones'}
        />
      ) : null}

      <DataTable
        columns={columns}
        rows={rows}
        renderRow={(row) => (
          <tr className="border-b border-mash-surface2 transition hover:bg-mash-bg" key={row.id}>
            <td className="px-4 py-4 font-mono text-sm text-mash-text1">{row[numberKey]}</td>
            <td className="px-4 py-4 text-sm font-medium text-mash-text1">{row.clients?.full_name || '—'}</td>
            <td className="px-4 py-4"><Badge variant={statusVariants[row.status] ?? 'default'}>{statusLabels[row.status] ?? row.status}</Badge></td>
            <td className="px-4 py-4 text-sm text-mash-text3">{row.issue_date ? formatDate(row.issue_date) : '—'}</td>
            <td className="px-4 py-4 text-right font-mono text-sm text-mash-text1">{formatCurrency(row.total)}</td>
            {isInvoice ? <td className="px-4 py-4 text-right font-mono text-sm text-mash-text1">{formatCurrency(row.balance_due)}</td> : null}
            <td className="px-4 py-4 text-right">
              <div className="flex justify-end gap-1">
                {!isInvoice ? <Button disabled={saving} onClick={() => convertQuote(row)} size="sm" variant="secondary">Facturar</Button> : null}
                <Button disabled={saving} onClick={() => makePdf(row)} size="sm" variant="champagne">PDF</Button>
                <Button onClick={() => edit(row)} size="sm" variant="ghost">Editar</Button>
                <button className="grid h-10 w-10 place-items-center rounded-[10px] text-red-800 hover:bg-red-50" onClick={() => setDeleting(row)} type="button"><Trash2 className="h-4 w-4" /></button>
              </div>
            </td>
          </tr>
        )}
      />

      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <Card className="p-4" key={row.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-mono text-sm font-semibold text-mash-text1">{row[numberKey]}</p>
                <p className="mt-1 text-sm text-mash-text3">{row.clients?.full_name || 'Sin cliente'}</p>
                <p className="mt-3 font-mono text-lg font-bold text-mash-text1">{formatCurrency(row.total)}</p>
              </div>
              <Badge variant={statusVariants[row.status] ?? 'default'}>{statusLabels[row.status] ?? row.status}</Badge>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {!isInvoice ? <Button disabled={saving} onClick={() => convertQuote(row)} size="sm" variant="secondary">Facturar</Button> : null}
              <Button disabled={saving} onClick={() => makePdf(row)} size="sm" variant="champagne">PDF</Button>
              <Button onClick={() => edit(row)} size="sm" variant="ghost">Editar</Button>
            </div>
          </Card>
        ))}
      </div>

      <FinancialForm
        clients={clients}
        document={editing}
        isInvoice={isInvoice}
        loading={saving}
        onClose={() => setEditing(null)}
        onSave={save}
        products={products}
        statuses={statuses}
      />

      <ConfirmDialog
        description={`Esta acción no se puede deshacer. Se eliminará ${deleting?.[numberKey] || 'el registro'} permanentemente.`}
        loading={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
        open={Boolean(deleting)}
      />
    </div>
  );
}

function FinancialForm({ document, isInvoice, clients, products, statuses, loading, onSave, onClose }) {
  const [values, setValues] = useState(document ?? null);
  const [items, setItems] = useState([blankItem()]);
  const totals = useMemo(() => calculateTotals(values ?? {}, items), [values, items]);

  useEffect(() => {
    setValues(document);
    setItems(document?.items?.length ? document.items : [blankItem()]);
  }, [document]);

  if (!values) return null;

  function setValue(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function setItem(index, patch) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  function selectProduct(index, productId) {
    const product = products.find((item) => item.id === productId);
    setItem(index, {
      product_id: productId || null,
      description: product?.name ?? '',
      unit_price: product?.suggested_price ?? 0,
      internal_cost: product?.internal_cost ?? 0,
    });
  }

  return (
    <Modal
      footer={(
        <>
          <Button className="w-full md:w-auto" disabled={loading} onClick={onClose} variant="secondary">Cancelar</Button>
          <Button className="w-full md:w-auto" loading={loading} onClick={() => onSave({ ...values, ...totals }, items)}>Guardar</Button>
        </>
      )}
      onClose={onClose}
      open={Boolean(document)}
      size="xl"
      title={isInvoice ? 'Factura' : 'Cotización'}
    >
      <div className="grid content-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Select label="Cliente" onChange={(event) => setValue('client_id', event.target.value)} value={values.client_id || ''}>
          <option value="">Seleccionar cliente</option>
          {clients.map((client) => <option key={client.id} value={client.id}>{client.full_name}</option>)}
        </Select>
        <Input label="Número" onChange={(event) => setValue(isInvoice ? 'invoice_number' : 'quote_number', event.target.value)} value={values[isInvoice ? 'invoice_number' : 'quote_number'] || ''} />
        <Select label="Estado" onChange={(event) => setValue('status', event.target.value)} value={values.status || ''}>
          {statuses.map((status) => <option key={status} value={status}>{statusLabels[status] ?? status}</option>)}
        </Select>
        <Input label="Fecha" onChange={(event) => setValue('issue_date', event.target.value)} type="date" value={values.issue_date || ''} />
        {!isInvoice ? <Input label="Válida hasta" onChange={(event) => setValue('valid_until', event.target.value)} type="date" value={values.valid_until || ''} /> : null}
        <label className="flex min-h-12 items-center gap-3 rounded-[10px] border border-mash-borderMd px-4 text-sm font-medium text-mash-text2 lg:mt-6 lg:min-h-10">
          <input checked={Boolean(values.tax_enabled)} className="h-4 w-4 accent-mash-brand" onChange={(event) => setValue('tax_enabled', event.target.checked)} type="checkbox" />
          ITBIS 18%
        </label>
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-base font-semibold text-mash-text1">Líneas</h3>
          <Button className="w-full sm:w-auto" icon={Plus} onClick={() => setItems((current) => [...current, blankItem()])} size="sm" variant="secondary">Agregar producto</Button>
        </div>
        {items.map((item, index) => (
          <div className="grid gap-3 rounded-2xl border border-mash-border bg-mash-bg p-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_90px_120px_44px]" key={item.localId || item.id}>
            <Select label="Producto" onChange={(event) => selectProduct(index, event.target.value)} value={item.product_id || ''}>
              <option value="">Manual</option>
              {products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
            </Select>
            <Input label="Descripción" onChange={(event) => setItem(index, { description: event.target.value })} value={item.description || ''} />
            <Input label="Cant." onChange={(event) => setItem(index, { quantity: event.target.value })} type="number" value={numberInputValue(item.quantity, 1)} />
            <Input label="Precio" onChange={(event) => setItem(index, { unit_price: event.target.value })} step="0.01" type="number" value={numberInputValue(item.unit_price, 0)} />
            <button className="grid h-10 w-10 place-items-center self-end rounded-[10px] text-red-800 hover:bg-red-50 xl:mt-6" onClick={() => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} type="button"><Trash2 className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      <div className="mt-6 grid content-start grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input label="Descuento" onChange={(event) => setValue('discount', event.target.value)} step="0.01" type="number" value={numberInputValue(values.discount, 0)} />
        <Input label="Envío" onChange={(event) => setValue('delivery_fee', event.target.value)} step="0.01" type="number" value={numberInputValue(values.delivery_fee, 0)} />
        <Input label="Recogida" onChange={(event) => setValue('pickup_fee', event.target.value)} step="0.01" type="number" value={numberInputValue(values.pickup_fee, 0)} />
        <Input label="Instalación" onChange={(event) => setValue('installation_fee', event.target.value)} step="0.01" type="number" value={numberInputValue(values.installation_fee, 0)} />
        {!isInvoice ? <Input label="Anticipo requerido" onChange={(event) => setValue('required_deposit', event.target.value)} step="0.01" type="number" value={numberInputValue(values.required_deposit, 0)} /> : null}
        {isInvoice ? <Input label="Pagado" onChange={(event) => setValue('amount_paid', event.target.value)} step="0.01" type="number" value={numberInputValue(values.amount_paid, 0)} /> : null}
        <Textarea className="lg:col-span-3" label="Notas" onChange={(event) => setValue('notes', event.target.value)} value={values.notes || ''} />
      </div>

      <div className="mt-6 w-full rounded-2xl border border-mash-border bg-white p-4 sm:ml-auto sm:max-w-sm">
        <Summary label="Subtotal" value={totals.subtotal} />
        <Summary label="Descuento" value={totals.discount} />
        <Summary label="ITBIS" value={totals.tax_amount} />
        <Summary label="Total" strong value={totals.total} />
      </div>
    </Modal>
  );
}

function Summary({ label, value, strong }) {
  return (
    <div className="flex justify-between border-b border-mash-surface2 py-2 last:border-0">
      <span className={strong ? 'font-semibold text-mash-text1' : 'text-mash-text3'}>{label}</span>
      <span className="font-mono font-semibold text-mash-text1">{formatCurrency(value)}</span>
    </div>
  );
}

function numberInputValue(value, fallback = 0) {
  if (value === '' || value === null || value === undefined) return value === '' ? '' : fallback;
  return value;
}

function blankItem() {
  return { localId: window.crypto.randomUUID(), product_id: null, description: '', quantity: 1, unit_price: 0, internal_cost: 0 };
}

function defaultDocument(isInvoice, numberKey) {
  const prefix = isInvoice ? 'FAC' : 'COT';
  return {
    [numberKey]: `${prefix}-${Date.now().toString().slice(-5)}`,
    status: isInvoice ? 'issued' : 'draft',
    issue_date: new Date().toISOString().slice(0, 10),
    tax_enabled: false,
    discount: 0,
    delivery_fee: 0,
    pickup_fee: 0,
    installation_fee: 0,
    amount_paid: 0,
    required_deposit: 0,
    items: [blankItem()],
  };
}

function normalizeDocument(values, totals, isInvoice) {
  const payload = {
    client_id: values.client_id,
    status: values.status,
    issue_date: values.issue_date || new Date().toISOString().slice(0, 10),
    subtotal: totals.subtotal,
    discount: totals.discount,
    tax_enabled: Boolean(values.tax_enabled),
    tax_amount: totals.tax_amount,
    delivery_fee: totals.delivery_fee,
    pickup_fee: totals.pickup_fee,
    installation_fee: totals.installation_fee,
    total: totals.total,
    notes: values.notes || null,
  };
  if (isInvoice) {
    payload.invoice_number = values.invoice_number;
    payload.amount_paid = Number(values.amount_paid || 0);
    payload.quote_id = values.quote_id || null;
    payload.status = payload.amount_paid >= payload.total ? 'paid' : payload.amount_paid > 0 ? 'partially_paid' : values.status;
  } else {
    payload.quote_number = values.quote_number;
    payload.valid_until = values.valid_until || null;
    payload.required_deposit = Number(values.required_deposit || 0);
  }
  return payload;
}

function normalizeItem(item, foreignKey, parentId, index) {
  return {
    [foreignKey]: parentId,
    product_id: item.product_id || null,
    description: item.description || 'Producto',
    quantity: Number(item.quantity || 1),
    unit_price: Number(item.unit_price || 0),
    internal_cost: Number(item.internal_cost || 0),
    sort_order: index,
  };
}

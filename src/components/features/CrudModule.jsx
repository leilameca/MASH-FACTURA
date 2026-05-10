import { ChevronRight, Eye, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Chip } from '../ui/Chip';
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
import { isSupabaseConfigured } from '../../lib/supabaseClient';
import { cn, formatCurrency, formatDate } from '../../lib/utils';
import { createRow, deleteRow, listRows, updateRow } from '../../services/crudService';
import { uploadFile } from '../../services/storageService';
import { statusLabels, statusVariants } from '../../constants/options';

export function CrudModule({
  title,
  subtitle,
  table,
  select = '*',
  searchColumns = [],
  fields = [],
  columns = [],
  filters = [],
  orderBy = 'created_at',
  actionLabel,
  emptyTitle,
  emptyDescription,
  emptyIcon,
  getTitle,
  getSubtitle,
  transformSubmit,
  onCreate,
  onUpdate,
  detail,
  rowActions,
}) {
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const filterValues = useMemo(() => {
    return Object.fromEntries(Object.entries(activeFilters).filter(([, value]) => value && value !== 'all'));
  }, [activeFilters]);
  const filterKey = useMemo(() => JSON.stringify(filterValues), [filterValues]);
  const searchColumnsKey = searchColumns.join('|');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const parsedFilters = JSON.parse(filterKey);
      const parsedSearchColumns = searchColumnsKey ? searchColumnsKey.split('|') : [];
      const data = await listRows(table, {
        select,
        search,
        searchColumns: parsedSearchColumns,
        filters: parsedFilters,
        orderBy,
      });
      setRows(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [table, select, search, searchColumnsKey, filterKey, orderBy]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSave(values, files) {
    setSaving(true);
    try {
      const payload = { ...values };
      for (const field of fields) {
        if (field.type === 'file' && files[field.name]) {
          const upload = await uploadFile(field.bucket, files[field.name], field.folder ?? table);
          payload[field.urlField ?? field.name] = upload.publicUrl;
          if (field.pathField) payload[field.pathField] = upload.path;
        }
      }

      const normalized = transformSubmit ? await transformSubmit(payload, editing) : normalizePayload(payload, fields);
      if (editing?.id) {
        if (onUpdate) {
          await onUpdate(editing.id, normalized, editing);
        } else {
          await updateRow(table, editing.id, normalized);
        }
      } else {
        if (onCreate) {
          await onCreate(normalized);
        } else {
          await createRow(table, normalized);
        }
      }
      setToast({ type: 'success', message: editing ? 'Cambios guardados.' : 'Registro creado.' });
      setEditing(null);
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setSaving(true);
    try {
      await deleteRow(table, deleting.id);
      setToast({ type: 'success', message: 'Registro eliminado.' });
      setDeleting(null);
      await load();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setSaving(false);
    }
  }

  const tableColumns = [
    ...columns.map((column) => ({ key: column.key, label: column.label, align: column.align })),
    { key: 'actions', label: 'Acciones', align: 'right' },
  ];

  return (
    <div className="space-y-6">
      <Toast message={toast?.message} type={toast?.type} />
      <PageHeader
        actions={<Button icon={Plus} onClick={() => setEditing({})}>{actionLabel}</Button>}
        count={rows.length ? String(rows.length) : undefined}
        subtitle={subtitle}
        title={title}
      />

      <div className="space-y-3">
        <SearchBar onChange={(event) => setSearch(event.target.value)} placeholder={`Buscar en ${title.toLowerCase()}...`} value={search} />
        {filters.length ? (
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
            {filters.map((filter) => (
              <FilterChips
                active={activeFilters[filter.name] ?? 'all'}
                key={filter.name}
                onChange={(value) => setActiveFilters((current) => ({ ...current, [filter.name]: value }))}
                options={filter.options}
              />
            ))}
          </div>
        ) : null}
      </div>

      {!isSupabaseConfigured ? (
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-sm leading-6 text-amber-900">
            Supabase no está configurado en este entorno. Agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `.env` para usar datos reales.
          </p>
        </Card>
      ) : null}

      {error ? <Card className="border-red-200 bg-red-50 text-sm text-red-900">{error}</Card> : null}

      {!loading && !rows.length ? (
        <EmptyState
          description={emptyDescription}
          icon={emptyIcon}
          title={emptyTitle}
        />
      ) : null}

      <div className="space-y-3 md:hidden">
        {rows.map((row) => (
          <Card className="p-4" clickable key={row.id}>
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="truncate text-[15px] font-semibold text-mash-text1">{getTitle(row)}</p>
                  <RowStatus row={row} />
                </div>
                <p className="mt-1 line-clamp-2 text-[13px] text-mash-text3">{getSubtitle(row)}</p>
                <div className="mt-4 flex flex-wrap gap-1">
                  {rowActions?.(row)}
                  <IconButton icon={Eye} onClick={() => setViewing(row)} />
                  <IconButton icon={Pencil} onClick={() => setEditing(row)} />
                  <IconButton destructive icon={Trash2} onClick={() => setDeleting(row)} />
                </div>
              </div>
              <ChevronRight className="mt-2 h-4 w-4 text-mash-borderMd" />
            </div>
          </Card>
        ))}
      </div>

      {rows.length ? (
        <DataTable
          columns={tableColumns}
          rows={rows}
          renderRow={(row) => (
            <tr className="border-b border-mash-surface2 transition hover:bg-mash-bg" key={row.id}>
              {columns.map((column) => (
                <td className={cn('px-4 py-4 text-sm text-mash-text2', column.align === 'right' && 'text-right font-mono text-mash-text1')} key={column.key}>
                  {renderValue(row, column)}
                </td>
              ))}
              <td className="px-4 py-4 text-right">
                <div className="flex justify-end gap-1">
                  {rowActions?.(row)}
                  <IconButton icon={Eye} onClick={() => setViewing(row)} />
                  <IconButton icon={Pencil} onClick={() => setEditing(row)} />
                  <IconButton destructive icon={Trash2} onClick={() => setDeleting(row)} />
                </div>
              </td>
            </tr>
          )}
        />
      ) : null}

      <DynamicFormModal
        fields={fields}
        loading={saving}
        onClose={() => setEditing(null)}
        onSubmit={handleSave}
        open={editing !== null}
        title={editing?.id ? `Editar ${title.toLowerCase()}` : actionLabel}
        values={editing}
      />

      <Modal onClose={() => setViewing(null)} open={Boolean(viewing)} size="lg" title={viewing ? getTitle(viewing) : title}>
        {viewing ? detail?.(viewing) ?? <DetailGrid columns={columns} row={viewing} /> : null}
      </Modal>

      <ConfirmDialog
        description={`Esta acción no se puede deshacer. Se eliminará "${deleting ? getTitle(deleting) : ''}" permanentemente.`}
        loading={saving}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        open={Boolean(deleting)}
      />
    </div>
  );
}

function DynamicFormModal({ open, title, fields, values, loading, onSubmit, onClose }) {
  const [files, setFiles] = useState({});
  const [lookups, setLookups] = useState({});
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    reset(values ?? {});
    setFiles({});
  }, [values, reset]);

  useEffect(() => {
    async function loadLookups() {
      const lookupFields = fields.filter((field) => field.type === 'lookup');
      if (!open || !lookupFields.length) return;
      const entries = await Promise.all(
        lookupFields.map(async (field) => {
          const rows = await listRows(field.lookupTable, {
            select: field.lookupSelect ?? '*',
            orderBy: field.lookupOrderBy ?? field.lookupLabel ?? 'created_at',
            ascending: true,
          });
          return [field.name, rows];
        }),
      );
      setLookups(Object.fromEntries(entries));
    }
    loadLookups().catch(() => setLookups({}));
  }, [fields, open]);

  return (
    <Modal
      footer={(
        <>
          <Button className="w-full md:w-auto" disabled={loading} onClick={onClose} variant="secondary">Cancelar</Button>
          <Button className="w-full md:w-auto" loading={loading} onClick={handleSubmit((formValues) => onSubmit(formValues, files))}>Guardar</Button>
        </>
      )}
      onClose={onClose}
      open={open}
      size="lg"
      title={title}
    >
      <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit((formValues) => onSubmit(formValues, files))}>
        {fields.map((field) => (
          <FieldControl
            error={errors[field.name]?.message}
            field={field}
            key={field.name}
            lookupRows={lookups[field.name] ?? []}
            onFile={(file) => setFiles((current) => ({ ...current, [field.name]: file }))}
            register={register}
          />
        ))}
      </form>
    </Modal>
  );
}

function FieldControl({ field, register, error, onFile, lookupRows }) {
  const rules = field.required ? { required: `${field.label} es requerido.` } : {};
  const className = field.full ? 'md:col-span-2' : '';

  if (field.type === 'textarea') {
    return <Textarea className={className} error={error} label={field.label} {...register(field.name, rules)} />;
  }

  if (field.type === 'select') {
    return (
      <Select className={className} error={error} label={field.label} {...register(field.name, rules)}>
        <option value="">{field.placeholder ?? 'Seleccionar'}</option>
        {field.options?.map((option) => (
          <option key={option.value ?? option} value={option.value ?? option}>{option.label ?? option}</option>
        ))}
      </Select>
    );
  }

  if (field.type === 'lookup') {
    return (
      <Select className={className} error={error} label={field.label} {...register(field.name, rules)}>
        <option value="">{field.placeholder ?? 'Seleccionar'}</option>
        {lookupRows.map((row) => (
          <option key={row[field.lookupValue ?? 'id']} value={row[field.lookupValue ?? 'id']}>
            {field.lookupRender ? field.lookupRender(row) : row[field.lookupLabel]}
          </option>
        ))}
      </Select>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <label className={cn('flex min-h-12 items-center gap-3 rounded-[10px] border border-mash-borderMd bg-white px-4 text-sm font-medium text-mash-text2 md:min-h-10', className)}>
        <input className="h-4 w-4 accent-mash-brand" type="checkbox" {...register(field.name)} />
        {field.label}
      </label>
    );
  }

  if (field.type === 'file') {
    return (
      <label className={className}>
        <span className="mb-1.5 block text-[13px] font-medium text-mash-text2">{field.label}</span>
        <input
          accept={field.accept ?? 'image/*,application/pdf'}
          className="block w-full rounded-[10px] border border-mash-borderMd bg-white text-sm text-mash-text3 file:mr-4 file:min-h-10 file:border-0 file:bg-mash-brand file:px-4 file:text-sm file:font-semibold file:text-white"
          onChange={(event) => onFile(event.target.files?.[0] ?? null)}
          type="file"
        />
      </label>
    );
  }

  return (
    <Input
      className={className}
      error={error}
      label={field.label}
      step={field.step}
      type={field.type ?? 'text'}
      {...register(field.name, rules)}
    />
  );
}

function FilterChips({ options, active, onChange }) {
  return (
    <>
      <Chip active={active === 'all'} onClick={() => onChange('all')}>Todos</Chip>
      {options.map((option) => (
        <Chip active={active === option.value} key={option.value} onClick={() => onChange(option.value)}>
          {option.label}
        </Chip>
      ))}
    </>
  );
}

function IconButton({ icon: Icon, onClick, destructive = false }) {
  return (
    <button
      className={cn('grid h-9 w-9 place-items-center rounded-[10px] text-mash-text3 hover:bg-mash-surface2 hover:text-mash-text1', destructive && 'hover:bg-red-50 hover:text-red-800')}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function RowStatus({ row }) {
  const value = row.status ?? row.is_active;
  if (value === undefined || value === null) return null;
  return <Badge variant={statusVariants[String(value)] ?? 'default'}>{statusLabels[String(value)] ?? String(value)}</Badge>;
}

function renderValue(row, column) {
  const value = column.accessor ? column.accessor(row) : row[column.key];
  if (column.type === 'currency') return formatCurrency(Number(value || 0));
  if (column.type === 'date') return value ? formatDate(value) : '—';
  if (column.type === 'status') return <Badge variant={statusVariants[String(value)] ?? 'default'}>{statusLabels[String(value)] ?? String(value)}</Badge>;
  if (column.type === 'boolean') return <Badge variant={value ? 'olive' : 'default'}>{value ? 'Activo' : 'Inactivo'}</Badge>;
  return value || '—';
}

function DetailGrid({ columns, row }) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {columns.map((column) => (
        <div className="rounded-2xl border border-mash-border bg-mash-bg p-4" key={column.key}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-mash-text3">{column.label}</p>
          <div className="mt-2 text-sm font-medium text-mash-text1">{renderValue(row, column)}</div>
        </div>
      ))}
    </div>
  );
}

function normalizePayload(values, fields) {
  return fields.reduce((payload, field) => {
    if (field.type === 'file') return payload;
    if (field.type === 'number') {
      payload[field.name] = values[field.name] === '' || values[field.name] === undefined ? 0 : Number(values[field.name]);
      return payload;
    }
    if (field.type === 'checkbox') {
      payload[field.name] = Boolean(values[field.name]);
      return payload;
    }
    payload[field.name] = values[field.name] === '' ? null : values[field.name];
    return payload;
  }, {});
}

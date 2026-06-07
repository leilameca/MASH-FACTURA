import { FileText, Package, Search, Users, Wrench, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { formatCurrency } from '../../lib/utils';

const SECTIONS = [
  {
    key: 'clients',
    label: 'Clientes',
    icon: Users,
    table: 'clients',
    select: 'id, full_name, phone, email',
    columns: ['full_name', 'phone', 'email'],
    getTitle: (r) => r.full_name,
    getSub: (r) => [r.phone, r.email].filter(Boolean).join(' · '),
    route: '/clients',
  },
  {
    key: 'quotes',
    label: 'Cotizaciones',
    icon: FileText,
    table: 'quotes',
    select: 'id, quote_number, total, clients(full_name)',
    columns: ['quote_number'],
    getTitle: (r) => r.quote_number,
    getSub: (r) => [r.clients?.full_name, r.total != null ? formatCurrency(r.total) : null].filter(Boolean).join(' · '),
    route: '/quotes',
  },
  {
    key: 'invoices',
    label: 'Facturas',
    icon: FileText,
    table: 'invoices',
    select: 'id, invoice_number, total, clients(full_name)',
    columns: ['invoice_number'],
    getTitle: (r) => r.invoice_number,
    getSub: (r) => [r.clients?.full_name, r.total != null ? formatCurrency(r.total) : null].filter(Boolean).join(' · '),
    route: '/invoices',
  },
  {
    key: 'orders',
    label: 'Pedidos',
    icon: Package,
    table: 'orders',
    select: 'id, order_number, status, clients(full_name)',
    columns: ['order_number'],
    getTitle: (r) => r.order_number,
    getSub: (r) => [r.clients?.full_name, r.status].filter(Boolean).join(' · '),
    route: '/orders',
  },
  {
    key: 'repairs',
    label: 'Reparaciones',
    icon: Wrench,
    table: 'repairs',
    select: 'id, repair_number, device_brand, device_model, clients(full_name)',
    columns: ['repair_number', 'device_brand', 'device_model'],
    getTitle: (r) => r.repair_number,
    getSub: (r) => [r.clients?.full_name, r.device_brand, r.device_model].filter(Boolean).join(' · '),
    route: '/repairs',
  },
];

async function runSearch(query) {
  if (!query || query.length < 2) return {};
  const term = `%${query}%`;

  const results = await Promise.allSettled(
    SECTIONS.map(async (section) => {
      const orClause = section.columns.map((c) => `${c}.ilike.${term}`).join(',');
      const { data } = await supabase
        .from(section.table)
        .select(section.select)
        .or(orClause)
        .limit(5);
      return { key: section.key, data: data ?? [] };
    }),
  );

  return Object.fromEntries(
    results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => [r.value.key, r.value.data]),
  );
}

export function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults({});
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query || query.length < 2) { setResults({}); return; }
    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await runSearch(query);
      setResults(res);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function goTo(route) {
    navigate(route);
    onClose();
  }

  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);
  const hasResults = totalResults > 0;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl rounded-2xl border border-mash-border bg-white shadow-2xl mx-4">
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-mash-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-mash-text3" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-sm text-mash-text1 placeholder:text-mash-text3 outline-none"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar clientes, cotizaciones, facturas, pedidos..."
            value={query}
          />
          {query && (
            <button className="text-mash-text3 hover:text-mash-text1" onClick={() => setQuery('')} type="button">
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden rounded-md border border-mash-border px-1.5 py-0.5 text-[10px] text-mash-text3 sm:block">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {loading && (
            <p className="py-8 text-center text-sm text-mash-text3">Buscando...</p>
          )}

          {!loading && query.length >= 2 && !hasResults && (
            <p className="py-8 text-center text-sm text-mash-text3">Sin resultados para "{query}"</p>
          )}

          {!loading && query.length < 2 && (
            <p className="py-6 text-center text-sm text-mash-text3">Escribe al menos 2 caracteres para buscar</p>
          )}

          {!loading && hasResults && SECTIONS.map((section) => {
            const items = results[section.key] ?? [];
            if (!items.length) return null;
            const Icon = section.icon;
            return (
              <div className="mb-2" key={section.key}>
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-mash-text3">
                  {section.label}
                </p>
                {items.map((item) => (
                  <button
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-mash-surface2 transition"
                    key={item.id}
                    onClick={() => goTo(section.route)}
                    type="button"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-mash-surface2">
                      <Icon className="h-3.5 w-3.5 text-mash-text2" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-mash-text1">{section.getTitle(item)}</p>
                      <p className="truncate text-xs text-mash-text3">{section.getSub(item)}</p>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

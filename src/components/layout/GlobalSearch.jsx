import { ArrowRight, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mainNav } from '../../constants/navigation';
import { supabase } from '../../lib/supabaseClient';
import { formatCurrency } from '../../lib/utils';

// ── Páginas navegables ────────────────────────────────────────────────────────
// Reutilizamos mainNav + extras con keywords de búsqueda
const NAV_ITEMS = [
  ...mainNav.map((item) => ({ ...item, keywords: item.label.toLowerCase() })),
  { label: 'Configuración', path: '/settings', icon: mainNav.find((n) => n.path === '/settings')?.icon ?? Search, keywords: 'configuracion ajustes empresa rnc cedula moneda prefijos terminos' },
  { label: 'Mi cuenta', path: '/account', icon: mainNav.find((n) => n.path === '/account')?.icon ?? Search, keywords: 'cuenta perfil usuario contrasena password' },
];

// ── Secciones de contenido ────────────────────────────────────────────────────
const CONTENT_SECTIONS = [
  {
    key: 'clients',
    label: 'Clientes',
    table: 'clients',
    select: 'id, full_name, phone, email',
    searchCols: ['full_name', 'phone', 'email'],
    getTitle: (r) => r.full_name,
    getSub: (r) => [r.phone, r.email].filter(Boolean).join(' · '),
    route: '/clients',
  },
  {
    key: 'quotes',
    label: 'Cotizaciones',
    table: 'quotes',
    select: 'id, quote_number, total, clients(full_name)',
    searchCols: ['quote_number'],
    getTitle: (r) => r.quote_number,
    getSub: (r) => [r.clients?.full_name, r.total != null ? formatCurrency(r.total) : null].filter(Boolean).join(' · '),
    route: '/quotes',
  },
  {
    key: 'invoices',
    label: 'Facturas',
    table: 'invoices',
    select: 'id, invoice_number, total, clients(full_name)',
    searchCols: ['invoice_number'],
    getTitle: (r) => r.invoice_number,
    getSub: (r) => [r.clients?.full_name, r.total != null ? formatCurrency(r.total) : null].filter(Boolean).join(' · '),
    route: '/invoices',
  },
  {
    key: 'orders',
    label: 'Pedidos',
    table: 'orders',
    select: 'id, order_number, status, clients(full_name)',
    searchCols: ['order_number'],
    getTitle: (r) => r.order_number,
    getSub: (r) => [r.clients?.full_name, r.status].filter(Boolean).join(' · '),
    route: '/orders',
  },
  {
    key: 'repairs',
    label: 'Reparaciones',
    table: 'repairs',
    select: 'id, repair_number, device_brand, device_model, clients(full_name)',
    searchCols: ['repair_number', 'device_brand', 'device_model'],
    getTitle: (r) => r.repair_number,
    getSub: (r) => [r.clients?.full_name, r.device_brand, r.device_model].filter(Boolean).join(' · '),
    route: '/repairs',
  },
  {
    key: 'employees',
    label: 'Empleados',
    table: 'employees',
    select: 'id, name, employee_id, area',
    searchCols: ['name', 'employee_id'],
    getTitle: (r) => r.name,
    getSub: (r) => [r.employee_id, r.area].filter(Boolean).join(' · '),
    route: '/employees',
  },
];

async function searchContent(query) {
  const term = `%${query}%`;
  const results = await Promise.allSettled(
    CONTENT_SECTIONS.map(async (s) => {
      const orClause = s.searchCols.map((c) => `${c}.ilike.${term}`).join(',');
      const { data } = await supabase.from(s.table).select(s.select).or(orClause).limit(4);
      return { key: s.key, data: data ?? [] };
    }),
  );
  return Object.fromEntries(
    results.filter((r) => r.status === 'fulfilled').map((r) => [r.value.key, r.value.data]),
  );
}

function filterNavItems(query) {
  const q = query.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  return NAV_ITEMS.filter((item) => {
    const haystack = (item.keywords ?? item.label).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    return haystack.includes(q);
  });
}

// ── Componente ────────────────────────────────────────────────────────────────
export function GlobalSearch({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [contentResults, setContentResults] = useState({});
  const [navResults, setNavResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setContentResults({});
      setNavResults(NAV_ITEMS.slice(0, 6)); // accesos rápidos sin query
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!query) {
      setNavResults(NAV_ITEMS.slice(0, 6));
      setContentResults({});
      setLoading(false);
      return;
    }
    if (query.length < 2) {
      setNavResults([]);
      setContentResults({});
      return;
    }

    setNavResults(filterNavItems(query));

    setLoading(true);
    const timer = setTimeout(async () => {
      const res = await searchContent(query);
      setContentResults(res);
      setLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [query]);

  function goTo(path) {
    navigate(path);
    onClose();
  }

  const totalContent = Object.values(contentResults).reduce((s, a) => s + a.length, 0);
  const hasAny = navResults.length > 0 || totalContent > 0;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[8vh]">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-10 mx-4 w-full max-w-lg rounded-2xl border border-mash-border bg-white shadow-2xl">

        {/* ── Barra de búsqueda ── */}
        <div className="flex items-center gap-3 border-b border-mash-border px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-mash-text3" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-sm text-mash-text1 placeholder:text-mash-text3 outline-none"
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar páginas, clientes, facturas, pedidos..."
            value={query}
          />
          {query
            ? <button className="text-mash-text3 hover:text-mash-text1" onClick={() => setQuery('')} type="button"><X className="h-4 w-4" /></button>
            : <kbd className="rounded-md border border-mash-border px-1.5 py-0.5 text-[10px] text-mash-text3">ESC</kbd>
          }
        </div>

        {/* ── Resultados ── */}
        <div className="max-h-[62vh] overflow-y-auto p-2">

          {/* Páginas / navegación */}
          {navResults.length > 0 && (
            <div className="mb-2">
              <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-mash-text3">
                {query ? 'Páginas' : 'Accesos rápidos'}
              </p>
              {navResults.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-mash-surface2 transition"
                    key={item.path}
                    onClick={() => goTo(item.path)}
                    type="button"
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-mash-surface2">
                      <Icon className="h-3.5 w-3.5 text-mash-text2" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-mash-text1">{item.label}</p>
                      {item.section && <p className="text-xs text-mash-text3">{item.section}</p>}
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-mash-text3" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Separador si hay ambos */}
          {navResults.length > 0 && totalContent > 0 && (
            <div className="my-2 border-t border-mash-border" />
          )}

          {/* Contenido */}
          {loading && query.length >= 2 && (
            <p className="py-6 text-center text-sm text-mash-text3">Buscando...</p>
          )}

          {!loading && query.length >= 2 && totalContent === 0 && navResults.length === 0 && (
            <p className="py-6 text-center text-sm text-mash-text3">Sin resultados para "{query}"</p>
          )}

          {!loading && totalContent > 0 && CONTENT_SECTIONS.map((section) => {
            const items = contentResults[section.key] ?? [];
            if (!items.length) return null;
            return (
              <div className="mb-2" key={section.key}>
                <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-mash-text3">
                  {section.label}
                </p>
                {items.map((item) => (
                  <button
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left hover:bg-mash-surface2 transition"
                    key={item.id}
                    onClick={() => goTo(section.route)}
                    type="button"
                  >
                    <div className="min-w-0 flex-1 pl-1">
                      <p className="truncate text-sm font-medium text-mash-text1">{section.getTitle(item)}</p>
                      <p className="truncate text-xs text-mash-text3">{section.getSub(item)}</p>
                    </div>
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        {/* ── Footer con atajos ── */}
        <div className="flex items-center gap-4 border-t border-mash-border px-4 py-2">
          <span className="text-[10px] text-mash-text3"><kbd className="rounded border border-mash-border px-1">↑↓</kbd> navegar</span>
          <span className="text-[10px] text-mash-text3"><kbd className="rounded border border-mash-border px-1">↵</kbd> abrir</span>
          <span className="text-[10px] text-mash-text3"><kbd className="rounded border border-mash-border px-1">ESC</kbd> cerrar</span>
        </div>
      </div>
    </div>
  );
}

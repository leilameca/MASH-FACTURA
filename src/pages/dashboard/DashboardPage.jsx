import {
  ChevronRight,
  Clock,
  FileSearch,
  Package,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { isSupabaseConfigured, supabase } from '../../lib/supabaseClient';
import { formatCurrency, formatDate } from '../../lib/utils';
import { statusLabels, statusVariants } from '../../constants/options';

const ACTIVE_ORDER_STATUSES = ['nuevo', 'cotizado', 'aprobado', 'encargado', 'en_fabricacion', 'en_reparacion', 'esperando_materiales', 'listo', 'en_camino'];
const ACTIVE_REPAIR_STATUSES = ['recibido', 'diagnosticado', 'en_reparacion', 'listo'];

const metricIcons = [Receipt, Clock, Package, Wrench];

const quickActions = [
  { label: 'Nueva cotización', icon: FileSearch, path: '/quotes' },
  { label: 'Nueva factura', icon: Receipt, path: '/invoices' },
  { label: 'Nuevo pedido', icon: Package, path: '/orders' },
  { label: 'Nueva reparación', icon: Wrench, path: '/repairs' },
];

const activityIcons = {
  invoice: Receipt,
  quote: FileSearch,
  order: Package,
  repair: Wrench,
  expense: TrendingDown,
};

export function DashboardPage() {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(() => emptyDashboard());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const periods = useMemo(() => getPeriods(), []);

  const loadDashboard = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      setError('Supabase no está configurado. Revisa las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [
        currentInvoices,
        previousInvoices,
        openInvoices,
        activeOrders,
        activeRepairs,
        recentInvoices,
        recentQuotes,
        recentOrders,
        recentRepairs,
        recentExpenses,
      ] = await Promise.all([
        fetchRows('invoices', 'id,invoice_number,status,issue_date,total,balance_due,created_at,clients(full_name)', (query) =>
          query.gte('issue_date', periods.monthStart).lt('issue_date', periods.nextMonthStart),
        ),
        fetchRows('invoices', 'id,total,balance_due,issue_date', (query) =>
          query.gte('issue_date', periods.previousMonthStart).lt('issue_date', periods.monthStart),
        ),
        fetchRows('invoices', 'id,invoice_number,balance_due,status,due_date', (query) =>
          query.not('status', 'in', '("paid","void")'),
        ),
        fetchRows('orders', 'id,order_number,status,priority,estimated_delivery_date,created_at,clients(full_name)', (query) =>
          query.in('status', ACTIVE_ORDER_STATUSES),
        ),
        fetchRows('repairs', 'id,repair_number,status,pickup_date,created_at,clients(full_name)', (query) =>
          query.in('status', ACTIVE_REPAIR_STATUSES),
        ),
        fetchRecent('invoices', 'id,invoice_number,status,total,created_at,clients(full_name)'),
        fetchRecent('quotes', 'id,quote_number,status,total,created_at,clients(full_name)'),
        fetchRecent('orders', 'id,order_number,status,priority,created_at,clients(full_name)'),
        fetchRecent('repairs', 'id,repair_number,status,repair_cost,created_at,clients(full_name)'),
        fetchRecent('expenses', 'id,description,category,amount,created_at,suppliers(name)'),
      ]);

      const currentInvoiceIds = currentInvoices.map((invoice) => invoice.id);
      const previousInvoiceIds = previousInvoices.map((invoice) => invoice.id);
      const [currentItems, previousItems] = await Promise.all([
        fetchInvoiceItems(currentInvoiceIds),
        fetchInvoiceItems(previousInvoiceIds),
      ]);

      const monthRevenue = sum(currentInvoices, 'total');
      const previousRevenue = sum(previousInvoices, 'total');
      const pendingBalance = sum(openInvoices, 'balance_due');
      const dueThisWeek = activeOrders.filter((order) => {
        if (!order.estimated_delivery_date) return false;
        return order.estimated_delivery_date >= periods.today && order.estimated_delivery_date <= periods.weekEnd;
      }).length;
      const readyRepairs = activeRepairs.filter((repair) => repair.status === 'listo').length;
      const margin = calculateMargin(currentItems);
      const previousMargin = calculateMargin(previousItems);

      setDashboard({
        metrics: [
          {
            label: 'Facturas del mes',
            value: formatCompactCurrency(monthRevenue),
            delta: `${formatDeltaPercent(monthRevenue, previousRevenue)} vs mes anterior`,
            trend: monthRevenue >= previousRevenue ? 'up' : 'neutral',
          },
          {
            label: 'Pendiente de cobro',
            value: formatCompactCurrency(pendingBalance),
            delta: `${openInvoices.length} facturas abiertas`,
            trend: pendingBalance > 0 ? 'warn' : 'up',
          },
          {
            label: 'Pedidos activos',
            value: String(activeOrders.length),
            delta: `${dueThisWeek} vencen esta semana`,
            trend: dueThisWeek > 0 ? 'warn' : 'neutral',
          },
          {
            label: 'Reparaciones en curso',
            value: String(activeRepairs.length),
            delta: `${readyRepairs} listas para entregar`,
            trend: readyRepairs > 0 ? 'up' : 'neutral',
          },
        ],
        activity: buildActivity([
          ...recentInvoices.map((row) => activityFromInvoice(row)),
          ...recentQuotes.map((row) => activityFromQuote(row)),
          ...recentOrders.map((row) => activityFromOrder(row)),
          ...recentRepairs.map((row) => activityFromRepair(row)),
          ...recentExpenses.map((row) => activityFromExpense(row)),
        ]),
        margin,
        previousMargin,
      });
    } catch (err) {
      setError(err.message);
      setDashboard(emptyDashboard());
    } finally {
      setLoading(false);
    }
  }, [periods]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Resumen operativo y financiero de Martinez Star Home."
        actions={
          <Button icon={Plus} onClick={() => navigate('/quotes')}>
            Nueva cotización
          </Button>
        }
      />

      {error ? (
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-sm leading-6 text-amber-900">{error}</p>
        </Card>
      ) : null}

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {dashboard.metrics.map((metric, index) => (
          <StatCard key={metric.label} {...metric} icon={metricIcons[index]} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-mash-text1">Actividad reciente</h2>
            <button
              className="text-[13px] font-medium text-mash-text3 transition hover:text-mash-text1"
              onClick={() => navigate('/documents')}
              type="button"
            >
              Ver todo
            </button>
          </div>

          {loading ? (
            <ActivitySkeleton />
          ) : dashboard.activity.length ? (
            <div className="divide-y divide-mash-surface2">
              {dashboard.activity.map((item, index) => {
                const Icon = activityIcons[item.kind] ?? Receipt;
                return (
                  <button
                    className="flex w-full items-center gap-3 py-3.5 text-left transition first:pt-0 last:pb-0 hover:opacity-80"
                    key={`${item.kind}-${item.id}`}
                    onClick={() => navigate(item.path)}
                    style={{ animationDelay: `${Math.min(index, 5) * 40}ms` }}
                    type="button"
                  >
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] bg-mash-surface2 text-mash-text3">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-mash-text1">{item.title}</p>
                      <p className="mt-0.5 truncate text-xs text-mash-text3">{item.meta}</p>
                    </div>
                    <Badge variant={statusVariants[item.status] ?? 'default'}>
                      {item.badgeLabel ?? statusLabels[item.status] ?? item.status}
                    </Badge>
                    <ChevronRight className="h-4 w-4 shrink-0 text-mash-borderMd" />
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-mash-borderMd bg-mash-bg p-8 text-center">
              <Receipt className="mx-auto h-10 w-10 text-mash-borderMd" />
              <p className="mt-3 text-sm font-semibold text-mash-text2">Sin actividad todavía</p>
              <p className="mt-1 text-sm text-mash-text3">Cuando registres facturas, pedidos o gastos aparecerán aquí.</p>
            </div>
          )}
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <h2 className="mb-4 text-base font-semibold text-mash-text1">Acciones rápidas</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    className="flex flex-col gap-3 rounded-[14px] border border-mash-border bg-white p-4 text-left transition hover:border-mash-borderMd hover:shadow-mash active:scale-[0.97]"
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    type="button"
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-[8px] bg-mash-surface2">
                      <Icon className="h-4 w-4 text-mash-text2" />
                    </div>
                    <p className="text-[13px] font-semibold leading-snug text-mash-text1">{action.label}</p>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="border-mash-champagne/30 bg-gradient-to-br from-white to-[#EDE3D5]/20">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-mash-champagne">
                  Margen del mes
                </p>
                <p className="mt-2 font-mono text-2xl font-bold text-mash-text1">{formatPercent(dashboard.margin)}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-mash-olive">
                  <TrendingUp className="h-3 w-3" />
                  {formatMarginDelta(dashboard.margin, dashboard.previousMargin)} vs mes anterior
                </p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-mash-champagne/30 bg-mash-champagneBg">
                <TrendingUp className="h-5 w-5 text-mash-champagne" />
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

function emptyDashboard() {
  return {
    metrics: [
      { label: 'Facturas del mes', value: formatCurrency(0), delta: '0% vs mes anterior', trend: 'neutral' },
      { label: 'Pendiente de cobro', value: formatCurrency(0), delta: '0 facturas abiertas', trend: 'neutral' },
      { label: 'Pedidos activos', value: '0', delta: '0 vencen esta semana', trend: 'neutral' },
      { label: 'Reparaciones en curso', value: '0', delta: '0 listas para entregar', trend: 'neutral' },
    ],
    activity: [],
    margin: 0,
    previousMargin: 0,
  };
}

function getPeriods() {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const weekEnd = new Date(now);
  weekEnd.setDate(now.getDate() + 7);

  return {
    today: toDateKey(now),
    weekEnd: toDateKey(weekEnd),
    monthStart: toDateKey(monthStart),
    nextMonthStart: toDateKey(nextMonthStart),
    previousMonthStart: toDateKey(previousMonthStart),
  };
}

function toDateKey(date) {
  return date.toISOString().slice(0, 10);
}

async function fetchRows(table, select, configure = (query) => query) {
  let query = supabase.from(table).select(select);
  query = configure(query);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function fetchRecent(table, select) {
  return fetchRows(table, select, (query) => query.order('created_at', { ascending: false }).limit(5));
}

async function fetchInvoiceItems(invoiceIds) {
  if (!invoiceIds.length) return [];
  return fetchRows('invoice_items', 'invoice_id,line_total,line_cost', (query) => query.in('invoice_id', invoiceIds));
}

function sum(rows, key) {
  return rows.reduce((total, row) => total + Number(row[key] || 0), 0);
}

function calculateMargin(items) {
  const revenue = sum(items, 'line_total');
  const cost = sum(items, 'line_cost');
  if (!revenue) return 0;
  return ((revenue - cost) / revenue) * 100;
}

function formatCompactCurrency(value) {
  if (Math.abs(value) >= 1000000) return `RD$ ${(value / 1000000).toFixed(1)}M`;
  if (Math.abs(value) >= 1000) return `RD$ ${Math.round(value / 1000)}K`;
  return formatCurrency(value);
}

function formatDeltaPercent(current, previous) {
  if (!previous && !current) return '0%';
  if (!previous) return '+100%';
  const delta = ((current - previous) / previous) * 100;
  return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

function formatMarginDelta(current, previous) {
  const delta = Number(current || 0) - Number(previous || 0);
  return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
}

function buildActivity(items) {
  return items
    .filter(Boolean)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);
}

function activityMeta(clientName, createdAt, amount) {
  const date = createdAt ? formatDate(createdAt) : 'Sin fecha';
  return [clientName || 'Sin cliente', date, amount ? formatCurrency(amount) : null].filter(Boolean).join(' · ');
}

function activityFromInvoice(row) {
  return {
    id: row.id,
    kind: 'invoice',
    path: '/invoices',
    title: `Factura ${row.invoice_number || row.id.slice(0, 8)}`,
    meta: activityMeta(row.clients?.full_name, row.created_at, row.total),
    status: row.status,
    created_at: row.created_at,
  };
}

function activityFromQuote(row) {
  return {
    id: row.id,
    kind: 'quote',
    path: '/quotes',
    title: `Cotización ${row.quote_number || row.id.slice(0, 8)}`,
    meta: activityMeta(row.clients?.full_name, row.created_at, row.total),
    status: row.status,
    created_at: row.created_at,
  };
}

function activityFromOrder(row) {
  return {
    id: row.id,
    kind: 'order',
    path: '/orders',
    title: `Pedido ${row.order_number || row.id.slice(0, 8)}`,
    meta: activityMeta(row.clients?.full_name, row.created_at),
    status: row.status,
    created_at: row.created_at,
  };
}

function activityFromRepair(row) {
  return {
    id: row.id,
    kind: 'repair',
    path: '/repairs',
    title: `Reparación ${row.repair_number || row.id.slice(0, 8)}`,
    meta: activityMeta(row.clients?.full_name, row.created_at, row.repair_cost),
    status: row.status,
    created_at: row.created_at,
  };
}

function activityFromExpense(row) {
  return {
    id: row.id,
    kind: 'expense',
    path: '/expenses',
    title: row.description || 'Gasto registrado',
    meta: activityMeta(row.suppliers?.name || row.category, row.created_at, row.amount),
    status: 'draft',
    badgeLabel: 'Gasto',
    created_at: row.created_at,
  };
}

function ActivitySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div className="flex items-center gap-3" key={index}>
          <div className="skeleton h-9 w-9 rounded-[10px]" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="skeleton h-4 w-2/3 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
          <div className="skeleton h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

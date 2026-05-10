import {
  ChevronRight,
  FileSearch,
  Package,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { activity, metrics } from '../../constants/mockData';
import { statusLabels, statusVariants } from '../../constants/options';

const metricIcons = [Receipt, TrendingDown, Package, Wrench];

const quickActions = [
  { label: 'Nueva cotización', icon: FileSearch, path: '/quotes', variant: 'primary' },
  { label: 'Nueva factura',   icon: Receipt,     path: '/invoices' },
  { label: 'Nuevo pedido',    icon: Package,     path: '/orders' },
  { label: 'Nueva reparación',icon: Wrench,      path: '/repairs' },
];

const activityIcons = {
  paid:           Receipt,
  sent:           FileSearch,
  en_fabricacion: Package,
  listo:          Wrench,
  draft:          TrendingDown,
};

export function DashboardPage() {
  const navigate = useNavigate();

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

      {/* Metrics */}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {metrics.map((metric, index) => (
          <StatCard key={metric.label} {...metric} icon={metricIcons[index]} />
        ))}
      </section>

      {/* Main content grid */}
      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        {/* Activity feed */}
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-mash-text1">Actividad reciente</h2>
            <button
              className="text-[13px] font-medium text-mash-text3 transition hover:text-mash-text1"
              type="button"
            >
              Ver todo
            </button>
          </div>
          <div className="divide-y divide-mash-surface2">
            {activity.map((item, index) => {
              const Icon = activityIcons[item.status] ?? Receipt;
              return (
                <button
                  className="flex w-full items-center gap-3 py-3.5 text-left transition first:pt-0 last:pb-0 hover:opacity-80"
                  key={item.title}
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
                    {statusLabels[item.status] ?? item.status}
                  </Badge>
                  <ChevronRight className="h-4 w-4 shrink-0 text-mash-borderMd" />
                </button>
              );
            })}
          </div>
        </Card>

        {/* Quick actions */}
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

          {/* Summary mini-card */}
          <Card className="border-mash-champagne/30 bg-gradient-to-br from-white to-[#EDE3D5]/20">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-mash-champagne">
                  Margen del mes
                </p>
                <p className="mt-2 font-mono text-2xl font-bold text-mash-text1">68.4%</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-mash-olive">
                  <TrendingUp className="h-3 w-3" />
                  +3.2% vs mes anterior
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

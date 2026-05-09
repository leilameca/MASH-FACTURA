import { FileText, Package, Plus, Receipt, Wrench, ChevronRight, Clock } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { StatCard } from '../../components/ui/StatCard';
import { activity, metrics } from '../../constants/mockData';

const metricIcons = [Receipt, Clock, Package, Wrench];
const actions = [
  { label: 'Nueva cotización', icon: FileText },
  { label: 'Nueva factura', icon: Receipt },
  { label: 'Nuevo pedido', icon: Package },
  { label: 'Nueva reparación', icon: Wrench },
];

export function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        subtitle="Orden operativo y financiero para Martinez Star Home."
        actions={<Button icon={Plus}>Nueva cotización</Button>}
      />

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {metrics.map((metric, index) => (
          <StatCard key={metric.label} {...metric} icon={metricIcons[index]} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-mash-text1">Actividad reciente</h2>
            <button className="text-[13px] font-medium text-mash-text3 hover:text-mash-text1" type="button">Ver todo</button>
          </div>
          <div className="space-y-2">
            {activity.map((item, index) => (
              <button
                className="flex min-h-[58px] w-full items-center gap-3 rounded-xl p-3 text-left transition hover:bg-mash-bg"
                key={item.title}
                style={{ animationDelay: `${Math.min(index, 5) * 40}ms` }}
                type="button"
              >
                <div className="grid h-9 w-9 place-items-center rounded-[10px] bg-mash-surface2 text-mash-text3">
                  <Receipt className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-mash-text1">{item.title}</p>
                  <p className="mt-0.5 truncate text-xs text-mash-text3">{item.meta}</p>
                </div>
                <Badge variant={item.status === 'Cobrada' ? 'olive' : 'default'}>{item.status}</Badge>
                <ChevronRight className="h-4 w-4 text-mash-borderMd" />
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-base font-semibold text-mash-text1">Acciones rápidas</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {actions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  className="rounded-[14px] border border-mash-border bg-white p-4 text-left transition hover:border-mash-borderMd hover:shadow-mash"
                  key={action.label}
                  type="button"
                >
                  <Icon className="h-6 w-6 text-mash-brand" />
                  <p className="mt-3 text-[13px] font-semibold text-mash-text1">{action.label}</p>
                </button>
              );
            })}
          </div>
        </Card>
      </section>
    </div>
  );
}

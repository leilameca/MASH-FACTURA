import { cn } from '../../lib/utils';
import { Card } from './Card';

export function StatCard({ label, value, delta, icon: Icon, trend = 'neutral' }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-mash-text3">{label}</p>
          <p className="mt-3 font-mono text-[26px] font-bold leading-none text-mash-text1">{value}</p>
        </div>
        {Icon ? <Icon className="h-5 w-5 text-mash-text4" /> : null}
      </div>
      <p
        className={cn(
          'mt-4 text-xs font-medium',
          trend === 'up' && 'text-mash-olive',
          trend === 'warn' && 'text-amber-800',
          trend === 'neutral' && 'text-mash-text3',
        )}
      >
        {trend === 'up' ? '↑ ' : ''}
        {delta}
      </p>
    </Card>
  );
}

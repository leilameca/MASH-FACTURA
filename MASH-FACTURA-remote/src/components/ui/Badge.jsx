import { cn } from '../../lib/utils';

const variants = {
  default: 'bg-mash-surface2 text-mash-text3',
  success: 'bg-green-50 text-green-800 ring-green-200',
  warning: 'bg-amber-50 text-amber-800 ring-amber-200',
  error: 'bg-red-50 text-red-800 ring-red-200',
  info: 'bg-blue-50 text-blue-800 ring-blue-200',
  premium: 'bg-mash-champagneBg text-mash-brand',
  olive: 'bg-mash-oliveBg text-mash-olive',
};

export function Badge({ className, variant = 'default', children }) {
  return (
    <span
      className={cn(
        'inline-flex h-6 items-center rounded-full px-2 text-[11px] font-semibold uppercase tracking-[0.04em] ring-1 ring-inset ring-transparent',
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

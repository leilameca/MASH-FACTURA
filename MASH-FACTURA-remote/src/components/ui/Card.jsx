import { cn } from '../../lib/utils';

export function Card({ className, clickable = false, ...props }) {
  return (
    <section
      className={cn(
        'rounded-2xl border border-mash-border bg-white p-5 shadow-mash transition md:p-6',
        clickable && 'hover:border-mash-borderMd hover:shadow-mashLg',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('mb-4 flex items-start justify-between gap-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn('text-lg font-semibold text-mash-text1', className)} {...props} />;
}

export function CardBody({ className, ...props }) {
  return <div className={cn('space-y-4', className)} {...props} />;
}

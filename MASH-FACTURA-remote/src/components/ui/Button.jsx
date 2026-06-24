import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

const variants = {
  primary: 'border-transparent bg-mash-brand text-white hover:opacity-85',
  secondary: 'border-mash-borderMd bg-transparent text-mash-text1 hover:bg-mash-surface2',
  ghost: 'border-transparent bg-transparent text-mash-text2 hover:bg-mash-surface2 hover:text-mash-text1',
  destructive: 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100',
  champagne: 'border-transparent bg-mash-brand text-mash-champagne hover:opacity-85',
};

const sizes = {
  sm: 'min-h-10 px-3 text-[13px]',
  md: 'min-h-12 px-5 text-sm md:min-h-10 md:px-[18px]',
  lg: 'min-h-12 px-6 text-sm',
};

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}) {
  const VisibleIcon = loading ? Loader2 : Icon;

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-[10px] border font-semibold transition duration-100 active:scale-[0.98] disabled:opacity-35',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      type={type}
      {...props}
    >
      {VisibleIcon ? <VisibleIcon className={cn('h-4 w-4', loading && 'animate-spin')} /> : null}
      {children}
    </button>
  );
}

import { CheckCircle2, Info, X, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '../../lib/utils';

const config = {
  success: { Icon: CheckCircle2, iconClass: 'text-[#166534]', barClass: 'bg-[#166534]' },
  error:   { Icon: XCircle,      iconClass: 'text-red-800',   barClass: 'bg-red-600'   },
  info:    { Icon: Info,         iconClass: 'text-blue-800',  barClass: 'bg-blue-600'  },
  warning: { Icon: Info,         iconClass: 'text-amber-800', barClass: 'bg-amber-500' },
};

export function Toast({ message, type = 'success', duration = 4000 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timer = window.setTimeout(() => setVisible(false), duration);
    return () => window.clearTimeout(timer);
  }, [message, duration]);

  if (!message || !visible) return null;

  const { Icon, iconClass, barClass } = config[type] ?? config.info;

  return (
    <div
      className={cn(
        'toast-safe fixed z-[140] max-w-[340px] overflow-hidden rounded-2xl border border-mash-border bg-white shadow-mashXl',
        'left-1/2 -translate-x-1/2',
        'md:bottom-auto md:left-auto md:right-4 md:top-4 md:translate-x-0',
        'animate-[page-enter_200ms_ease-out_both]',
      )}
      role="alert"
    >
      {/* progress bar */}
      <div
        className={cn('h-0.5 w-full animate-[shrink-width_linear_both]', barClass)}
        style={{ animationDuration: `${duration}ms` }}
      />
      <div className="flex items-start gap-3 p-4">
        <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconClass)} />
        <p className="flex-1 text-sm font-medium leading-5 text-mash-text1">{message}</p>
        <button
          className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-mash-text3 transition hover:bg-mash-surface2"
          onClick={() => setVisible(false)}
          type="button"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Modal({ open, title, children, footer, onClose, size = 'md' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-black/50 backdrop-blur-sm md:items-center md:p-4">
      <section
        className={cn(
          'modal-sheet modal-enter flex max-h-[92vh] w-full flex-col rounded-t-3xl bg-white shadow-mashXl md:rounded-2xl',
          size === 'sm' && 'md:max-w-md',
          size === 'md' && 'md:max-w-xl',
          size === 'lg' && 'md:max-w-3xl',
          size === 'xl' && 'md:max-w-5xl',
        )}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-mash-border px-6 py-5">
          <h2 className="text-lg font-semibold text-mash-text1">{title}</h2>
          <button className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] text-mash-text3 hover:bg-mash-surface2" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {children}
        </div>
        {footer ? (
          <footer className="shrink-0 border-t border-mash-border px-6 py-4">
            <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">{footer}</div>
          </footer>
        ) : null}
      </section>
    </div>
  );
}

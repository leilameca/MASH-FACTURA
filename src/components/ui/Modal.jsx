import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export function Modal({ open, title, children, footer, onClose, size = 'md' }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center overflow-y-auto bg-black/50 px-0 backdrop-blur-sm md:items-center md:p-6"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
        paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
      }}
    >
      <section
        className={cn(
          'modal-sheet modal-enter max-h-[calc(100vh-24px)] w-full overflow-y-auto rounded-t-3xl bg-white shadow-mashXl md:max-h-[calc(100vh-48px)] md:rounded-2xl',
          size === 'sm' && 'md:max-w-md',
          size === 'md' && 'md:max-w-xl',
          size === 'lg' && 'md:max-w-3xl',
          size === 'xl' && 'md:max-w-5xl',
        )}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-mash-border bg-white px-6 py-5">
          <h2 className="text-lg font-semibold text-mash-text1">{title}</h2>
          <button className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] text-mash-text3 hover:bg-mash-surface2" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="px-6 py-5">
          {children}
        </div>
        {footer ? (
          <footer className="border-t border-mash-border bg-white px-6 py-4">
            <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">{footer}</div>
          </footer>
        ) : null}
      </section>
    </div>
  );
}

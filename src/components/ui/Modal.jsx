import { X } from 'lucide-react';
import { useEffect } from 'react';
import { cn } from '../../lib/utils';

export function Modal({ open, title, children, footer, onClose, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;

    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay fixed inset-0 z-[120] flex items-end justify-center bg-black/50 px-0 backdrop-blur-sm md:items-start md:p-8">
      <section
        className={cn(
          'modal-sheet modal-enter flex w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-mashXl md:my-auto md:rounded-2xl',
          size === 'sm' && 'md:max-w-md',
          size === 'md' && 'md:max-w-xl',
          size === 'lg' && 'md:max-w-3xl',
          size === 'xl' && 'md:max-w-4xl',
        )}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-mash-border bg-white px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="text-lg font-semibold text-mash-text1">{title}</h2>
          <button className="grid h-11 w-11 shrink-0 place-items-center rounded-[10px] text-mash-text3 hover:bg-mash-surface2" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="modal-content min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {children}
        </div>
        {footer ? (
          <footer className="modal-footer shrink-0 border-t border-mash-border bg-white px-4 py-3 sm:px-6 sm:py-4">
            <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-end">{footer}</div>
          </footer>
        ) : null}
      </section>
    </div>
  );
}

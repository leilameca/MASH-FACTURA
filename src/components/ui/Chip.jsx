import { cn } from '../../lib/utils';

export function Chip({ active = false, children }) {
  return (
    <button
      className={cn(
        'h-9 shrink-0 rounded-full px-4 text-sm font-medium transition',
        active ? 'bg-mash-brand text-white' : 'bg-mash-surface2 text-mash-text2 hover:bg-mash-border',
      )}
      type="button"
    >
      {children}
    </button>
  );
}

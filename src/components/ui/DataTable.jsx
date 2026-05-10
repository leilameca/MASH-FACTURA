import { cn } from '../../lib/utils';

export function DataTable({ columns, rows, renderRow }) {
  return (
    <div className="hidden overflow-x-auto rounded-2xl border border-mash-border bg-white md:block">
      <table className="w-full border-collapse">
        <thead className="sticky top-16 bg-mash-surface2">
          <tr>
            {columns.map((column) => (
              <th
                className={cn(
                  'border-b border-mash-border px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-mash-text3',
                  column.align === 'right' && 'text-right',
                )}
                key={column.key}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => renderRow(row))}
        </tbody>
      </table>
    </div>
  );
}

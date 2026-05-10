import { cn } from '../../lib/utils';

export function Skeleton({ className }) {
  return (
    <div
      className={cn(
        'animate-[shimmer_1.5s_infinite] rounded-xl bg-[linear-gradient(90deg,#F4F4F5_25%,#EAEAEA_50%,#F4F4F5_75%)] bg-[length:200%_100%]',
        className,
      )}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-mash-border bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-36" />
        </div>
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <Skeleton className="mt-4 h-3 w-32" />
    </div>
  );
}

export function SkeletonRow() {
  return (
    <tr className="border-b border-mash-surface2">
      {[60, 100, 80, 60, 72].map((w, i) => (
        <td className="px-4 py-4" key={i}>
          <Skeleton className={`h-4`} style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

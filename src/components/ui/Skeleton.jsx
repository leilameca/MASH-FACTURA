import { cn } from '../../lib/utils';

export function Skeleton({ className }) {
  return (
    <div
      className={cn('animate-[shimmer_1.5s_infinite] rounded-md bg-[linear-gradient(90deg,#F4F4F5_25%,#EAEAEA_50%,#F4F4F5_75%)] bg-[length:200%_100%]', className)}
    />
  );
}

import { cn } from '../../lib/utils';

export function Input({ label, error, helper, className, prefix: Prefix, ...props }) {
  return (
    <label className="block">
      {label ? <span className="mb-1.5 block text-[13px] font-medium text-mash-text2">{label}</span> : null}
      <span className="relative block">
        {Prefix ? <Prefix className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mash-text4" /> : null}
        <input
          className={cn(
            'min-h-12 w-full rounded-[10px] border border-mash-borderMd bg-white px-3.5 text-sm text-mash-text1 outline-none transition placeholder:text-mash-text4 focus:border-mash-brand focus:shadow-[0_0_0_3px_rgba(10,10,11,0.08)] disabled:bg-mash-surface2 disabled:text-mash-text4 md:min-h-10',
            Prefix && 'pl-10',
            error && 'border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]',
            className,
          )}
          {...props}
        />
      </span>
      {error ? <span className="mt-1 block text-xs text-red-800">{error}</span> : null}
      {!error && helper ? <span className="mt-1 block text-xs text-mash-text3">{helper}</span> : null}
    </label>
  );
}

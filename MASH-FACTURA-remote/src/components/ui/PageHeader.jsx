export function PageHeader({ title, subtitle, actions, count }) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[20px] font-bold tracking-[-0.015em] text-mash-text1 md:text-[28px]">{title}</h1>
          {count ? (
            <span className="rounded-full bg-mash-surface2 px-2 py-1 text-xs font-semibold text-mash-text3">
              {count}
            </span>
          ) : null}
        </div>
        {subtitle ? <p className="mt-1 text-sm leading-snug text-mash-text3">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

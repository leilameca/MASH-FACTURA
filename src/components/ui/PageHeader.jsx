export function PageHeader({ title, subtitle, actions, count }) {
  return (
    <header className="flex items-start justify-between gap-4">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-[22px] font-bold tracking-[-0.015em] text-mash-text1 md:text-[28px]">{title}</h1>
          {count ? (
            <span className="rounded-full bg-mash-surface2 px-2 py-1 text-xs font-semibold text-mash-text3">
              {count}
            </span>
          ) : null}
        </div>
        {subtitle ? <p className="mt-1 text-sm text-mash-text3">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

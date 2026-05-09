import { NavLink } from 'react-router-dom';
import { bottomNav } from '../../constants/navigation';
import { cn } from '../../lib/utils';

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-mash-border bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      {bottomNav.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            className={({ isActive }) =>
              cn(
                'relative flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-mash-text4',
                isActive && 'text-mash-brand',
              )
            }
            key={item.path}
            to={item.path}
          >
            {({ isActive }) => (
              <>
                <Icon className={cn(item.center ? 'h-[26px] w-[26px]' : 'h-[22px] w-[22px]')} />
                {!item.center ? <span>{item.label}</span> : <span className="sr-only">{item.label}</span>}
                {isActive ? <span className="absolute top-2 h-1 w-1 rounded-full bg-mash-brand" /> : null}
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}

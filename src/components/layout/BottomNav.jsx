import { X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { accountNav, bottomNav, mainNav, navSections } from '../../constants/navigation';
import { cn } from '../../lib/utils';

export function BottomNav() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* ── Drawer overlay ─────────────────────────────── */}
      {drawerOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setDrawerOpen(false)}
        />
      ) : null}

      {/* ── More drawer ────────────────────────────────── */}
      <div
        className={cn(
          'fixed inset-x-0 bottom-[64px] z-50 max-h-[76vh] overflow-y-auto rounded-t-3xl border-t border-mash-border bg-white pb-4 shadow-xl transition-transform duration-300 lg:hidden',
          drawerOpen ? 'translate-y-0' : 'translate-y-full',
        )}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 1rem)' }}
      >
        <div className="flex items-center justify-between px-6 pb-2 pt-5">
          <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-mash-text3">Más secciones</p>
          <button
            className="grid h-9 w-9 place-items-center rounded-[10px] text-mash-text3 hover:bg-mash-surface2"
            onClick={() => setDrawerOpen(false)}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-5 px-4">
          {navSections.map((section) => {
            const items = mainNav.filter((item) => item.section === section);
            return (
              <section key={section}>
                <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-mash-text4">
                  {section}
                </p>
                <nav className="grid grid-cols-3 gap-1">
                  {items.map((item) => (
                    <DrawerLink
                      active={location.pathname === item.path}
                      item={item}
                      key={item.path}
                      onClose={() => setDrawerOpen(false)}
                    />
                  ))}
                </nav>
              </section>
            );
          })}

          <section>
            <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-mash-text4">
              Cuenta
            </p>
            <nav className="grid grid-cols-2 gap-1">
              {accountNav.map((item) => (
                <DrawerLink
                  active={location.pathname === item.path}
                  item={item}
                  key={item.path}
                  onClose={() => setDrawerOpen(false)}
                />
              ))}
            </nav>
          </section>
        </div>
      </div>

      {/* ── Bottom tab bar ─────────────────────────────── */}
      <nav
        className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-mash-border bg-white/95 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {bottomNav.map((item) => {
          const Icon = item.icon;
          if (!item.path) {
            return (
              <button
                className={cn(
                  'relative flex min-h-[60px] flex-col items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-[0.04em]',
                  drawerOpen ? 'text-mash-brand' : 'text-mash-text4',
                )}
                key="mas"
                onClick={() => setDrawerOpen((v) => !v)}
                type="button"
              >
                <Icon className="h-[22px] w-[22px]" />
                <span>{item.label}</span>
                {drawerOpen ? <span className="absolute top-2 h-1 w-1 rounded-full bg-mash-brand" /> : null}
              </button>
            );
          }
          return (
            <NavLink
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-[60px] flex-col items-center justify-center gap-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-mash-text4',
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
    </>
  );
}

function DrawerLink({ item, active, onClose }) {
  const Icon = item.icon;
  return (
    <NavLink
      className={cn(
        'flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-2xl p-3 text-[11px] font-semibold text-mash-text3 transition',
        active ? 'bg-mash-brand text-white' : 'hover:bg-mash-surface2',
      )}
      onClick={onClose}
      to={item.path}
    >
      <Icon className="h-5 w-5" />
      <span className="text-center leading-tight">{item.label}</span>
    </NavLink>
  );
}

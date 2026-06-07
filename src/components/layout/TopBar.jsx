import { Bell, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { GlobalSearch } from './GlobalSearch';

export function TopBar({ title }) {
  const { user, profile, role } = useAuth();
  const name = profile?.full_name ?? user?.user_metadata?.full_name ?? user?.email ?? 'MASH';
  const roleLabel = role === 'tecnico' ? 'Técnico' : role === 'admin' ? 'Administrador' : 'Equipo';
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-mash-border bg-white/95 px-8 backdrop-blur lg:flex">
        <h1 className="text-xl font-semibold text-mash-text1">{title}</h1>
        <div className="flex items-center gap-3">
          <button
            className="flex h-10 items-center gap-2 rounded-[10px] border border-mash-border px-3 text-mash-text3 hover:bg-mash-surface2 transition"
            onClick={() => setSearchOpen(true)}
            type="button"
          >
            <Search className="h-4 w-4" />
            <span className="text-xs">Buscar</span>
            <kbd className="rounded border border-mash-border px-1.5 py-0.5 text-[10px]">⌘K</kbd>
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-[10px] text-mash-text3 hover:bg-mash-surface2" type="button">
            <Bell className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 border-l border-mash-border pl-3">
            <div className="text-right">
              <p className="text-sm font-medium text-mash-text1">{name}</p>
              <p className="text-xs text-mash-text3">{roleLabel}</p>
            </div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-mash-surface2 text-xs font-semibold text-mash-text1">MS</div>
          </div>
        </div>
      </header>

      <GlobalSearch onClose={() => setSearchOpen(false)} open={searchOpen} />
    </>
  );
}

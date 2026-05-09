import { NavLink } from 'react-router-dom';
import { accountNav, mainNav } from '../../constants/navigation';
import { cn } from '../../lib/utils';

const sections = ['Principal', 'Comercial', 'Operaciones', 'Finanzas', 'Documentos'];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-60 overflow-y-auto border-r border-[#1C1C1E] bg-[#0A0A0B] lg:block">
      <div className="flex h-16 items-center gap-2 px-4">
        <div className="grid h-8 w-8 place-items-center rounded-[8px] bg-white text-sm font-bold text-mash-brand">M</div>
        <div className="leading-none">
          <p className="text-sm font-bold text-white">MASH</p>
          <p className="mt-1 text-[13px] font-semibold text-mash-champagne">Flow</p>
        </div>
      </div>

      <nav className="px-2 pb-28">
        {sections.map((section) => (
          <div key={section}>
            <p className="px-3 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#3F3F46]">
              {section}
            </p>
            <div className="space-y-0.5">
              {mainNav
                .filter((item) => item.section === section)
                .map((item) => (
                  <SidebarLink key={item.path} item={item} />
                ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-[#1C1C1E] bg-[#0A0A0B] p-4">
        <div className="mb-3 space-y-0.5">
          {accountNav.map((item) => (
            <SidebarLink key={item.label} item={item} compact />
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[#2A2A2E] text-xs font-semibold text-white">MS</div>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-white">Martinez Star Home</p>
            <p className="text-[11px] text-mash-text3">Uso interno</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          'flex min-h-10 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-mash-text3 transition hover:bg-[#1C1C1E] hover:text-white',
          isActive && 'border-l-2 border-mash-champagne bg-[#2A2A2E] pl-2.5 font-semibold text-white',
        )
      }
      to={item.path}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  );
}

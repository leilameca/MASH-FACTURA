import { Bell } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/clients': 'Clientes',
  '/products': 'Productos y servicios',
  '/quotes': 'Cotizaciones',
  '/invoices': 'Facturas',
  '/orders': 'Pedidos',
  '/inventory': 'Inventario',
  '/repairs': 'Reparaciones',
  '/payments': 'Pagos',
  '/expenses': 'Gastos',
  '/suppliers': 'Suplidores',
  '/documents': 'Documentos',
  '/settings': 'Configuración',
  '/account': 'Mi cuenta',
};

function useGreeting() {
  const { user } = useAuth();
  const firstName = (user?.user_metadata?.full_name ?? user?.email ?? 'MASH').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches';
  const date = new Date().toLocaleDateString('es-DO', { weekday: 'long', day: 'numeric', month: 'long' });
  const dateCapitalized = date.charAt(0).toUpperCase() + date.slice(1);
  return { greeting, firstName, date: dateCapitalized };
}

export function AppShell() {
  const location = useLocation();
  const title = routeTitles[location.pathname] ?? 'MASH Flow';
  const { greeting, firstName, date } = useGreeting();

  return (
    <div className="min-h-screen bg-mash-bg">
      <Sidebar />
      <div className="lg:pl-60">
        <TopBar title={title} />
        <main className="page-enter px-4 pb-24 pt-5 md:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <div>
                <h1 className="text-[22px] font-bold tracking-[-0.015em] text-mash-text1">
                  {greeting}, {firstName}
                </h1>
                <p className="mt-0.5 text-[13px] text-mash-text3">{date}</p>
              </div>
              <button className="grid h-11 w-11 place-items-center rounded-[10px] text-mash-text2 transition hover:bg-white" type="button">
                <Bell className="h-[22px] w-[22px]" />
              </button>
            </div>
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

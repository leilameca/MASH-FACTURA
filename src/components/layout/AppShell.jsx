import { Bell } from 'lucide-react';
import { Outlet, useLocation } from 'react-router-dom';
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
  '/repairs': 'Reparaciones',
  '/payments': 'Pagos',
  '/expenses': 'Gastos',
  '/suppliers': 'Suplidores',
  '/documents': 'Documentos',
  '/settings': 'Configuración',
};

export function AppShell() {
  const location = useLocation();
  const title = routeTitles[location.pathname] ?? 'MASH Flow';

  return (
    <div className="min-h-screen bg-mash-bg">
      <Sidebar />
      <div className="lg:pl-60">
        <TopBar title={title} />
        <main className="page-enter px-4 pb-24 pt-5 md:px-6 lg:px-8 lg:pb-10 lg:pt-8">
          <div className="mx-auto max-w-[1440px]">
            <div className="mb-5 flex items-center justify-between lg:hidden">
              <div>
                <h1 className="text-[22px] font-bold tracking-[-0.015em] text-mash-text1">Hola, MASH</h1>
                <p className="text-[13px] text-mash-text3">Sábado, 9 de mayo de 2026</p>
              </div>
              <button className="grid h-11 w-11 place-items-center rounded-[10px] text-mash-text2" type="button">
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

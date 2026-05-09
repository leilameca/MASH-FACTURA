import { Package } from 'lucide-react';
import { ModuleEmptyPage } from '../../components/features/ModuleEmptyPage';

export function OrdersPage() {
  return <ModuleEmptyPage actionLabel="Nuevo pedido" emptyDescription="Aquí aparecerán los pedidos en producción." emptyTitle="Sin pedidos activos" icon={Package} subtitle="Producción, responsables, prioridades y entregas prometidas." title="Pedidos" />;
}

import { ShoppingBag } from 'lucide-react';
import { ModuleEmptyPage } from '../../components/features/ModuleEmptyPage';

export function ProductsPage() {
  return <ModuleEmptyPage actionLabel="Nuevo producto" emptyDescription="Agrega muebles, servicios y variaciones para usarlos en cotizaciones y facturas." emptyTitle="Sin productos aún" icon={ShoppingBag} subtitle="Catálogo operativo de productos y servicios." title="Productos y servicios" />;
}

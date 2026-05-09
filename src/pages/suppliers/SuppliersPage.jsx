import { Truck } from 'lucide-react';
import { ModuleEmptyPage } from '../../components/features/ModuleEmptyPage';

export function SuppliersPage() {
  return <ModuleEmptyPage actionLabel="Nuevo suplidor" emptyDescription="Centraliza proveedores, contactos, categorías y compras relacionadas." emptyTitle="Sin suplidores aún" icon={Truck} subtitle="Proveedores, materiales y compras recurrentes." title="Suplidores" />;
}

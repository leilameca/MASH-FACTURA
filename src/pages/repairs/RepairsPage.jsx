import { Wrench } from 'lucide-react';
import { ModuleEmptyPage } from '../../components/features/ModuleEmptyPage';

export function RepairsPage() {
  return <ModuleEmptyPage actionLabel="Nueva reparación" emptyDescription="Registra artículos recibidos, diagnóstico, monto cotizado y fecha estimada de entrega." emptyTitle="Sin reparaciones" icon={Wrench} subtitle="Recepción, diagnóstico y seguimiento de reparaciones." title="Reparaciones" />;
}

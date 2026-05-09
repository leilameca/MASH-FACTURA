import { TrendingDown } from 'lucide-react';
import { ModuleEmptyPage } from '../../components/features/ModuleEmptyPage';

export function ExpensesPage() {
  return <ModuleEmptyPage actionLabel="Registrar gasto" emptyDescription="Registra los gastos del negocio para tener control de tus márgenes." emptyTitle="Sin gastos este mes" icon={TrendingDown} subtitle="Materiales, servicios, nómina, envíos y otros costos." title="Gastos" />;
}

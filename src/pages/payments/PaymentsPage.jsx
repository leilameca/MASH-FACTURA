import { CreditCard } from 'lucide-react';
import { ModuleEmptyPage } from '../../components/features/ModuleEmptyPage';

export function PaymentsPage() {
  return <ModuleEmptyPage actionLabel="Registrar pago" emptyDescription="Los pagos parciales y completos aparecerán aquí con referencia y método de pago." emptyTitle="Sin pagos registrados" icon={CreditCard} subtitle="Control de cobros, referencias y conciliación." title="Pagos" />;
}

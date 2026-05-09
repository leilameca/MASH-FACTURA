import { Receipt } from 'lucide-react';
import { ModuleEmptyPage } from '../../components/features/ModuleEmptyPage';

export function InvoicesPage() {
  return <ModuleEmptyPage actionLabel="Nueva factura" emptyDescription="Convierte una cotización aprobada en factura, o crea una directamente." emptyTitle="Sin facturas emitidas" icon={Receipt} subtitle="Facturación, NCF, vencimientos y pagos parciales." title="Facturas" />;
}

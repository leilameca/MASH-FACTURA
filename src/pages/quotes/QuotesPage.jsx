import { FileSearch } from 'lucide-react';
import { ModuleEmptyPage } from '../../components/features/ModuleEmptyPage';

export function QuotesPage() {
  return <ModuleEmptyPage actionLabel="Nueva cotización" emptyDescription="Crea tu primera cotización y envíasela a un cliente." emptyTitle="Sin cotizaciones" icon={FileSearch} premium subtitle="Propuestas comerciales, términos y conversión a factura." title="Cotizaciones" />;
}

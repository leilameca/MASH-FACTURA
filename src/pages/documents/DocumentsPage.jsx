import { FileBadge } from 'lucide-react';
import { ModuleEmptyPage } from '../../components/features/ModuleEmptyPage';

export function DocumentsPage() {
  return <ModuleEmptyPage actionLabel="Generar PDF" emptyDescription="Aquí vivirán cotizaciones, facturas, garantías y albaranes listos para ver, descargar o compartir." emptyTitle="Sin documentos" icon={FileBadge} premium subtitle="PDFs corporativos, monocromáticos y listos para cliente." title="Documentos" />;
}

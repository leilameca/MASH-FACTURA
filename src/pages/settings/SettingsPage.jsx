import { Settings } from 'lucide-react';
import { ModuleEmptyPage } from '../../components/features/ModuleEmptyPage';

export function SettingsPage() {
  return <ModuleEmptyPage actionLabel="Guardar" emptyDescription="Configura datos de empresa, impuestos, usuarios, permisos y plantillas de documentos." emptyTitle="Configuración pendiente" icon={Settings} subtitle="Preferencias del sistema y datos corporativos." title="Configuración" />;
}

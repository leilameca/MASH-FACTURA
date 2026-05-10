import { FileText, Wrench } from 'lucide-react';
import { useState } from 'react';
import { CrudModule } from '../../components/features/CrudModule';
import { ImageManager } from '../../components/features/ImageManager';
import { Button } from '../../components/ui/Button';
import { Toast } from '../../components/ui/Toast';
import { repairStatuses, statusLabels } from '../../constants/options';
import { getRow } from '../../services/crudService';
import { generatePickupNotePdf } from '../../services/pdfService.jsx';

const statusOptions = repairStatuses.map((value) => ({ value, label: statusLabels[value] }));

export function RepairsPage() {
  const [toast, setToast] = useState(null);
  const [generating, setGenerating] = useState(null);

  async function handlePickupPdf(row) {
    setGenerating(row.id);
    try {
      const repair = await getRow('repairs', row.id, '*, clients(full_name,email,phone)');
      const url = await generatePickupNotePdf({ repair, client: repair.clients });
      window.open(url, '_blank', 'noopener,noreferrer');
      setToast({ type: 'success', message: 'Albarán generado.' });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setGenerating(null);
    }
  }

  return (
    <>
      <Toast message={toast?.message} type={toast?.type} />
      <CrudModule
        actionLabel="Nueva reparación"
        columns={[
          { key: 'repair_number', label: 'Reparación' },
          { key: 'client_name', label: 'Cliente', accessor: (row) => row.clients?.full_name },
          { key: 'furniture_type', label: 'Mueble' },
          { key: 'status', label: 'Estado', type: 'status' },
          { key: 'pickup_date', label: 'Recogida', type: 'date' },
          { key: 'repair_cost', label: 'Costo', type: 'currency', align: 'right' },
        ]}
        emptyDescription="Registra artículos recibidos, diagnóstico, monto cotizado y fecha estimada de entrega."
        emptyIcon={Wrench}
        emptyTitle="Sin reparaciones"
        detail={(repair) => (
          <ImageManager
            bucket="repair-images"
            foreignKey="repair_id"
            parentId={repair.id}
            table="repair_images"
            title="Imágenes de la reparación"
          />
        )}
        fields={[
          { name: 'client_id', label: 'Cliente', type: 'lookup', lookupTable: 'clients', lookupLabel: 'full_name', lookupOrderBy: 'full_name', required: true },
          { name: 'order_id', label: 'Pedido', type: 'lookup', lookupTable: 'orders', lookupLabel: 'order_number', lookupOrderBy: 'created_at' },
          { name: 'repair_number', label: 'Número de reparación' },
          { name: 'pickup_date', label: 'Fecha de recogida', type: 'date' },
          { name: 'pickup_time', label: 'Hora de recogida', type: 'time' },
          { name: 'delivered_by', label: 'Persona que entrega' },
          { name: 'pickup_address', label: 'Dirección de recogida' },
          { name: 'estimated_review_days', label: 'Días estimados de revisión', type: 'number' },
          { name: 'furniture_type', label: 'Tipo de mueble' },
          { name: 'material', label: 'Material' },
          { name: 'color', label: 'Color' },
          { name: 'condition_status', label: 'Estado del mueble' },
          { name: 'repair_cost', label: 'Monto cotizado', type: 'number', step: '0.01' },
          { name: 'status', label: 'Estado', type: 'select', options: statusOptions },
          { name: 'condition_notes', label: 'Notas de condición', type: 'textarea', full: true },
          { name: 'problem_description', label: 'Problema reportado', type: 'textarea', full: true },
          { name: 'accessories_received', label: 'Accesorios recibidos', type: 'textarea', full: true },
          { name: 'diagnosis', label: 'Diagnóstico', type: 'textarea', full: true },
        ]}
        filters={[{ name: 'status', options: statusOptions }]}
        getSubtitle={(row) => `${row.clients?.full_name || 'Cliente'} · ${row.problem_description || 'Sin descripción'}`}
        getTitle={(row) => row.repair_number || `Reparación ${row.id.slice(0, 8)}`}
        rowActions={(row) => (
          <Button
            disabled={generating === row.id}
            icon={FileText}
            loading={generating === row.id}
            onClick={() => handlePickupPdf(row)}
            size="sm"
            variant="champagne"
          >
            Albarán
          </Button>
        )}
        searchColumns={['repair_number', 'furniture_type', 'problem_description', 'diagnosis']}
        select="*, clients(full_name)"
        subtitle="Recepción, diagnóstico y seguimiento de reparaciones."
        table="repairs"
        title="Reparaciones"
      />
    </>
  );
}

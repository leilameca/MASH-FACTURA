import { AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

export function ConfirmDialog({ open, title = '¿Eliminar registro?', description, loading, onCancel, onConfirm }) {
  return (
    <Modal
      footer={(
        <>
          <Button className="w-full md:w-auto" disabled={loading} onClick={onCancel} variant="secondary">Cancelar</Button>
          <Button className="w-full md:w-auto" loading={loading} onClick={onConfirm} variant="destructive">Sí, eliminar</Button>
        </>
      )}
      onClose={onCancel}
      open={open}
      size="sm"
      title={title}
    >
      <div className="flex gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-800" />
        <p className="text-sm leading-6 text-red-900">{description}</p>
      </div>
    </Modal>
  );
}

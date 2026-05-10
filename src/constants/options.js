export const productCategories = [
  'muebles nuevos',
  'reparación',
  'cojines',
  'transporte',
  'entrega',
  'recogida',
  'instalación',
  'accesorios',
  'cristales',
  'otros',
];

export const expenseCategories = ['materiales', 'suplidores', 'transporte', 'alquiler', 'publicidad', 'nomina', 'otros'];

export const paymentMethods = ['efectivo', 'transferencia', 'tarjeta', 'qik', 'cheque', 'otro'];

export const quoteStatuses = ['draft', 'sent', 'approved', 'rejected', 'expired', 'cancelled'];
export const invoiceStatuses = ['draft', 'issued', 'partially_paid', 'paid', 'overdue', 'void'];
export const orderStatuses = [
  'nuevo',
  'cotizado',
  'aprobado',
  'encargado',
  'en_fabricacion',
  'en_reparacion',
  'esperando_materiales',
  'listo',
  'en_camino',
  'entregado',
  'pagado',
  'cancelado',
];
export const repairStatuses = ['recibido', 'diagnosticado', 'en_reparacion', 'listo', 'entregado', 'cancelado'];
export const documentTypes = ['cotizacion', 'factura', 'garantia', 'albaran_entrega', 'albaran_recogida', 'recibo_pago', 'orden', 'otro'];
export const documentStatuses = ['draft', 'generated', 'sent', 'signed', 'void'];
export const priorities = ['baja', 'media', 'alta'];
export const orderTypes = ['fabricacion', 'reparacion', 'venta', 'instalacion', 'mantenimiento'];

export const statusLabels = {
  draft: 'Borrador',
  sent: 'Enviada',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  expired: 'Expirada',
  cancelled: 'Cancelada',
  issued: 'Emitida',
  partially_paid: 'Abonada',
  paid: 'Pagada',
  overdue: 'Vencida',
  void: 'Anulada',
  nuevo: 'Nuevo',
  cotizado: 'Cotizado',
  aprobado: 'Aprobado',
  encargado: 'Encargado',
  en_fabricacion: 'En fabricación',
  en_reparacion: 'En reparación',
  esperando_materiales: 'Esperando materiales',
  listo: 'Listo',
  en_camino: 'En camino',
  entregado: 'Entregado',
  pagado: 'Pagado',
  cancelado: 'Cancelado',
  recibido: 'Recibido',
  diagnosticado: 'Diagnosticado',
  generated: 'Generado',
  signed: 'Firmado',
  albaran_entrega: 'Albarán entrega',
  albaran_recogida: 'Albarán recogida',
  recibo_pago: 'Recibo pago',
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  true: 'Activo',
  false: 'Inactivo',
};

export const statusVariants = {
  draft: 'default',
  sent: 'info',
  approved: 'olive',
  rejected: 'error',
  expired: 'warning',
  cancelled: 'error',
  issued: 'info',
  partially_paid: 'warning',
  paid: 'olive',
  overdue: 'warning',
  void: 'error',
  nuevo: 'default',
  cotizado: 'info',
  aprobado: 'olive',
  encargado: 'premium',
  en_fabricacion: 'info',
  en_reparacion: 'warning',
  esperando_materiales: 'warning',
  listo: 'olive',
  en_camino: 'info',
  entregado: 'olive',
  pagado: 'olive',
  cancelado: 'error',
  recibido: 'default',
  diagnosticado: 'info',
  generated: 'info',
  signed: 'olive',
  baja: 'default',
  media: 'warning',
  alta: 'error',
  true: 'olive',
  false: 'default',
};

export const metrics = [
  { label: 'Facturas del mes', value: 'RD$ 482K', delta: '12% vs mes anterior', trend: 'up' },
  { label: 'Pendiente de cobro', value: 'RD$ 96K', delta: '8 facturas abiertas', trend: 'neutral' },
  { label: 'Pedidos activos', value: '18', delta: '4 vencen esta semana', trend: 'warn' },
  { label: 'Reparaciones en curso', value: '7', delta: '2 listas para entregar', trend: 'up' },
];

export const activity = [
  { title: 'Factura FAC-0048 marcada como cobrada', meta: 'Constructora Alba · 9 may 2026', status: 'Cobrada' },
  { title: 'Cotización COT-0031 enviada', meta: 'María Fernández · 9 may 2026', status: 'Enviada' },
  { title: 'Pedido PED-0127 pasó a producción', meta: 'Villa Marina · 8 may 2026', status: 'Activo' },
  { title: 'Reparación REP-0018 diagnosticada', meta: 'José Mena · 8 may 2026', status: 'Lista' },
  { title: 'Gasto registrado en materiales', meta: 'Maderas del Norte · 7 may 2026', status: 'Gasto' },
];

export const clients = [
  { id: '001', name: 'María Fernández', email: 'maria@email.com', phone: '809-555-0194', last: '9 may 2026', total: 'RD$ 182,400.00', status: 'Activo' },
  { id: '002', name: 'Constructora Alba', email: 'compras@alba.do', phone: '809-555-2231', last: '8 may 2026', total: 'RD$ 468,900.00', status: 'Con deuda' },
  { id: '003', name: 'Villa Marina', email: 'admin@villamarina.do', phone: '809-555-1100', last: '7 may 2026', total: 'RD$ 96,200.00', status: 'Activo' },
];

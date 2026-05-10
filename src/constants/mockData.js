// ─── Metrics ────────────────────────────────────────────────────────────────
export const metrics = [
  { label: 'Facturas del mes', value: 'RD$ 482K', delta: '12% vs mes anterior', trend: 'up' },
  { label: 'Pendiente de cobro', value: 'RD$ 96K', delta: '8 facturas abiertas', trend: 'neutral' },
  { label: 'Pedidos activos', value: '18', delta: '4 vencen esta semana', trend: 'warn' },
  { label: 'Reparaciones en curso', value: '7', delta: '2 listas para entregar', trend: 'up' },
];

export const activity = [
  { title: 'Factura FAC-0048 marcada como cobrada', meta: 'Constructora Alba · 9 may 2026', status: 'paid' },
  { title: 'Cotización COT-0031 enviada al cliente', meta: 'María Fernández · 9 may 2026', status: 'sent' },
  { title: 'Pedido PED-0127 pasó a producción', meta: 'Villa Marina · 8 may 2026', status: 'en_fabricacion' },
  { title: 'Reparación REP-0018 lista para entregar', meta: 'José Mena · 8 may 2026', status: 'listo' },
  { title: 'Gasto registrado en materiales', meta: 'Maderas del Norte · 7 may 2026', status: 'draft' },
];

// ─── Clients ─────────────────────────────────────────────────────────────────
export const clients = [
  { id: '001', name: 'María Fernández', email: 'maria@email.com', phone: '809-555-0194', last: '9 may 2026', total: 'RD$ 182,400.00', status: 'Activo' },
  { id: '002', name: 'Constructora Alba', email: 'compras@alba.do', phone: '809-555-2231', last: '8 may 2026', total: 'RD$ 468,900.00', status: 'Con deuda' },
  { id: '003', name: 'Villa Marina', email: 'admin@villamarina.do', phone: '809-555-1100', last: '7 may 2026', total: 'RD$ 96,200.00', status: 'Activo' },
  { id: '004', name: 'Carlos Rodríguez', email: 'carlos.r@email.com', phone: '809-555-3341', last: '5 may 2026', total: 'RD$ 44,500.00', status: 'Activo' },
  { id: '005', name: 'Hotel Bavaro Suites', email: 'compras@bavarosuites.do', phone: '809-555-8800', last: '2 may 2026', total: 'RD$ 1,240,000.00', status: 'Activo' },
  { id: '006', name: 'Ana Martínez', email: 'ana.martinez@gmail.com', phone: '809-555-4412', last: '28 abr 2026', total: 'RD$ 28,900.00', status: 'Sin pedidos' },
];

// ─── Quotes ──────────────────────────────────────────────────────────────────
export const quotes = [
  {
    id: 'q1', number: 'COT-0048', client: 'Hotel Bavaro Suites', clientId: '005',
    date: '9 may 2026', validUntil: '9 jun 2026',
    items: 4, total: 'RD$ 248,000.00', status: 'sent',
    description: 'Set de muebles para área de piscina (8 unidades)',
  },
  {
    id: 'q2', number: 'COT-0047', client: 'María Fernández', clientId: '001',
    date: '7 may 2026', validUntil: '7 jun 2026',
    items: 2, total: 'RD$ 64,500.00', status: 'approved',
    description: 'Comedor exterior 6 puestos + sombrilla',
  },
  {
    id: 'q3', number: 'COT-0046', client: 'Constructora Alba', clientId: '002',
    date: '4 may 2026', validUntil: '4 jun 2026',
    items: 6, total: 'RD$ 512,000.00', status: 'draft',
    description: 'Mobiliario completo para proyecto residencial',
  },
  {
    id: 'q4', number: 'COT-0045', client: 'Carlos Rodríguez', clientId: '004',
    date: '28 abr 2026', validUntil: '28 may 2026',
    items: 1, total: 'RD$ 44,500.00', status: 'rejected',
    description: 'Silla mecedora exterior con cojines',
  },
  {
    id: 'q5', number: 'COT-0044', client: 'Villa Marina', clientId: '003',
    date: '20 abr 2026', validUntil: '20 may 2026',
    items: 3, total: 'RD$ 96,200.00', status: 'expired',
    description: 'Muebles para terraza y área de jardín',
  },
];

// ─── Invoices ────────────────────────────────────────────────────────────────
export const invoices = [
  {
    id: 'i1', number: 'FAC-0048', client: 'Constructora Alba', clientId: '002',
    date: '8 may 2026', dueDate: '22 may 2026',
    total: 'RD$ 468,900.00', paid: 'RD$ 234,450.00', balance: 'RD$ 234,450.00',
    status: 'partially_paid', method: 'transferencia',
    description: 'Mobiliario residencial — Parcial 1 de 2',
  },
  {
    id: 'i2', number: 'FAC-0047', client: 'María Fernández', clientId: '001',
    date: '7 may 2026', dueDate: '21 may 2026',
    total: 'RD$ 64,500.00', paid: 'RD$ 64,500.00', balance: 'RD$ 0.00',
    status: 'paid', method: 'efectivo',
    description: 'Comedor exterior 6 puestos + sombrilla',
  },
  {
    id: 'i3', number: 'FAC-0046', client: 'Hotel Bavaro Suites', clientId: '005',
    date: '30 abr 2026', dueDate: '14 may 2026',
    total: 'RD$ 1,240,000.00', paid: 'RD$ 0.00', balance: 'RD$ 1,240,000.00',
    status: 'overdue', method: null,
    description: 'Set completo para área de piscina — Hotel',
  },
  {
    id: 'i4', number: 'FAC-0045', client: 'Villa Marina', clientId: '003',
    date: '28 abr 2026', dueDate: '12 may 2026',
    total: 'RD$ 96,200.00', paid: 'RD$ 96,200.00', balance: 'RD$ 0.00',
    status: 'paid', method: 'transferencia',
    description: 'Muebles para terraza y jardín',
  },
  {
    id: 'i5', number: 'FAC-0044', client: 'Carlos Rodríguez', clientId: '004',
    date: '1 may 2026', dueDate: '15 may 2026',
    total: 'RD$ 28,500.00', paid: 'RD$ 0.00', balance: 'RD$ 28,500.00',
    status: 'issued', method: null,
    description: 'Juego de jardín 4 puestos',
  },
];

// ─── Orders ──────────────────────────────────────────────────────────────────
export const orders = [
  {
    id: 'o1', number: 'PED-0127', client: 'Villa Marina', type: 'fabricacion',
    description: 'Set de terraza completo con cojines impermeables',
    status: 'en_fabricacion', priority: 'alta',
    delivery: '20 may 2026', responsible: 'Equipo A',
    invoice: 'FAC-0045',
  },
  {
    id: 'o2', number: 'PED-0126', client: 'Hotel Bavaro Suites', type: 'fabricacion',
    description: 'Sillas de piscina blancas × 24 unidades',
    status: 'encargado', priority: 'alta',
    delivery: '25 may 2026', responsible: 'Equipo B',
    invoice: 'FAC-0046',
  },
  {
    id: 'o3', number: 'PED-0125', client: 'María Fernández', type: 'fabricacion',
    description: 'Comedor exterior 6 puestos roble + sombrilla',
    status: 'listo', priority: 'media',
    delivery: '10 may 2026', responsible: 'Equipo A',
    invoice: 'FAC-0047',
  },
  {
    id: 'o4', number: 'PED-0124', client: 'Constructora Alba', type: 'instalacion',
    description: 'Instalación pérgola madera en proyecto Las Palmas',
    status: 'aprobado', priority: 'media',
    delivery: '30 may 2026', responsible: 'Sin asignar',
    invoice: 'FAC-0048',
  },
  {
    id: 'o5', number: 'PED-0123', client: 'Carlos Rodríguez', type: 'venta',
    description: 'Juego de jardín 4 puestos aluminio gris',
    status: 'nuevo', priority: 'baja',
    delivery: '1 jun 2026', responsible: 'Sin asignar',
    invoice: 'FAC-0044',
  },
  {
    id: 'o6', number: 'PED-0122', client: 'Hotel Bavaro Suites', type: 'fabricacion',
    description: 'Mesas auxiliares aluminio × 12 unidades',
    status: 'esperando_materiales', priority: 'alta',
    delivery: '18 may 2026', responsible: 'Equipo B',
    invoice: 'FAC-0046',
  },
  {
    id: 'o7', number: 'PED-0121', client: 'Ana Martínez', type: 'venta',
    description: 'Hamaca de lujo con base de madera teca',
    status: 'entregado', priority: 'baja',
    delivery: '2 may 2026', responsible: 'Equipo A',
    invoice: null,
  },
];

// ─── Repairs ─────────────────────────────────────────────────────────────────
export const repairs = [
  {
    id: 'r1', number: 'REP-0018', client: 'José Mena', phone: '809-555-0011',
    furniture: 'Silla mecedora exterior', material: 'Aluminio / Tela textilene',
    problem: 'Tejido roto en respaldo y asiento, estructura doblada en reposabrazos',
    status: 'listo', pickupDate: '28 abr 2026', deliveryEst: '12 may 2026',
    cost: 'RD$ 4,800.00', diagnosis: 'Reemplazo de tejido y alineación de estructura',
  },
  {
    id: 'r2', number: 'REP-0017', client: 'Constructora Alba', phone: '809-555-2231',
    furniture: 'Mesa de centro exterior', material: 'Vidrio / Aluminio',
    problem: 'Vidrio rajado, falta tornillería de base',
    status: 'en_reparacion', pickupDate: '4 may 2026', deliveryEst: '16 may 2026',
    cost: 'RD$ 3,200.00', diagnosis: 'Reemplazo de vidrio templado 8mm',
  },
  {
    id: 'r3', number: 'REP-0016', client: 'Carmen Díaz', phone: '809-555-7744',
    furniture: 'Sofá de jardín 3 puestos', material: 'Rattan sintético / Cojines',
    problem: 'Cojines deteriorados por humedad, estructura con óxido superficial',
    status: 'diagnosticado', pickupDate: '6 may 2026', deliveryEst: '20 may 2026',
    cost: 'RD$ 8,500.00', diagnosis: 'Pintura anticorrosiva + cojines nuevos',
  },
  {
    id: 'r4', number: 'REP-0015', client: 'Luis Pimentel', phone: '809-555-3308',
    furniture: 'Hamaca de madera teca', material: 'Madera teca / Cuerda',
    problem: 'Tablillas de madera astilladas, cuerda desgastada',
    status: 'recibido', pickupDate: '8 may 2026', deliveryEst: '22 may 2026',
    cost: 'RD$ 6,200.00', diagnosis: null,
  },
  {
    id: 'r5', number: 'REP-0014', client: 'Villa Marina', phone: '809-555-1100',
    furniture: 'Sillas apilables × 6', material: 'Polipropileno reforzado',
    problem: 'Patas traseras dobladas en 3 unidades, otras 2 con grietas',
    status: 'entregado', pickupDate: '20 abr 2026', deliveryEst: '4 may 2026',
    cost: 'RD$ 2,400.00', diagnosis: 'Reemplazo de patas en 3 unidades, pegado estructural en 2',
  },
];

// ─── Expenses ────────────────────────────────────────────────────────────────
export const expenses = [
  {
    id: 'e1', date: '9 may 2026', description: 'Tela textilene roja para reparaciones',
    category: 'materiales', supplier: 'Textiles del Caribe', amount: 'RD$ 12,400.00',
    method: 'transferencia', receipt: true,
  },
  {
    id: 'e2', date: '8 may 2026', description: 'Envío a Hotel Bavaro Suites',
    category: 'envio', supplier: 'Fletes Rápidos RD', amount: 'RD$ 4,500.00',
    method: 'efectivo', receipt: false,
  },
  {
    id: 'e3', date: '8 may 2026', description: 'Pintura anticorrosiva y esmalte exterior',
    category: 'materiales', supplier: 'Distribuidora Pinturas Norte', amount: 'RD$ 8,200.00',
    method: 'transferencia', receipt: true,
  },
  {
    id: 'e4', date: '7 may 2026', description: 'Pago nómina semanal operarios',
    category: 'nomina', supplier: null, amount: 'RD$ 32,000.00',
    method: 'transferencia', receipt: false,
  },
  {
    id: 'e5', date: '6 may 2026', description: 'Alquiler local taller — mayo 2026',
    category: 'alquiler', supplier: 'Inversiones Pérez', amount: 'RD$ 18,000.00',
    method: 'cheque', receipt: true,
  },
  {
    id: 'e6', date: '5 may 2026', description: 'Aluminio perfilado × 40 metros',
    category: 'materiales', supplier: 'Maderas del Norte', amount: 'RD$ 22,600.00',
    method: 'transferencia', receipt: true,
  },
  {
    id: 'e7', date: '3 may 2026', description: 'Herramientas: taladro y pulidora',
    category: 'herramientas', supplier: 'Ferretería Central', amount: 'RD$ 9,800.00',
    method: 'tarjeta', receipt: true,
  },
  {
    id: 'e8', date: '2 may 2026', description: 'Transporte a clientes zona norte',
    category: 'envio', supplier: null, amount: 'RD$ 3,200.00',
    method: 'efectivo', receipt: false,
  },
];

// ─── Suppliers ───────────────────────────────────────────────────────────────
export const suppliers = [
  {
    id: 's1', name: 'Textiles del Caribe', contact: 'Pedro Almonte',
    phone: '809-555-9010', email: 'ventas@textilescaribe.do',
    category: 'Telas y tapizado', active: true, totalPurchased: 'RD$ 148,000.00',
  },
  {
    id: 's2', name: 'Maderas del Norte', contact: 'Sandra Reyes',
    phone: '809-555-4421', email: 'sandra@maderasnorte.do',
    category: 'Madera y perfiles', active: true, totalPurchased: 'RD$ 320,400.00',
  },
  {
    id: 's3', name: 'Ferretería Central', contact: 'Ramón Gil',
    phone: '809-555-8800', email: 'info@ferreteriacentral.do',
    category: 'Herramientas y fijaciones', active: true, totalPurchased: 'RD$ 88,200.00',
  },
  {
    id: 's4', name: 'Fletes Rápidos RD', contact: 'Luis Santos',
    phone: '829-555-1177', email: 'logistica@fletesrd.do',
    category: 'Logística y transporte', active: true, totalPurchased: 'RD$ 64,500.00',
  },
  {
    id: 's5', name: 'Distribuidora Pinturas Norte', contact: 'Carmen Jáquez',
    phone: '809-555-3344', email: 'ventas@pinturarnorte.do',
    category: 'Pinturas y acabados', active: false, totalPurchased: 'RD$ 42,000.00',
  },
];

// ─── Products ────────────────────────────────────────────────────────────────
export const products = [
  {
    id: 'p1', name: 'Silla de piscina apilable', category: 'muebles nuevos',
    price: 'RD$ 8,500.00', cost: 'RD$ 4,800.00', margin: '43.5%', active: true,
  },
  {
    id: 'p2', name: 'Mesa comedor exterior 6 puestos', category: 'muebles nuevos',
    price: 'RD$ 42,000.00', cost: 'RD$ 24,000.00', margin: '42.9%', active: true,
  },
  {
    id: 'p3', name: 'Sofá exterior 3 puestos rattan', category: 'muebles nuevos',
    price: 'RD$ 68,000.00', cost: 'RD$ 38,000.00', margin: '44.1%', active: true,
  },
  {
    id: 'p4', name: 'Hamaca de madera teca con base', category: 'muebles nuevos',
    price: 'RD$ 28,500.00', cost: 'RD$ 15,000.00', margin: '47.4%', active: true,
  },
  {
    id: 'p5', name: 'Servicio de tapizado / reparación', category: 'reparación',
    price: 'RD$ 3,500.00', cost: 'RD$ 800.00', margin: '77.1%', active: true,
  },
  {
    id: 'p6', name: 'Cojines impermeables por par', category: 'cojines',
    price: 'RD$ 2,800.00', cost: 'RD$ 1,200.00', margin: '57.1%', active: false,
  },
  {
    id: 'p7', name: 'Instalación y montaje', category: 'instalación',
    price: 'RD$ 4,000.00', cost: 'RD$ 1,500.00', margin: '62.5%', active: true,
  },
];

// ─── Payments ────────────────────────────────────────────────────────────────
export const payments = [
  {
    id: 'pay1', date: '9 may 2026', client: 'María Fernández',
    invoice: 'FAC-0047', amount: 'RD$ 64,500.00',
    method: 'efectivo', reference: null, notes: 'Pago completo en efectivo',
  },
  {
    id: 'pay2', date: '8 may 2026', client: 'Constructora Alba',
    invoice: 'FAC-0048', amount: 'RD$ 234,450.00',
    method: 'transferencia', reference: 'TRF-20240508-001', notes: 'Primer abono 50%',
  },
  {
    id: 'pay3', date: '28 abr 2026', client: 'Villa Marina',
    invoice: 'FAC-0045', amount: 'RD$ 96,200.00',
    method: 'transferencia', reference: 'TRF-20240428-005', notes: null,
  },
  {
    id: 'pay4', date: '20 abr 2026', client: 'Hotel Bavaro Suites',
    invoice: 'FAC-0043', amount: 'RD$ 180,000.00',
    method: 'cheque', reference: 'CHQ-8841', notes: 'Anticipo 50%',
  },
  {
    id: 'pay5', date: '15 abr 2026', client: 'Carlos Rodríguez',
    invoice: 'FAC-0042', amount: 'RD$ 44,500.00',
    method: 'tarjeta', reference: 'CARD-4412', notes: null,
  },
];

// ─── Documents ───────────────────────────────────────────────────────────────
export const documents = [
  {
    id: 'd1', type: 'factura', number: 'FAC-0047', client: 'María Fernández',
    date: '7 may 2026', status: 'generated', relatedInvoice: 'FAC-0047',
  },
  {
    id: 'd2', type: 'cotizacion', number: 'COT-0048', client: 'Hotel Bavaro Suites',
    date: '9 may 2026', status: 'sent', relatedQuote: 'COT-0048',
  },
  {
    id: 'd3', type: 'garantia', number: 'GAR-0012', client: 'Villa Marina',
    date: '28 abr 2026', status: 'signed', relatedInvoice: 'FAC-0045',
  },
  {
    id: 'd4', type: 'albaran', number: 'ALB-0024', client: 'María Fernández',
    date: '7 may 2026', status: 'generated', relatedOrder: 'PED-0125',
  },
  {
    id: 'd5', type: 'recibo', number: 'PAG-0018', client: 'Constructora Alba',
    date: '8 may 2026', status: 'generated', relatedInvoice: 'FAC-0048',
  },
  {
    id: 'd6', type: 'cotizacion', number: 'COT-0047', client: 'María Fernández',
    date: '7 may 2026', status: 'signed', relatedQuote: 'COT-0047',
  },
];

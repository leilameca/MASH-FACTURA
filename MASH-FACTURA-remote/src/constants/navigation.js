import {
  ClipboardList,
  CreditCard,
  DollarSign,
  FileBadge,
  FileSearch,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingBag,
  Boxes,
  Tag,
  TrendingDown,
  Truck,
  UserCircle,
  Users,
  Users2,
  Wrench,
} from 'lucide-react';

export const mainNav = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, section: 'Principal' },
  { label: 'Clientes', path: '/clients', icon: Users, section: 'Comercial' },
  { label: 'Productos', path: '/products', icon: ShoppingBag, section: 'Comercial' },
  { label: 'Cotizaciones', path: '/quotes', icon: FileSearch, section: 'Comercial' },
  { label: 'Facturas', path: '/invoices', icon: Receipt, section: 'Comercial' },
  { label: 'Pedidos', path: '/orders', icon: Package, section: 'Operaciones' },
  { label: 'Reparaciones', path: '/repairs', icon: Wrench, section: 'Operaciones' },
  { label: 'Inventario', path: '/inventory', icon: Boxes, section: 'Operaciones' },
  { label: 'Pagos', path: '/payments', icon: CreditCard, section: 'Finanzas' },
  { label: 'Gastos', path: '/expenses', icon: TrendingDown, section: 'Finanzas' },
  { label: 'Suplidores', path: '/suppliers', icon: Truck, section: 'Finanzas' },
  { label: 'Documentos', path: '/documents', icon: FileBadge, section: 'Documentos' },
  { label: 'Empleados', path: '/employees', icon: Users2, section: 'Nómina' },
  { label: 'Tarifario', path: '/tarifario', icon: Tag, section: 'Nómina' },
  { label: 'Producción', path: '/production', icon: ClipboardList, section: 'Nómina' },
  { label: 'Nómina', path: '/payroll', icon: DollarSign, section: 'Nómina' },
];

export const navSections = ['Principal', 'Comercial', 'Operaciones', 'Finanzas', 'Documentos', 'Nómina'];

export const bottomNav = [
  { label: 'Inicio', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Clientes', path: '/clients', icon: Users },
  { label: 'Pedidos', path: '/orders', icon: Package, center: true },
  { label: 'Facturas', path: '/invoices', icon: Receipt },
  { label: 'Más', path: null, icon: Settings },
];

export const technicianBottomNav = [
  { label: 'Pedidos', path: '/orders', icon: Package },
  { label: 'Inventario', path: '/inventory', icon: Boxes },
  { label: 'Mi cuenta', path: '/account', icon: UserCircle },
];

export const accountNav = [
  { label: 'Configuración', path: '/settings', icon: Settings },
  { label: 'Mi cuenta', path: '/account', icon: UserCircle },
];

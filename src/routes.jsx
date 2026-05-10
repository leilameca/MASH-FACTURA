import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell.jsx';
import { ProtectedRoute } from './components/layout/ProtectedRoute.jsx';
import { AccountPage } from './pages/account/AccountPage.jsx';
import { LoginPage } from './pages/auth/LoginPage.jsx';
import { ClientsPage } from './pages/clients/ClientsPage.jsx';
import { DashboardPage } from './pages/dashboard/DashboardPage.jsx';
import { DocumentsPage } from './pages/documents/DocumentsPage.jsx';
import { ExpensesPage } from './pages/expenses/ExpensesPage.jsx';
import { InvoicesPage } from './pages/invoices/InvoicesPage.jsx';
import { OrdersPage } from './pages/orders/OrdersPage.jsx';
import { PaymentsPage } from './pages/payments/PaymentsPage.jsx';
import { ProductsPage } from './pages/products/ProductsPage.jsx';
import { QuotesPage } from './pages/quotes/QuotesPage.jsx';
import { RepairsPage } from './pages/repairs/RepairsPage.jsx';
import { SettingsPage } from './pages/settings/SettingsPage.jsx';
import { SuppliersPage } from './pages/suppliers/SuppliersPage.jsx';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'clients', element: <ClientsPage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'quotes', element: <QuotesPage /> },
      { path: 'invoices', element: <InvoicesPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'repairs', element: <RepairsPage /> },
      { path: 'payments', element: <PaymentsPage /> },
      { path: 'expenses', element: <ExpensesPage /> },
      { path: 'suppliers', element: <SuppliersPage /> },
      { path: 'documents', element: <DocumentsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'account', element: <AccountPage /> },
    ],
  },
]);

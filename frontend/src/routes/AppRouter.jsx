import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import MainLayout from '../components/layout/MainLayout';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import ProductsPage from '../pages/ProductsPage';
import SalesPage from '../pages/SalesPage';
import CashClosePage from '../pages/CashClosePage';
import InventoryPage from '../pages/InventoryPage';
import PurchasesPage from '../pages/PurchasesPage';
import ReportsPage from '../pages/ReportsPage';
import SuppliersPage from '../pages/SuppliersPage';
import NotFoundPage from '../pages/NotFoundPage';

const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route element={<ProtectedRoute />}>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ventas" element={<SalesPage />} />
        <Route path="/inventario" element={<InventoryPage />} />

        <Route element={<ProtectedRoute allowedRoles={['gerente', 'administrador']} />}>
          <Route path="/productos" element={<ProductsPage />} />
          <Route path="/compras" element={<PurchasesPage />} />
          <Route path="/corte-caja" element={<CashClosePage />} />
          <Route path="/reportes" element={<ReportsPage />} />
          <Route path="/proveedores" element={<SuppliersPage />} />
        </Route>
      </Route>
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default AppRouter;

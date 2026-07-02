import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

// Protege rutas: redirige a /login si no está autenticado
// Si se pasa allowedRoles, redirige a /dashboard si el rol no está permitido
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, isRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !isRole(...allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

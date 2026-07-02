import useAuthStore from '../store/authStore';
import { ROLES, hasMinRole } from '../utils/roles';

// Hook de conveniencia para acceder al estado de autenticación
const useAuth = () => {
  const { user, token, isAuthenticated, login, logout } = useAuthStore();

  // Verifica si el usuario tiene al menos el rol indicado
  const hasRole = (minRole) => {
    if (!user) return false;
    return hasMinRole(user.rol, minRole);
  };

  // Verifica si el usuario tiene exactamente uno de los roles dados
  const isRole = (...roles) => {
    if (!user) return false;
    return roles.includes(user.rol);
  };

  return { user, token, isAuthenticated, login, logout, hasRole, isRole, ROLES };
};

export default useAuth;

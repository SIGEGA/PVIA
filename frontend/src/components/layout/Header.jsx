import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const rolLabel = { vendedor: 'Vendedor', gerente: 'Gerente', administrador: 'Administrador' };

const rolColor = {
  vendedor:      'bg-emerald-100 text-emerald-700',
  gerente:       'bg-blue-100 text-blue-700',
  administrador: 'bg-violet-100 text-violet-700',
};

const Header = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.nombre?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';
  const rol = user?.rol || '';

  return (
    <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
      {/* Hamburguesa mobile */}
      <button onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1" />

      {/* Usuario */}
      <div className="flex items-center gap-3">
        {/* Badge de rol */}
        <span className={`hidden md:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${rolColor[rol] || 'bg-gray-100 text-gray-600'}`}>
          {rolLabel[rol] || rol}
        </span>

        {/* Info */}
        <div className="hidden sm:block text-right">
          <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.nombre}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-blue-200 select-none">
          {initials}
        </div>

        {/* Logout */}
        <button onClick={handleLogout} title="Cerrar sesión"
          className="p-2 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;

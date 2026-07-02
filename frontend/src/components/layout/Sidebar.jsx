import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const navItems = [
  { to: '/dashboard',   label: 'Panel de control', minRole: 'vendedor',  icon: HomeIcon },
  { to: '/ventas',      label: 'Ventas',            minRole: 'vendedor',  icon: CartIcon },
  { to: '/inventario',  label: 'Inventario',        minRole: 'vendedor',  icon: BoxIcon },
  { to: '/productos',   label: 'Productos',         minRole: 'gerente',   icon: TagIcon },
  { to: '/compras',     label: 'Compras',           minRole: 'gerente',   icon: TruckIcon },
  { to: '/proveedores',  label: 'Proveedores',        minRole: 'gerente',   icon: UsersIcon },
  { to: '/corte-caja',  label: 'Corte de caja',     minRole: 'gerente',   icon: CashIcon },
  { to: '/reportes',    label: 'Reportes',          minRole: 'gerente',   icon: ChartIcon },
];

function HomeIcon()  { return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />; }
function CartIcon()  { return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />; }
function BoxIcon()   { return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />; }
function TagIcon()   { return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z" />; }
function TruckIcon() { return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />; }
function CashIcon()  { return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />; }
function ChartIcon() { return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />; }
function UsersIcon() { return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />; }

const NavIcon = ({ Icon }) => (
  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <Icon />
  </svg>
);

const Sidebar = ({ isOpen, onClose }) => {
  const { hasRole } = useAuth();
  const visibleItems = navItems.filter((item) => hasRole(item.minRole));

  // Separa items de vendedor y de gerente para agruparlos
  const vendedorItems = visibleItems.filter((i) => ['vendedor'].includes(i.minRole));
  const gerenteItems  = visibleItems.filter((i) => i.minRole !== 'vendedor');

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden backdrop-blur-sm" onClick={onClose} />
      )}

      <aside className={`
        fixed top-0 left-0 h-full w-64 z-30 flex flex-col
        bg-gradient-to-b from-slate-900 to-slate-800
        transition-transform duration-200 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/40 shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 11h.01M12 11h.01M15 11h.01M4 19h16a2 2 0 002-2V7a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight tracking-tight">ITH Sistemas</p>
              <p className="text-slate-400 text-xs">Punto de Venta</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {vendedorItems.length > 0 && (
            <>
              <p className="px-3 pt-1 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                Operaciones
              </p>
              {vendedorItems.map((item) => (
                <NavLink key={item.to} to={item.to} onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                      : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                    }
                  `}>
                  <NavIcon Icon={item.icon} />
                  {item.label}
                </NavLink>
              ))}
            </>
          )}

          {gerenteItems.length > 0 && (
            <>
              <p className="px-3 pt-4 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
                Administración
              </p>
              {gerenteItems.map((item) => (
                <NavLink key={item.to} to={item.to} onClick={onClose}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                      : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                    }
                  `}>
                  <NavIcon Icon={item.icon} />
                  {item.label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* Versión */}
        <div className="px-5 py-3 border-t border-slate-700/50">
          <p className="text-slate-600 text-[10px]">ITH-POS v1.0 · 2025</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

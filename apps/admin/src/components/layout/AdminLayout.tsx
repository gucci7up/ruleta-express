import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { clsx } from 'clsx';

const NAV = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/rounds', icon: '🎰', label: 'Rondas' },
  { to: '/tickets', icon: '🎫', label: 'Tickets' },
  { to: '/reports', icon: '📈', label: 'Reportes' },
  { to: '/users', icon: '👥', label: 'Usuarios' },
  { to: '/branches', icon: '🏢', label: 'Sucursales' },
  { to: '/config', icon: '⚙️', label: 'Configuración' },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-5 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎰</span>
            <div>
              <p className="font-black text-sm text-white">RULETA EXPRESS</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800',
              )}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs text-white font-medium truncate">{user?.name}</p>
            <p className="text-[10px] text-gray-500">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-left text-xs text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}

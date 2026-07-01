import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function UsersPage() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/api/users').then((r) => r.data),
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Usuarios</h1>
          <p className="text-gray-500 text-sm mt-1">Administradores, supervisores y operadores</p>
        </div>
        <button className="bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all active:scale-95">
          + Nuevo usuario
        </button>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['Nombre', 'Email', 'Rol', 'Sucursal', 'Terminal', 'Último acceso', 'Estado'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-600">Cargando...</td></tr>
            ) : users.map((u: any) => (
              <tr key={u.id} className="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
                <td className="px-5 py-3 font-medium text-white">{u.name}</td>
                <td className="px-5 py-3 text-gray-400 text-xs font-mono">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    u.role === 'SUPERADMIN' ? 'text-yellow-400 bg-yellow-900/30 border-yellow-700' :
                    u.role === 'ADMIN' ? 'text-blue-400 bg-blue-900/30 border-blue-700' :
                    'text-gray-400 bg-gray-800 border-gray-700'
                  }`}>{u.role}</span>
                </td>
                <td className="px-5 py-3 text-gray-400">{u.branch?.name ?? '—'}</td>
                <td className="px-5 py-3 text-gray-500 text-xs">{u.terminal?.name ?? '—'}</td>
                <td className="px-5 py-3 text-gray-600 text-xs font-mono">
                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : 'Nunca'}
                </td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold ${u.isActive ? 'text-green-400' : 'text-red-400'}`}>
                    {u.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

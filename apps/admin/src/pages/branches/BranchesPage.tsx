import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';

export default function BranchesPage() {
  const { data: branches = [], isLoading } = useQuery({
    queryKey: ['branches'],
    queryFn: () => api.get('/api/branches').then((r) => r.data),
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Sucursales y Terminales</h1>
          <p className="text-gray-500 text-sm mt-1">Gestión de sucursales y puntos de venta</p>
        </div>
        <button className="bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold px-5 py-2.5 rounded-xl text-sm transition-all active:scale-95">
          + Nueva sucursal
        </button>
      </div>

      {isLoading ? (
        <div className="text-gray-600 py-12 text-center">Cargando...</div>
      ) : (
        <div className="space-y-4">
          {branches.map((branch: any) => (
            <div key={branch.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-yellow-900/40 border border-yellow-700/30 flex items-center justify-center text-yellow-400 font-black text-sm">
                    #{branch.id}
                  </div>
                  <div>
                    <h3 className="font-bold text-white">{branch.name}</h3>
                    {branch.address && <p className="text-xs text-gray-500">{branch.address}</p>}
                  </div>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                  branch.isActive
                    ? 'text-green-400 bg-green-900/20 border-green-800'
                    : 'text-red-400 bg-red-900/20 border-red-800'
                }`}>
                  {branch.isActive ? 'Activa' : 'Inactiva'}
                </span>
              </div>

              {/* Terminals */}
              {branch.terminals?.length > 0 && (
                <div className="border-t border-gray-800 pt-3 space-y-2">
                  <p className="text-xs text-gray-600 uppercase font-semibold tracking-wider mb-2">Terminales</p>
                  <div className="grid grid-cols-3 gap-2">
                    {branch.terminals.map((t: any) => (
                      <div
                        key={t.id}
                        className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 flex items-center justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">{t.name}</p>
                          <p className="text-xs text-gray-500 font-mono">ID #{t.id}</p>
                        </div>
                        <span className={`text-xs font-bold ${t.isActive ? 'text-green-400' : 'text-gray-600'}`}>
                          {t.isActive ? '●' : '○'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { RoundStatus } from '@ruleta/shared';
import { clsx } from 'clsx';

const STATUS_STYLE: Record<string, string> = {
  OPEN: 'bg-green-900/30 text-green-400 border-green-700',
  CLOSED: 'bg-gray-800 text-gray-400 border-gray-700',
  DRAWING: 'bg-purple-900/30 text-purple-400 border-purple-700',
  FINISHED: 'bg-blue-900/20 text-blue-400 border-blue-800',
};

export default function RoundsPage() {
  const { data: rounds = [], isLoading } = useQuery({
    queryKey: ['rounds'],
    queryFn: () => api.get('/api/rounds').then((r) => r.data),
    refetchInterval: 10_000,
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Rondas</h1>
        <p className="text-gray-500 text-sm mt-1">Historial y estado de todas las rondas</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['ID', 'Estado', 'Apertura', 'Cierre', 'Sorteo', 'Número', 'Color', 'Tickets'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-600">Cargando...</td></tr>
            ) : rounds.map((r: any) => (
              <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                <td className="px-5 py-3 font-mono text-gray-400">#{r.id}</td>
                <td className="px-5 py-3">
                  <span className={clsx('px-2 py-0.5 rounded-full text-xs font-bold border', STATUS_STYLE[r.status])}>
                    {r.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400 font-mono text-xs">{new Date(r.openAt).toLocaleTimeString()}</td>
                <td className="px-5 py-3 text-gray-400 font-mono text-xs">{new Date(r.closeAt).toLocaleTimeString()}</td>
                <td className="px-5 py-3 text-gray-400 font-mono text-xs">{new Date(r.drawAt).toLocaleTimeString()}</td>
                <td className="px-5 py-3">
                  {r.winningNumber ? (
                    <span className="font-black text-xl" style={{ color: r.winningNumber.color.hex }}>
                      {r.winningNumber.number}
                    </span>
                  ) : <span className="text-gray-700">—</span>}
                </td>
                <td className="px-5 py-3">
                  {r.winningNumber ? (
                    <span className="text-xs font-bold uppercase" style={{ color: r.winningNumber.color.hex }}>
                      {r.winningNumber.color.name}
                    </span>
                  ) : <span className="text-gray-700">—</span>}
                </td>
                <td className="px-5 py-3 text-gray-300 font-mono">{r._count?.tickets ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

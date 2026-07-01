import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { StatCard } from '../../components/ui/StatCard';

export default function ReportsPage() {
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);

  const { data, isLoading } = useQuery({
    queryKey: ['report-daily', date],
    queryFn: () => api.get(`/api/reports/daily?date=${date}`).then((r) => r.data),
  });

  const tickets = Array.isArray(data) ? data : [];
  const totalBet = tickets.reduce((s: number, t: any) => s + Number(t.totalBet), 0);
  const totalPrize = tickets.reduce((s: number, t: any) => s + Number(t.totalPrize), 0);
  const winners = tickets.filter((t: any) => t.status === 'WINNER' || t.status === 'PAID').length;

  const exportCsv = () => {
    const rows = [
      ['UUID', 'Estado', 'Total Apostado', 'Premio', 'Cajero', 'Terminal', 'Hora'],
      ...tickets.map((t: any) => [
        t.uuid, t.status, t.totalBet, t.totalPrize,
        t.user?.name, t.terminal?.name, new Date(t.createdAt).toLocaleTimeString(),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `reporte-${date}.csv`; a.click();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Reportes</h1>
          <p className="text-gray-500 text-sm mt-1">Análisis de ventas y resultados</p>
        </div>
        <div className="flex gap-3">
          <input
            type="date"
            className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <button
            onClick={exportCsv}
            className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-medium px-4 py-2 rounded-xl text-sm transition-all"
          >
            ⬇ Exportar CSV
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Tickets" value={tickets.length} icon="🎫" color="gray" />
        <StatCard label="Ventas" value={`RD$${totalBet.toLocaleString()}`} icon="💵" color="yellow" />
        <StatCard label="Premios" value={`RD$${totalPrize.toLocaleString()}`} icon="🏆" color="green" />
        <StatCard label="Neto" value={`RD$${(totalBet - totalPrize).toLocaleString()}`} icon="📊" color="blue"
          sub={`RTP: ${totalBet > 0 ? ((totalPrize / totalBet) * 100).toFixed(1) : 0}%`} />
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              {['Hora', 'UUID', 'Estado', 'Apostado', 'Premio', 'Cajero', 'Terminal'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-600">Cargando...</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-600">Sin tickets para esta fecha</td></tr>
            ) : tickets.map((t: any) => (
              <tr key={t.uuid} className="border-b border-gray-800/40 hover:bg-gray-800/20 transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-gray-500">{new Date(t.createdAt).toLocaleTimeString()}</td>
                <td className="px-5 py-3 font-mono text-xs text-gray-400 max-w-[120px] truncate">{t.uuid.slice(0, 8)}...</td>
                <td className="px-5 py-3">
                  <span className={`text-xs font-bold ${t.status === 'WINNER' ? 'text-green-400' : t.status === 'LOSER' ? 'text-red-400' : 'text-gray-400'}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-5 py-3 font-mono text-gray-300">RD${Number(t.totalBet).toLocaleString()}</td>
                <td className="px-5 py-3 font-mono text-green-400">
                  {Number(t.totalPrize) > 0 ? `RD$${Number(t.totalPrize).toLocaleString()}` : '—'}
                </td>
                <td className="px-5 py-3 text-gray-400">{t.user?.name}</td>
                <td className="px-5 py-3 text-gray-500 text-xs">{t.terminal?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { StatCard } from '../../components/ui/StatCard';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';

const fmt = (n: number) => `RD$${n.toLocaleString()}`;

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => api.get('/api/reports/dashboard').then((r) => r.data),
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-4 gap-4 animate-pulse">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-gray-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-black text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString('es-DO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="💵" label="Ventas del día" value={fmt(data?.totalSales ?? 0)} color="yellow"
          sub={`${data?.totalTickets ?? 0} tickets`} />
        <StatCard icon="🏆" label="Premios pagados" value={fmt(data?.totalPrizes ?? 0)} color="green"
          sub={`${data?.winners ?? 0} ganadores`} />
        <StatCard icon="📊" label="Neto del día" value={fmt(data?.netRevenue ?? 0)} color="blue"
          sub={`RTP: ${(data?.rtp ?? 0).toFixed(1)}%`} />
        <StatCard icon="🎰" label="Rondas hoy" value={data?.rounds ?? 0} color="gray"
          sub={`Win rate: ${(data?.winRate ?? 0).toFixed(1)}%`} />
      </div>

      {/* Placeholder chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">
          Ventas vs Premios — últimas 12 rondas
        </h2>
        <div className="h-48 flex items-center justify-center text-gray-700 text-sm">
          Conecta al backend para ver la gráfica en tiempo real
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Ver rondas de hoy', to: '/rounds', icon: '🎰' },
          { label: 'Buscar ticket', to: '/tickets', icon: '🎫' },
          { label: 'Generar reporte', to: '/reports', icon: '📈' },
        ].map(({ label, icon }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-2xl p-4 flex items-center gap-3 cursor-pointer hover:border-gray-700 transition-colors">
            <span className="text-2xl">{icon}</span>
            <span className="text-sm text-gray-300 font-medium">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

import { clsx } from 'clsx';

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  color?: 'yellow' | 'green' | 'red' | 'blue' | 'gray';
  icon?: string;
}

const COLOR = {
  yellow: 'border-yellow-500/20 bg-yellow-500/5',
  green: 'border-green-500/20 bg-green-500/5',
  red: 'border-red-500/20 bg-red-500/5',
  blue: 'border-blue-500/20 bg-blue-500/5',
  gray: 'border-gray-700 bg-gray-800/50',
};
const VALUE_COLOR = {
  yellow: 'text-yellow-400', green: 'text-green-400',
  red: 'text-red-400', blue: 'text-blue-400', gray: 'text-white',
};

export function StatCard({ label, value, sub, color = 'gray', icon }: StatCardProps) {
  return (
    <div className={clsx('rounded-2xl border p-5', COLOR[color])}>
      {icon && <div className="text-2xl mb-3">{icon}</div>}
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className={clsx('text-3xl font-black font-mono', VALUE_COLOR[color])}>{value}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </div>
  );
}

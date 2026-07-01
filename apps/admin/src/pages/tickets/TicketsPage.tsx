import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { clsx } from 'clsx';

const STATUS_STYLE: Record<string, string> = {
  PENDING: 'text-yellow-400', WINNER: 'text-green-400',
  LOSER: 'text-red-400', CANCELLED: 'text-gray-500', PAID: 'text-blue-400',
};

export default function TicketsPage() {
  const [uuid, setUuid] = useState('');
  const [search, setSearch] = useState('');

  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ['ticket-search', search],
    queryFn: () => api.get(`/api/tickets/${search}/public`).then((r) => r.data),
    enabled: !!search,
    retry: false,
  });

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Tickets</h1>
        <p className="text-gray-500 text-sm mt-1">Buscar y consultar tickets por UUID</p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-yellow-500"
          placeholder="UUID del ticket..."
          value={uuid}
          onChange={(e) => setUuid(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && setSearch(uuid)}
        />
        <button
          onClick={() => setSearch(uuid)}
          className="bg-yellow-500 hover:bg-yellow-400 text-gray-950 font-bold px-6 rounded-xl transition-all active:scale-95"
        >
          Buscar
        </button>
      </div>

      {/* Result */}
      {isLoading && <p className="text-gray-500">Buscando...</p>}
      {error && <p className="text-red-400">Ticket no encontrado</p>}

      {ticket && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-mono text-xs text-gray-500">{ticket.uuid}</p>
              <p className={clsx('text-2xl font-black mt-1', STATUS_STYLE[ticket.status])}>{ticket.status}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Total apostado</p>
              <p className="text-xl font-black font-mono text-white">RD${Number(ticket.totalBet).toLocaleString()}</p>
              {Number(ticket.totalPrize) > 0 && (
                <>
                  <p className="text-xs text-gray-500 mt-1">Premio</p>
                  <p className="text-xl font-black font-mono text-green-400">RD${Number(ticket.totalPrize).toLocaleString()}</p>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-2">
            {ticket.items?.map((item: any, i: number) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-300">
                  {item.type === 'NUMBER' ? `Número ${item.reference}` : `Color ${item.reference}`}
                </span>
                <div className="flex gap-4">
                  <span className="font-mono text-gray-400">RD${Number(item.amount).toLocaleString()}</span>
                  {item.isWinner === true && <span className="text-green-400 font-bold">✓ +RD${Number(item.prize).toLocaleString()}</span>}
                  {item.isWinner === false && <span className="text-red-500">✗</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { api } from '../../lib/api';
import { TicketStatus, RoundStatus, BetType } from '@ruleta/shared';
import { getSocket, subscribeToTicket, SocketEvent } from '../../lib/socket';
import { clsx } from 'clsx';

const STATUS_STYLES: Record<string, string> = {
  WINNER: 'bg-green-900/50 border-green-500 text-green-400',
  LOSER: 'bg-red-900/30 border-red-800 text-red-400',
  PENDING: 'bg-yellow-900/30 border-yellow-700 text-yellow-400',
  CANCELLED: 'bg-gray-800 border-gray-700 text-gray-400',
};

export default function TicketPage() {
  const { uuid } = useParams<{ uuid: string }>();

  const { data: ticket, refetch } = useQuery({
    queryKey: ['ticket', uuid],
    queryFn: () => api.get(`/api/tickets/${uuid}/public`).then((r) => r.data),
    enabled: !!uuid,
    refetchInterval: (q) => {
      const status = q.state.data?.status;
      return status === 'PENDING' ? 5000 : false;
    },
  });

  useEffect(() => {
    if (!uuid) return;
    subscribeToTicket(uuid);
    const socket = getSocket();
    socket.on(SocketEvent.TICKET_RESULT, () => refetch());
    return () => { socket.off(SocketEvent.TICKET_RESULT); };
  }, [uuid]);

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-500 animate-pulse">Cargando ticket...</div>
      </div>
    );
  }

  const isFinished = ticket.round.status === RoundStatus.FINISHED;
  const isWinner = ticket.status === TicketStatus.WINNER || ticket.status === TicketStatus.PAID;
  const isPending = ticket.status === TicketStatus.PENDING;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-2">🎰</div>
          <h1 className="text-xl font-black text-white">RULETA EXPRESS</h1>
          <p className="text-xs text-gray-600 font-mono mt-1">{ticket.uuid}</p>
        </div>

        {/* Estado principal */}
        <div className={clsx('border rounded-2xl p-6 text-center', STATUS_STYLES[ticket.status] ?? STATUS_STYLES.PENDING)}>
          {isPending && !isFinished && (
            <>
              <div className="text-4xl animate-spin mb-3">⏳</div>
              <p className="text-xl font-bold">EN ESPERA</p>
              <p className="text-sm opacity-70 mt-1">El sorteo aún no ha ocurrido</p>
            </>
          )}
          {isWinner && (
            <>
              <div className="text-5xl mb-3">🏆</div>
              <p className="text-3xl font-black">¡GANASTE!</p>
              <p className="text-4xl font-black font-mono mt-2">
                RD${Number(ticket.totalPrize).toLocaleString()}
              </p>
              <p className="text-sm opacity-70 mt-1">Presenta este ticket para cobrar</p>
            </>
          )}
          {ticket.status === TicketStatus.LOSER && (
            <>
              <div className="text-4xl mb-3">😔</div>
              <p className="text-2xl font-bold">No ganaste esta vez</p>
              <p className="text-sm opacity-70 mt-1">¡Suerte en la próxima ronda!</p>
            </>
          )}
        </div>

        {/* Resultado de la ronda */}
        {ticket.round.winningNumber && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Número ganador</p>
            <div className="flex items-center gap-3">
              <div className="text-5xl font-black" style={{ color: ticket.round.winningNumber.color.hex ?? '#fff' }}>
                {ticket.round.winningNumber.number}
              </div>
              <div
                className="px-3 py-1 rounded-full text-sm font-bold uppercase"
                style={{ backgroundColor: (ticket.round.winningNumber.color.hex ?? '#333') + '33', color: ticket.round.winningNumber.color.hex }}
              >
                {ticket.round.winningNumber.color.name}
              </div>
            </div>
          </div>
        )}

        {/* Detalle de apuestas */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Tus apuestas</p>
          <div className="space-y-2">
            {ticket.items.map((item: any, i: number) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-300">
                  {item.type === BetType.NUMBER ? `Número ${item.reference}` : `Color ${item.reference}`}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-400 font-mono">RD${Number(item.amount).toLocaleString()}</span>
                  {item.isWinner === true && <span className="text-green-400 text-xs">✓ +RD${Number(item.prize).toLocaleString()}</span>}
                  {item.isWinner === false && <span className="text-red-500 text-xs">✗</span>}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 mt-3 pt-3 flex justify-between">
            <span className="text-gray-400 text-sm">Total apostado</span>
            <span className="font-mono font-bold text-white">RD${Number(ticket.totalBet).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

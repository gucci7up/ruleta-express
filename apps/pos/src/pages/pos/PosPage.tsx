import { useQuery, useMutation } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { BetType } from '@ruleta/shared';
import { api } from '../../lib/api';
import { useAuthStore } from '../../store/auth.store';
import { useRoundStore } from '../../store/round.store';
import { useTicketStore } from '../../store/ticket.store';
import { useRoundSocket } from '../../hooks/useRoundSocket';
import { CountdownBar } from '../../components/ui/CountdownBar';
import { RoundOverlay } from '../../components/ui/RoundOverlay';
import { Button } from '../../components/ui/Button';
import { TicketPrint } from '../../components/ticket/TicketPrint';
import { NumberGrid } from './NumberGrid';
import { BetPanel } from './BetPanel';

export default function PosPage() {
  const user = useAuthStore((s) => s.user);
  const round = useRoundStore();
  const { items, clearItems, totalBet } = useTicketStore();
  const printRef = useRef<HTMLDivElement>(null);
  const [lastTicket, setLastTicket] = useState<any>(null);

  useRoundSocket();

  // Cargar mapping número → color
  const { data: colorMap } = useQuery({
    queryKey: ['color-map'],
    queryFn: () => api.get('/api/colors/numbers').then((r) => r.data),
    staleTime: Infinity,
  });

  const handlePrint = useReactToPrint({ contentRef: printRef });

  const createTicket = useMutation({
    mutationFn: () =>
      api.post('/api/tickets', {
        roundId: round.roundId,
        items: items.map((i) => ({ type: i.type, reference: i.reference, amount: i.amount })),
      }).then((r) => r.data),
    onSuccess: (ticket) => {
      setLastTicket(ticket);
      clearItems();
      setTimeout(() => handlePrint(), 300);
    },
  });

  return (
    <div className="flex flex-col h-screen bg-gray-950 overflow-hidden">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-xl">🎰</span>
          <span className="font-bold text-white">RULETA EXPRESS</span>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">{user?.name}</p>
          <p className="text-xs text-gray-600">Terminal</p>
        </div>
      </header>

      {/* Countdown bar */}
      <CountdownBar />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Number grid */}
        <div className="flex-1 p-3 overflow-y-auto">
          {colorMap && <NumberGrid colorMap={colorMap} />}
        </div>

        {/* Right: Bet panel */}
        <div className="w-72 border-l border-gray-800 flex flex-col shrink-0">
          <BetPanel />
          <div className="p-3 border-t border-gray-800 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total a cobrar:</span>
              <span className="text-yellow-400 font-bold font-mono">RD${totalBet().toLocaleString()}</span>
            </div>
            <Button
              className="w-full"
              size="lg"
              variant="success"
              disabled={items.length === 0 || !round.isOpen}
              loading={createTicket.isPending}
              onClick={() => createTicket.mutate()}
            >
              💳 Cobrar e Imprimir
            </Button>
          </div>
        </div>
      </div>

      {/* Overlay de ronda cerrada */}
      <RoundOverlay />

      {/* Ticket para imprimir (oculto) */}
      {lastTicket && (
        <div style={{ display: 'none' }}>
          <TicketPrint ref={printRef} ticket={lastTicket} />
        </div>
      )}
    </div>
  );
}

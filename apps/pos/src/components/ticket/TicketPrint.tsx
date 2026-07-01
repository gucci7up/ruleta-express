import { forwardRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { BetType } from '@ruleta/shared';

interface TicketPrintProps {
  ticket: {
    uuid: string;
    createdAt: string;
    totalBet: number;
    round: { closeAt: string };
    terminal: { name: string; branch: { name: string } };
    user: { name: string };
    items: { type: string; reference: string; amount: number }[];
  };
}

const TICKET_URL = (uuid: string) =>
  `${import.meta.env.VITE_API_URL ?? 'http://localhost:5173'}/ticket/${uuid}`;

export const TicketPrint = forwardRef<HTMLDivElement, TicketPrintProps>(({ ticket }, ref) => {
  const date = new Date(ticket.createdAt);

  return (
    <div
      id="print-ticket"
      ref={ref}
      style={{ width: '80mm', fontFamily: 'monospace', fontSize: '11px', padding: '8px', color: '#000', background: '#fff' }}
    >
      <div style={{ textAlign: 'center', borderBottom: '1px dashed #000', paddingBottom: 8, marginBottom: 8 }}>
        <div style={{ fontSize: 18, fontWeight: 900 }}>🎰 RULETA EXPRESS</div>
        <div style={{ fontSize: 10, color: '#555' }}>{ticket.terminal.branch.name} — {ticket.terminal.name}</div>
      </div>

      <div style={{ marginBottom: 6 }}>
        <div><strong>Cajero:</strong> {ticket.user.name}</div>
        <div><strong>Fecha:</strong> {date.toLocaleDateString()} {date.toLocaleTimeString()}</div>
        <div><strong>Cierre ronda:</strong> {new Date(ticket.round.closeAt).toLocaleTimeString()}</div>
      </div>

      <div style={{ borderTop: '1px dashed #000', borderBottom: '1px dashed #000', padding: '6px 0', marginBottom: 8 }}>
        {ticket.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{item.type === BetType.NUMBER ? `Número ${item.reference}` : `Color ${item.reference}`}</span>
            <span>RD${Number(item.amount).toLocaleString()}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
        <span>TOTAL PAGADO:</span>
        <span>RD${Number(ticket.totalBet).toLocaleString()}</span>
      </div>

      <div style={{ textAlign: 'center' }}>
        <QRCodeSVG value={TICKET_URL(ticket.uuid)} size={120} />
        <div style={{ fontSize: 9, color: '#777', marginTop: 4, wordBreak: 'break-all' }}>
          {ticket.uuid}
        </div>
        <div style={{ fontSize: 10, marginTop: 4 }}>Escanea para ver resultado</div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 10, fontSize: 9, color: '#999', borderTop: '1px dashed #000', paddingTop: 6 }}>
        Este ticket es válido únicamente para la ronda indicada.<br />
        Conserve su ticket para cobrar premios.
      </div>
    </div>
  );
});
TicketPrint.displayName = 'TicketPrint';

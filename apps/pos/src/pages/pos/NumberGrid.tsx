import { clsx } from 'clsx';
import { BetType } from '@ruleta/shared';
import { useTicketStore } from '../../store/ticket.store';

interface NumberColorEntry { number: number; color: string; hex: string; }

const COLOR_BG: Record<string, string> = {
  VERDE: 'bg-green-700 hover:bg-green-600',
  ROJO: 'bg-red-700 hover:bg-red-600',
  NEGRO: 'bg-gray-700 hover:bg-gray-600',
};

export function NumberGrid({ colorMap }: { colorMap: NumberColorEntry[] }) {
  const { items, addItem, removeItem } = useTicketStore();

  const isSelected = (n: number) =>
    items.some((i) => i.type === BetType.NUMBER && i.reference === String(n));

  const toggle = (entry: NumberColorEntry) => {
    const ref = String(entry.number);
    if (isSelected(entry.number)) {
      removeItem(ref, BetType.NUMBER);
    } else {
      addItem({ type: BetType.NUMBER, reference: ref });
    }
  };

  const colorBets = [
    { color: 'ROJO', label: 'Rojo', bg: 'bg-red-700 hover:bg-red-600', hex: '#FF4444' },
    { color: 'NEGRO', label: 'Negro', bg: 'bg-gray-700 hover:bg-gray-600', hex: '#222222' },
    { color: 'VERDE', label: 'Verde', bg: 'bg-green-700 hover:bg-green-600', hex: '#00C851' },
  ];

  const isColorSelected = (c: string) =>
    items.some((i) => i.type === BetType.COLOR && i.reference === c);

  const toggleColor = (c: string) => {
    if (isColorSelected(c)) removeItem(c, BetType.COLOR);
    else addItem({ type: BetType.COLOR, reference: c });
  };

  return (
    <div className="space-y-4">
      {/* Color buttons */}
      <div className="grid grid-cols-3 gap-2">
        {colorBets.map(({ color, label, bg }) => (
          <button
            key={color}
            onClick={() => toggleColor(color)}
            className={clsx(
              'h-14 rounded-xl font-bold text-white text-lg transition-all active:scale-95',
              bg,
              isColorSelected(color) && 'ring-2 ring-yellow-400 scale-95',
            )}
          >
            {isColorSelected(color) ? '✓ ' : ''}{label}
          </button>
        ))}
      </div>

      {/* Number grid 0-18 */}
      <div className="grid grid-cols-5 gap-2">
        {/* 0 ocupa ancho completo en primera fila solo */}
        {colorMap.map((entry) => (
          <button
            key={entry.number}
            onClick={() => toggle(entry)}
            className={clsx(
              'number-cell h-16 text-2xl rounded-xl border-2',
              COLOR_BG[entry.color] ?? 'bg-gray-700',
              isSelected(entry.number) ? 'selected border-yellow-400 ring-2 ring-yellow-400/50' : 'border-transparent',
              entry.number === 0 && 'col-span-5 h-14 text-xl',
            )}
            style={isSelected(entry.number) ? {} : { borderColor: 'transparent' }}
          >
            <span className="font-black">{entry.number}</span>
            <span className="text-[9px] opacity-60 uppercase font-medium">{entry.color.slice(0,1)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

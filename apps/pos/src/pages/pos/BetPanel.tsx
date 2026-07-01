import { BetType } from '@ruleta/shared';
import { useTicketStore } from '../../store/ticket.store';

const BET_MIN = 10;
const BET_MAX = 1000;
const QUICK_AMOUNTS = [50, 100, 200, 500];

const typeLabel = (type: BetType, ref: string) =>
  type === BetType.NUMBER ? `Nº ${ref}` : ref;

export function BetPanel() {
  const { items, updateAmount, removeItem } = useTicketStore();

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-4xl mb-3">🎲</div>
        <p className="text-gray-500 text-sm">Selecciona números o colores para apostar</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 space-y-2">
      {items.map((item) => (
        <div key={`${item.type}-${item.reference}`} className="bg-gray-800 rounded-xl p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-white text-sm">{typeLabel(item.type, item.reference)}</span>
            <button
              onClick={() => removeItem(item.reference, item.type)}
              className="text-gray-500 hover:text-red-400 text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-4 gap-1 mb-2">
            {QUICK_AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => updateAmount(item.reference, item.type, a)}
                className={`py-1 rounded-lg text-xs font-bold transition-all ${
                  item.amount === a
                    ? 'bg-yellow-500 text-gray-950'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">RD$</span>
            <input
              type="number"
              min={BET_MIN}
              max={BET_MAX}
              value={item.amount}
              onChange={(e) => {
                const v = Math.min(BET_MAX, Math.max(BET_MIN, Number(e.target.value)));
                updateAmount(item.reference, item.type, v);
              }}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-yellow-500"
            />
          </div>

          <div className="text-right text-xs text-gray-500 mt-1">
            Premio posible:{' '}
            <span className="text-yellow-400 font-bold">
              RD${(item.amount * (item.type === BetType.NUMBER ? 18 : item.reference === 'VERDE' ? 18 : 2)).toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

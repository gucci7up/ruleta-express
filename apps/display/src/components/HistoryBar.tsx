import { useDisplayStore } from '../store/display.store';

export function HistoryBar() {
  const { history } = useDisplayStore();

  if (history.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-600 text-xs uppercase tracking-widest shrink-0">Anteriores</span>
      <div className="flex gap-2 overflow-hidden">
        {history.map((entry, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm shrink-0"
            style={{
              backgroundColor: entry.colorHex + '30',
              border: `1.5px solid ${entry.colorHex}60`,
              color: entry.colorHex,
              opacity: Math.max(0.3, 1 - i * 0.06),
            }}
          >
            {entry.number}
          </div>
        ))}
      </div>
    </div>
  );
}

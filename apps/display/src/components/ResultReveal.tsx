import { useDisplayStore } from '../store/display.store';

export function ResultReveal() {
  const { lastResult, showResult } = useDisplayStore();

  if (!showResult || !lastResult) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="text-center">
        <p className="text-gray-400 text-2xl uppercase tracking-[0.3em] mb-6 font-semibold">
          Número Ganador
        </p>

        <div
          className="text-[200px] font-black leading-none animate-scale-in drop-shadow-2xl"
          style={{ color: lastResult.colorHex, textShadow: `0 0 80px ${lastResult.colorHex}88` }}
        >
          {lastResult.number}
        </div>

        <div
          className="mt-6 inline-block px-10 py-4 rounded-full text-3xl font-black uppercase tracking-widest animate-fade-in"
          style={{
            backgroundColor: lastResult.colorHex + '25',
            color: lastResult.colorHex,
            border: `2px solid ${lastResult.colorHex}66`,
          }}
        >
          {lastResult.color}
        </div>

        <p className="text-gray-600 text-lg mt-8">Abriendo nueva ronda...</p>
      </div>
    </div>
  );
}

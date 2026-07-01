import { useDisplayStore } from './store/display.store';
import { useDisplaySocket } from './hooks/useDisplaySocket';
import { RouletteWheel } from './components/RouletteWheel';
import { CountdownDisplay } from './components/CountdownDisplay';
import { ResultReveal } from './components/ResultReveal';
import { HistoryBar } from './components/HistoryBar';
import { RoundStatus } from '@ruleta/shared';
import { clsx } from 'clsx';

export default function App() {
  const { status, lastResult, isClosing } = useDisplayStore();
  useDisplaySocket();

  const isDrawing = status === RoundStatus.DRAWING;
  const isOpen = status === RoundStatus.OPEN;

  return (
    <div className="w-screen h-screen bg-gray-950 flex flex-col overflow-hidden select-none">

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-12 py-6 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎰</span>
          <div>
            <h1 className="text-2xl font-black text-white tracking-wider">RULETA EXPRESS</h1>
            <p className="text-xs text-gray-600 uppercase tracking-widest">Sistema en vivo</p>
          </div>
        </div>

        {/* Status badge */}
        <div className={clsx(
          'px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest border',
          isOpen && !isClosing && 'bg-green-900/30 border-green-700 text-green-400',
          isClosing && 'bg-red-900/30 border-red-700 text-red-400 animate-pulse',
          status === RoundStatus.CLOSED && 'bg-gray-800 border-gray-700 text-gray-400',
          isDrawing && 'bg-purple-900/30 border-purple-700 text-purple-400 animate-pulse',
          status === RoundStatus.FINISHED && 'bg-yellow-900/30 border-yellow-700 text-yellow-400',
        )}>
          {isClosing ? '⚠ CERRANDO' : isDrawing ? '🎰 GIRANDO' : status}
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 flex items-center justify-center gap-16 px-16 overflow-hidden">

        {/* Ruleta */}
        <div className="flex flex-col items-center gap-6">
          <div className={clsx(isDrawing && 'drop-shadow-[0_0_60px_rgba(168,85,247,0.4)]')}>
            <RouletteWheel
              status={status}
              winningNumber={lastResult?.number}
              winningColorHex={lastResult?.colorHex}
            />
          </div>

          {isDrawing && (
            <p className="text-purple-400 text-xl font-bold uppercase tracking-widest animate-pulse">
              ¡Girando la ruleta!
            </p>
          )}
        </div>

        {/* Panel derecho */}
        <div className="flex flex-col gap-8 w-96">

          {/* Countdown */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-8">
            <CountdownDisplay />
          </div>

          {/* Último resultado */}
          {lastResult && (
            <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-8 text-center">
              <p className="text-gray-500 text-xs uppercase tracking-widest mb-3">Último resultado</p>
              <div className="flex items-center justify-center gap-4">
                <span
                  className="text-6xl font-black"
                  style={{ color: lastResult.colorHex }}
                >
                  {lastResult.number}
                </span>
                <span
                  className="text-lg font-bold uppercase px-4 py-2 rounded-full"
                  style={{
                    backgroundColor: lastResult.colorHex + '25',
                    color: lastResult.colorHex,
                  }}
                >
                  {lastResult.color}
                </span>
              </div>
            </div>
          )}

          {/* Historial */}
          <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6">
            <HistoryBar />
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="px-12 py-4 shrink-0 flex items-center justify-between border-t border-gray-900">
        <p className="text-gray-700 text-xs">Juega con responsabilidad · +18</p>
        <p className="text-gray-700 text-xs font-mono">{new Date().toLocaleDateString()}</p>
      </footer>

      {/* Reveal overlay */}
      <ResultReveal />
    </div>
  );
}

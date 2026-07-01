import { useRoundStore } from '../../store/round.store';
import { RoundStatus } from '@ruleta/shared';
import { clsx } from 'clsx';

export function RoundOverlay() {
  const { status, isOpen, isClosing, secondsLeft, lastResult } = useRoundStore();

  if (isOpen && !isClosing) return null;

  const isDrawing = status === RoundStatus.DRAWING;
  const isFinished = status === RoundStatus.FINISHED;

  return (
    <div
      className={clsx(
        'fixed inset-0 z-50 flex flex-col items-center justify-center',
        'backdrop-blur-sm transition-all duration-300',
        isDrawing ? 'bg-purple-950/90' : isFinished ? 'bg-gray-950/90' : 'bg-red-950/80',
      )}
    >
      {isClosing && !isDrawing && (
        <div className="text-center animate-pulse">
          <p className="text-red-400 text-xl font-bold uppercase tracking-widest mb-2">⚠ Último momento</p>
          <p className="text-white text-6xl font-black font-mono">{secondsLeft}s</p>
          <p className="text-red-300 text-lg mt-3">Las apuestas cierran pronto</p>
        </div>
      )}

      {status === RoundStatus.CLOSED && (
        <div className="text-center">
          <div className="text-7xl mb-4">🔒</div>
          <p className="text-red-400 text-3xl font-black uppercase tracking-widest">CERRADO</p>
          <p className="text-gray-400 text-lg mt-2">Esperando sorteo...</p>
        </div>
      )}

      {isDrawing && (
        <div className="text-center">
          <div className="text-7xl mb-4 animate-spin">🎰</div>
          <p className="text-purple-300 text-3xl font-black uppercase tracking-widest animate-pulse">
            GIRANDO...
          </p>
        </div>
      )}

      {isFinished && lastResult && (
        <div className="text-center animate-bounce">
          <p className="text-gray-400 text-lg uppercase tracking-widest mb-2">Número ganador</p>
          <div
            className="text-9xl font-black mb-4"
            style={{ color: lastResult.colorHex }}
          >
            {lastResult.number}
          </div>
          <p
            className="text-2xl font-bold uppercase px-6 py-2 rounded-full"
            style={{ backgroundColor: lastResult.colorHex + '33', color: lastResult.colorHex }}
          >
            {lastResult.color}
          </p>
          <p className="text-gray-500 mt-4 text-sm">Abriendo nueva ronda...</p>
        </div>
      )}
    </div>
  );
}

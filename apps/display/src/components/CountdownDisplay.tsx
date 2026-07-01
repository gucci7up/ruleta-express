import { useDisplayStore } from '../store/display.store';
import { RoundStatus } from '@ruleta/shared';
import { clsx } from 'clsx';

export function CountdownDisplay() {
  const { secondsLeft, totalSeconds, status, isClosing } = useDisplayStore();
  const pct = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  const isOpen = status === RoundStatus.OPEN;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-gray-400 text-sm uppercase tracking-widest font-semibold">
        {isClosing ? '⚠ ÚLTIMAS APUESTAS' : isOpen ? 'Próximo sorteo en' : status}
      </p>

      <div className={clsx(
        'font-mono font-black tabular-nums leading-none',
        isClosing ? 'text-red-400 animate-pulse text-8xl' : 'text-white text-7xl',
      )}>
        {mm}:{ss}
      </div>

      {/* Progress arc */}
      <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-1000',
            isClosing ? 'bg-red-500' : 'bg-yellow-500',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

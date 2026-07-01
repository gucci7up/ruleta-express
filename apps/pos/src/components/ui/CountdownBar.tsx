import { useRoundStore } from '../../store/round.store';
import { RoundStatus } from '@ruleta/shared';
import { clsx } from 'clsx';

const ROUND_TOTAL_SECONDS = 5 * 60; // 5 min

export function CountdownBar() {
  const { secondsLeft, status, isClosing } = useRoundStore();
  const pct = Math.min(100, (secondsLeft / ROUND_TOTAL_SECONDS) * 100);

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');

  return (
    <div className="w-full bg-gray-900 px-4 py-2 flex items-center gap-3">
      <div
        className={clsx(
          'font-mono text-lg font-bold tabular-nums',
          isClosing ? 'text-red-400 animate-pulse' : 'text-yellow-400',
        )}
      >
        {mm}:{ss}
      </div>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={clsx(
            'h-full rounded-full transition-all duration-1000',
            isClosing ? 'bg-red-500' : status === RoundStatus.OPEN ? 'bg-yellow-500' : 'bg-gray-600',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div
        className={clsx(
          'text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded',
          status === RoundStatus.OPEN && !isClosing && 'bg-green-900/50 text-green-400',
          isClosing && 'bg-red-900/50 text-red-400',
          status === RoundStatus.CLOSED && 'bg-gray-800 text-gray-400',
          status === RoundStatus.DRAWING && 'bg-purple-900/50 text-purple-400',
          status === RoundStatus.FINISHED && 'bg-gray-800 text-gray-400',
        )}
      >
        {isClosing ? 'CERRANDO' : status}
      </div>
    </div>
  );
}

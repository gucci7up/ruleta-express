import { useEffect } from 'react';
import { getSocket, SocketEvent } from '../lib/socket';
import { useDisplayStore } from '../store/display.store';
import { RoundStatePayload, RoundResultPayload } from '@ruleta/shared';

const BRANCH_ID = Number(import.meta.env.VITE_BRANCH_ID ?? 1);

export function useDisplaySocket() {
  const store = useDisplayStore();

  useEffect(() => {
    const socket = getSocket();

    socket.emit(SocketEvent.SUBSCRIBE_BRANCH, { branchId: BRANCH_ID });

    socket.on(SocketEvent.ROUND_STATE, (p: RoundStatePayload) => store.setRoundState(p));
    socket.on(SocketEvent.ROUND_COUNTDOWN, ({ seconds }: { seconds: number }) => store.setCountdown(seconds));
    socket.on(SocketEvent.ROUND_CLOSING, ({ secondsLeft }: { secondsLeft: number }) => store.setClosing(secondsLeft));
    socket.on(SocketEvent.ROUND_CLOSED, () => store.setClosed());
    socket.on(SocketEvent.ROUND_DRAWING, () => store.setDrawing());
    socket.on(SocketEvent.ROUND_RESULT, (p: RoundResultPayload) => store.setResult(p));

    return () => {
      socket.off(SocketEvent.ROUND_STATE);
      socket.off(SocketEvent.ROUND_COUNTDOWN);
      socket.off(SocketEvent.ROUND_CLOSING);
      socket.off(SocketEvent.ROUND_CLOSED);
      socket.off(SocketEvent.ROUND_DRAWING);
      socket.off(SocketEvent.ROUND_RESULT);
    };
  }, []);
}

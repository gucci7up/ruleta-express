import { useEffect } from 'react';
import { getSocket, subscribeToBranch, SocketEvent } from '../lib/socket';
import { useRoundStore } from '../store/round.store';
import { useAuthStore } from '../store/auth.store';
import { RoundStatePayload, RoundResultPayload } from '@ruleta/shared';

export function useRoundSocket() {
  const user = useAuthStore((s) => s.user);
  const store = useRoundStore();

  useEffect(() => {
    if (!user?.branchId) return;

    const socket = getSocket();
    subscribeToBranch(user.branchId);

    socket.on(SocketEvent.ROUND_STATE, (payload: RoundStatePayload) => {
      store.setRoundState(payload);
    });

    socket.on(SocketEvent.ROUND_COUNTDOWN, ({ seconds }: { seconds: number }) => {
      store.setCountdown(seconds);
    });

    socket.on(SocketEvent.ROUND_CLOSING, ({ secondsLeft }: { secondsLeft: number }) => {
      store.setClosingWarning(secondsLeft);
    });

    socket.on(SocketEvent.ROUND_CLOSED, () => {
      store.setClosed();
    });

    socket.on(SocketEvent.ROUND_DRAWING, () => {
      store.setDrawing();
    });

    socket.on(SocketEvent.ROUND_RESULT, (payload: RoundResultPayload) => {
      store.setResult(payload);
    });

    return () => {
      socket.off(SocketEvent.ROUND_STATE);
      socket.off(SocketEvent.ROUND_COUNTDOWN);
      socket.off(SocketEvent.ROUND_CLOSING);
      socket.off(SocketEvent.ROUND_CLOSED);
      socket.off(SocketEvent.ROUND_DRAWING);
      socket.off(SocketEvent.ROUND_RESULT);
    };
  }, [user?.branchId]);
}

import { create } from 'zustand';
import { RoundStatus, RoundStatePayload, RoundResultPayload } from '@ruleta/shared';

interface RoundState {
  roundId: number | null;
  status: RoundStatus;
  secondsLeft: number;
  lastResult: RoundResultPayload | null;
  isOpen: boolean;
  isClosing: boolean; // aviso 30s antes
  setRoundState: (payload: RoundStatePayload) => void;
  setCountdown: (seconds: number) => void;
  setClosingWarning: (seconds: number) => void;
  setClosed: () => void;
  setDrawing: () => void;
  setResult: (payload: RoundResultPayload) => void;
}

export const useRoundStore = create<RoundState>((set) => ({
  roundId: null,
  status: RoundStatus.OPEN,
  secondsLeft: 0,
  lastResult: null,
  isOpen: true,
  isClosing: false,

  setRoundState: (payload) =>
    set({
      roundId: payload.roundId,
      status: payload.status,
      secondsLeft: payload.secondsLeft,
      isOpen: payload.status === RoundStatus.OPEN,
    }),

  setCountdown: (seconds) => set({ secondsLeft: seconds }),

  setClosingWarning: (seconds) => set({ isClosing: true, secondsLeft: seconds }),

  setClosed: () => set({ status: RoundStatus.CLOSED, isOpen: false, isClosing: false }),

  setDrawing: () => set({ status: RoundStatus.DRAWING, isOpen: false }),

  setResult: (payload) =>
    set({ lastResult: payload, status: RoundStatus.FINISHED, isOpen: false }),
}));

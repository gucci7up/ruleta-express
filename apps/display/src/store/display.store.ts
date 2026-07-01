import { create } from 'zustand';
import { RoundStatus, RoundStatePayload, RoundResultPayload } from '@ruleta/shared';

interface HistoryEntry {
  number: number;
  color: string;
  colorHex: string;
}

interface DisplayState {
  status: RoundStatus;
  roundId: number | null;
  secondsLeft: number;
  totalSeconds: number;
  isClosing: boolean;
  lastResult: RoundResultPayload | null;
  history: HistoryEntry[];
  showResult: boolean;

  setRoundState: (p: RoundStatePayload) => void;
  setCountdown: (s: number) => void;
  setClosing: (s: number) => void;
  setClosed: () => void;
  setDrawing: () => void;
  setResult: (p: RoundResultPayload) => void;
  dismissResult: () => void;
}

export const useDisplayStore = create<DisplayState>((set, get) => ({
  status: RoundStatus.OPEN,
  roundId: null,
  secondsLeft: 300,
  totalSeconds: 300,
  isClosing: false,
  lastResult: null,
  history: [],
  showResult: false,

  setRoundState: (p) =>
    set({ roundId: p.roundId, status: p.status, secondsLeft: p.secondsLeft, totalSeconds: p.secondsLeft, isClosing: false }),

  setCountdown: (s) => set({ secondsLeft: s }),

  setClosing: (s) => set({ isClosing: true, secondsLeft: s }),

  setClosed: () => set({ status: RoundStatus.CLOSED, isClosing: false }),

  setDrawing: () => set({ status: RoundStatus.DRAWING }),

  setResult: (p) => {
    const prev = get().history;
    set({
      lastResult: p,
      status: RoundStatus.FINISHED,
      showResult: true,
      history: [
        { number: p.number, color: p.color, colorHex: p.colorHex },
        ...prev,
      ].slice(0, 15),
    });
    // Ocultar resultado después de 8 segundos para preparar nueva ronda
    setTimeout(() => set({ showResult: false }), 8000);
  },

  dismissResult: () => set({ showResult: false }),
}));

import { create } from 'zustand';
import { BetType } from '@ruleta/shared';

export interface BetItem {
  type: BetType;
  reference: string;
  amount: number;
}

interface TicketState {
  items: BetItem[];
  addItem: (item: Omit<BetItem, 'amount'>) => void;
  updateAmount: (reference: string, type: BetType, amount: number) => void;
  removeItem: (reference: string, type: BetType) => void;
  clearItems: () => void;
  totalBet: () => number;
}

export const useTicketStore = create<TicketState>((set, get) => ({
  items: [],

  addItem: (item) => {
    const exists = get().items.find(
      (i) => i.reference === item.reference && i.type === item.type,
    );
    if (!exists) {
      set((s) => ({ items: [...s.items, { ...item, amount: 100 }] }));
    }
  },

  updateAmount: (reference, type, amount) =>
    set((s) => ({
      items: s.items.map((i) =>
        i.reference === reference && i.type === type ? { ...i, amount } : i,
      ),
    })),

  removeItem: (reference, type) =>
    set((s) => ({
      items: s.items.filter((i) => !(i.reference === reference && i.type === type)),
    })),

  clearItems: () => set({ items: [] }),

  totalBet: () => get().items.reduce((sum, i) => sum + i.amount, 0),
}));

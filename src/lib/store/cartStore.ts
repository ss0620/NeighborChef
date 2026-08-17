import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface CartLine {
  listingId: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  addItem: (listingId: string, quantity?: number) => void;
  removeItem: (listingId: string) => void;
  setQuantity: (listingId: string, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      addItem: (listingId, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((line) => line.listingId === listingId);
          if (existing) {
            return {
              lines: state.lines.map((line) =>
                line.listingId === listingId ? { ...line, quantity: line.quantity + quantity } : line
              ),
            };
          }
          return { lines: [...state.lines, { listingId, quantity }] };
        }),
      removeItem: (listingId) =>
        set((state) => ({ lines: state.lines.filter((line) => line.listingId !== listingId) })),
      setQuantity: (listingId, quantity) =>
        set((state) => ({
          lines:
            quantity <= 0
              ? state.lines.filter((line) => line.listingId !== listingId)
              : state.lines.map((line) => (line.listingId === listingId ? { ...line, quantity } : line)),
        })),
      clear: () => set({ lines: [] }),
    }),
    {
      name: 'homecooks-cart',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

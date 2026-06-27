import { create } from 'zustand';
import type { Order } from '../types';

interface OrderStore {
  currentOrder: Order | null;
  orderHistory: Order[];
  setCurrentOrder: (order: Order) => void;
  clearCurrentOrder: () => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  currentOrder: null,
  orderHistory: [],

  setCurrentOrder: (order) => set({ currentOrder: order }),
  clearCurrentOrder: () => set({ currentOrder: null }),
}));

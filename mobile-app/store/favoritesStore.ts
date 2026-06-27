import { create } from 'zustand';
import type { Product } from '../types';

interface FavoritesStore {
  ids: Set<string>;
  toggle: (product: Product) => void;
  isFavorite: (id: string) => boolean;
  products: Product[];
  addProduct: (product: Product) => void;
}

export const useFavoritesStore = create<FavoritesStore>((set, get) => ({
  ids: new Set<string>(),
  products: [],

  toggle: (product: Product) => {
    const { ids, products } = get();
    const next = new Set(ids);
    if (next.has(product.id)) {
      next.delete(product.id);
      set({ ids: next, products: products.filter((p) => p.id !== product.id) });
    } else {
      next.add(product.id);
      set({ ids: next, products: [...products, product] });
    }
  },

  isFavorite: (id: string) => get().ids.has(id),

  addProduct: (product: Product) => {
    const { ids, products } = get();
    if (!ids.has(product.id)) {
      ids.add(product.id);
      set({ ids: new Set(ids), products: [...products, product] });
    }
  },
}));

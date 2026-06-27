'use client';

import { store } from './mockStore';
import type { Product, Category, Order, Review, ReviewStats, RestaurantSettings } from '../types';

const SHARED_API = 'http://localhost:4000';

async function apiFetch<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${SHARED_API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts?.headers ?? {}) },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  const json = await res.json();
  return json.data as T;
}

export const adminApi = {
  // Auth (still calls real NextAuth — no change needed)
  login: async (email: string, _password: string) => {
    return { token: 'demo-token', user: { email, name: 'Admin' } };
  },

  // Dashboard — real data from shared API
  getDashboard: async () => {
    try {
      return await apiFetch<ReturnType<typeof store.getDashboard>>('/api/dashboard');
    } catch {
      // Server not running yet — return zeroed stats
      return {
        today_orders: 0,
        today_revenue: 0,
        active_orders: 0,
        completed_orders: 0,
        total_products: store.getProducts().length,
        recent_orders: [] as Order[],
        status_breakdown: {
          placed: 0, preparing: 0, ready: 0,
          on_the_way: 0, delivered: 0, received: 0,
        },
      };
    }
  },

  // Orders — real data from shared API
  getOrders: async (params?: { status?: string; search?: string }): Promise<Order[]> => {
    try {
      const qs = new URLSearchParams();
      if (params?.status && params.status !== 'all') qs.set('status', params.status);
      if (params?.search) qs.set('search', params.search);
      const query = qs.toString() ? `?${qs}` : '';
      return await apiFetch<Order[]>(`/api/orders${query}`);
    } catch {
      return [];
    }
  },

  updateOrderStatus: async (id: string, status: string): Promise<Order> => {
    return apiFetch<Order>(`/api/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Products — local mock store (no backend needed)
  getProducts: async (): Promise<Product[]> => {
    return store.getProducts();
  },

  createProduct: async (data: Partial<Product>): Promise<Product> => {
    return store.saveProduct(data);
  },

  updateProduct: async (id: string, data: Partial<Product>): Promise<Product> => {
    return store.saveProduct({ ...data, id });
  },

  deleteProduct: async (id: string): Promise<void> => {
    store.deleteProduct(id);
  },

  toggleProduct: async (id: string): Promise<void> => {
    store.toggleProduct(id);
  },

  // Categories — local mock store
  getCategories: async (): Promise<Category[]> => {
    return store.getCategories();
  },

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    return store.saveCategory(data);
  },

  updateCategory: async (id: string, data: Partial<Category>): Promise<Category> => {
    return store.saveCategory({ ...data, id });
  },

  deleteCategory: async (id: string): Promise<void> => {
    store.deleteCategory(id);
  },

  // Settings — local mock store
  getSettings: async (): Promise<RestaurantSettings> => {
    return store.getSettings() as RestaurantSettings;
  },

  saveSettings: async (data: RestaurantSettings): Promise<void> => {
    store.saveSettings(data);
  },

  // Reviews — real data from shared API
  getReviews: async (): Promise<Review[]> => {
    try {
      return await apiFetch<Review[]>('/api/reviews');
    } catch {
      return [];
    }
  },

  getReviewStats: async (): Promise<ReviewStats> => {
    try {
      return await apiFetch<ReviewStats>('/api/reviews/stats');
    } catch {
      return { total: 0, average: 0, breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    }
  },

  uploadImage: async (_file: File): Promise<string> => {
    return `https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80`;
  },

  resetData: () => store.reset(),
};

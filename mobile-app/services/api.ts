import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, RESTAURANT_ID } from '../constants';
import type { CheckoutFormData, CartItem } from '../types';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token from storage on every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authApi = {
  register: (payload: { name: string; phone: string; email: string; password: string }) =>
    api.post('/api/auth/register', payload).then((r) => r.data.data as { token: string; user: any }),

  login: (payload: { email: string; password: string }) =>
    api.post('/api/auth/login', payload).then((r) => r.data.data as { token: string; user: any }),

  me: () =>
    api.get('/api/auth/me').then((r) => r.data.data),

  googleAuth: (payload: { google_id: string; name: string; email: string; photo_url?: string }) =>
    api.post('/api/auth/google', payload).then((r) => r.data.data as { token: string; user: any }),
};

export const menuApi = {
  // Products / categories still use mock data (no backend needed)
  getCategories: () =>
    api.get(`/restaurants/${RESTAURANT_ID}/categories`).then((r) => r.data.data),

  getProducts: (categoryId?: string) =>
    api.get(`/restaurants/${RESTAURANT_ID}/products`, {
      params: categoryId ? { category_id: categoryId } : {},
    }).then((r) => r.data.data),

  // POST /api/orders  → shared-api/server.js stores it → admin panel sees it
  placeOrder: (form: CheckoutFormData, items: CartItem[], grandTotal: number) => {
    const payload = {
      customer_name:    form.name,
      customer_phone:   form.phone,
      order_type:       form.orderType,
      table_number:     form.tableNumber   || null,
      delivery_address: form.deliveryAddress || null,
      payment_method:   (form as any).paymentMethod || 'cash',
      items: items.map((i) => ({
        product_name: i.product.name,
        price:        i.product.price,
        quantity:     i.quantity,
        subtotal:     i.product.price * i.quantity,
      })),
      subtotal: items.reduce((s, i) => s + i.product.price * i.quantity, 0),
      total:    grandTotal,
    };
    return api.post('/api/orders', payload).then((r) => r.data.data);
  },

  // GET /api/orders/track/:orderNumber
  trackOrder: (orderNumber: string) =>
    api.get(`/api/orders/track/${orderNumber}`).then((r) => r.data.data),

  // POST /api/reviews  — submit a review after order
  submitReview: (payload: {
    order_number: string;
    customer_name: string;
    rating: number;
    comment: string;
  }) => api.post('/api/reviews', payload).then((r) => r.data.data),
};

export default api;

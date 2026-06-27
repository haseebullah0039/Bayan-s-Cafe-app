import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  loadAuth: () => Promise<void>;
  setAuth: (user: AuthUser, token: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  loadAuth: async () => {
    try {
      const [token, userStr] = await Promise.all([
        AsyncStorage.getItem('auth_token'),
        AsyncStorage.getItem('auth_user'),
      ]);
      if (token && userStr) {
        set({ token, user: JSON.parse(userStr), isAuthenticated: true });
      }
    } catch {
      // corrupted storage — stay logged out
    } finally {
      set({ isLoading: false });
    }
  },

  setAuth: async (user, token) => {
    await Promise.all([
      AsyncStorage.setItem('auth_token', token),
      AsyncStorage.setItem('auth_user', JSON.stringify(user)),
    ]);
    set({ user, token, isAuthenticated: true });
  },

  // Synchronous: clears state immediately so the UI reacts instantly.
  // Storage is wiped in the background — no need to await it.
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
    AsyncStorage.removeItem('auth_token').catch(() => {});
    AsyncStorage.removeItem('auth_user').catch(() => {});
  },
}));

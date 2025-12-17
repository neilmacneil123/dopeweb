'use client';

import { create } from 'zustand';

export type AuthenticatedUser = {
  username: string;
  cash: number;
  debt: number;
  bankAccount: number;
  rank: string;
  highScore: number;
};

type AuthState = {
  user: AuthenticatedUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
};

type AuthActions = {
  register: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
  clearError: () => void;
};

type AuthStore = AuthState & AuthActions;

async function jsonRequest<T>(url: string, body?: Record<string, unknown>) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data as T;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  clearError: () => set({ error: null }),

  register: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const data = await jsonRequest<{ user: AuthenticatedUser; token: string }>('/api/register', {
        username,
        password,
      });
      set({ user: data.user, token: data.token });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const data = await jsonRequest<{ user: AuthenticatedUser; token: string }>('/api/login', {
        username,
        password,
      });
      set({ user: data.user, token: data.token });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      set({ user: null, token: null, loading: false, error: null });
    }
  },

  hydrate: async () => {
    set({ loading: true });
    try {
      const response = await fetch('/api/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        set({ user: null, token: null });
        return;
      }

      const data = (await response.json()) as { user: AuthenticatedUser };
      set({ user: data.user, token: null, error: null });
    } catch (error) {
      console.error('Failed to hydrate auth state:', error);
      set({ user: null, token: null });
    } finally {
      set({ loading: false });
    }
  },
}));

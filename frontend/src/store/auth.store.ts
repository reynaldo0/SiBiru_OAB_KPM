import { create } from 'zustand';
import { AUTH_TOKEN_KEY } from '../lib/constants';
import type { User } from '../types';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  token: string | null;
  user: User | null;
  authStatus: AuthStatus;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  beginSession: (token: string) => void;
  setStatus: (status: AuthStatus) => void;
  clearSession: () => void;
}

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

const initialToken = readStoredToken();

export const useAuthStore = create<AuthState>((set) => ({
  token: initialToken,
  user: null,
  authStatus: initialToken ? 'loading' : 'unauthenticated',

  setSession: (token, user) => {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch {
      // Local storage can be unavailable in private browsing; the session still works in memory.
    }
    set({ token, user, authStatus: 'authenticated' });
  },

  setUser: (user) => set({ user, authStatus: 'authenticated' }),

  beginSession: (token) => {
    try {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch {
      // Ignore storage failures.
    }
    set({ token, user: null, authStatus: 'loading' });
  },

  setStatus: (authStatus) => set({ authStatus }),

  clearSession: () => {
    try {
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {
      // Ignore storage failures.
    }
    set({ token: null, user: null, authStatus: 'unauthenticated' });
  },
}));

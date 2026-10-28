import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  currentUser: User | null;
  activeToken: string;
  setUser: (user: User, token: string) => void;
  switchDemoUser: (token: string) => void;
  clearUser: () => void;
}

const DEFAULT_DEMO_TOKEN = 'usr_mhs_01'; // Default: Ahmad Zaki (Mahasiswa)

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  activeToken: localStorage.getItem('sibiru_user_id') || DEFAULT_DEMO_TOKEN,
  setUser: (user, token) => {
    localStorage.setItem('sibiru_user_id', token);
    set({ currentUser: user, activeToken: token });
  },
  switchDemoUser: (token) => {
    localStorage.setItem('sibiru_user_id', token);
    set({ activeToken: token });
    // Invalidate / refresh data sesuai user aktif
    window.location.reload();
  },
  clearUser: () => {
    localStorage.removeItem('sibiru_user_id');
    set({ currentUser: null, activeToken: '' });
  },
}));

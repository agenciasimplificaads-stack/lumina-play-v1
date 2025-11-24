import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  username: string;
  password: string;
  url: string;
  isAuthenticated: boolean;
  login: (u: string, p: string, url: string) => void;
  logout: () => void;
}

// A correção está aqui: garantindo a sintaxe correta do create()
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      username: '',
      password: '',
      url: '',
      isAuthenticated: false,
      login: (username, password, url) => set({ username, password, url, isAuthenticated: true }),
      logout: () => set({ username: '', password: '', url: '', isAuthenticated: false }),
    }),
    {
      name: 'apple-stream-auth',
    }
  )
);
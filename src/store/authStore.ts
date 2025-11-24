import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  username: string;
  password: string;
  url: string;
  isLogged: boolean;
  _hasHydrated: boolean; 
  
  login: (u: string, p: string, url: string) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

const initialAuthState = {
    username: '',
    password: '',
    url: '',
    isLogged: false,
    _hasHydrated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialAuthState, 
      
      login: (username, password, url) => set({ username, password, url, isLogged: true }),
      logout: () => set(initialAuthState),
      setHasHydrated: (state) => set({ _hasHydrated: state }), // ESTA FUNÇÃO É CRÍTICA
    }),
    {
      name: 'lumina-auth', 
      
      // AQUI: Conecta o persist com o estado de hidratação. ESSENCIAL.
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

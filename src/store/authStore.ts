import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  username: string;
  password: string;
  url: string;
  isLogged: boolean;
  _hasHydrated: boolean; // Essencial para evitar o redirecionamento imediato no PlayerPage
  
  // Ações
  login: (u: string, p: string, url: string) => void;
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}

// O estado inicial que é lido antes do localStorage
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
      ...initialAuthState, // Inicia com os valores base
      
      // Ações do Store
      login: (username, password, url) => set({ username, password, url, isLogged: true }),
      logout: () => set(initialAuthState), // Volta ao estado inicial
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'lumina-auth', 
      
      // CHAVE DA SOLUÇÃO: Ação para marcar como hidratado após a leitura do storage
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

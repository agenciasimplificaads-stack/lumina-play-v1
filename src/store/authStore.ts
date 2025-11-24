// Exemplo de como DEVE ser seu authStore (apenas a estrutura)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  isLogged: boolean;
  username: string;
  // ... outras propriedades
  _hasHydrated: boolean; // NOVO: Estado de hidratação
  setHasHydrated: (state: boolean) => void;
  // ... outras ações
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLogged: false,
      username: '',
      _hasHydrated: false, // Inicia como false
      
      setHasHydrated: (state) => { // Ação para marcar como hidratado
        set({
          _hasHydrated: state
        });
      },

      // ... outras ações (login, logout, etc.)
    }),
    {
      name: 'auth-storage',
      // CHAVE DA SOLUÇÃO: Marcar como hidratado após a leitura do storage
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      // ...
    }
  )
);

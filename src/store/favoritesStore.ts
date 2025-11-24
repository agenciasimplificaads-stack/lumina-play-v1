import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface FavoriteItem {
  id: string | number;
  title: string;
  image: string;
  type: string;
}

interface FavoritesState {
  items: FavoriteItem[];
  addFavorite: (item: FavoriteItem) => void;
  removeFavorite: (id: string | number) => void;
  isFavorite: (id: string | number) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addFavorite: (item) => {
        const { items } = get();
        // Evita duplicatas
        if (!items.find((i) => i.id === item.id)) {
          set({ items: [...items, item] });
        }
      },

      removeFavorite: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      isFavorite: (id) => {
        return !!get().items.find((item) => item.id === id);
      },
    }),
    {
      name: 'lumina-favorites', // Nome no LocalStorage
    }
  )
);
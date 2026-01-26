import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Movie, TVShow } from '../types/tmdb';

interface WatchlistState {
  items: (Movie | TVShow)[];
  addItem: (item: Movie | TVShow) => void;
  removeItem: (id: number) => void;
  isInWatchlist: (id: number) => boolean;
}

export const useWatchlist = create<WatchlistState>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item) => {
        const { items } = get();
        // Prevent duplicates
        if (!items.find((i) => i.id === item.id)) {
          set({ items: [item, ...items] });
        }
      },

      removeItem: (id) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      isInWatchlist: (id) => {
        return !!get().items.find((item) => item.id === id);
      },
    }),
    {
      name: 'streamvault-watchlist', // Unique name for localStorage
    }
  )
);
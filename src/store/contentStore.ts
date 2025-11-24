import { create } from 'zustand';

interface ContentState {
  movies: any[];
  series: any[];
  channels: any[];
  categories: {
    vod: any[];
    series: any[];
    live: any[];
  };
  lastUpdated: number;
  isLoaded: boolean;
  
  setAllContent: (data: any) => void;
}

export const useContentStore = create<ContentState>((set) => ({
  movies: [],
  series: [],
  channels: [],
  categories: { vod: [], series: [], live: [] },
  lastUpdated: 0,
  isLoaded: false,

  setAllContent: (data) => set({ 
    movies: data.movies,
    series: data.series,
    channels: data.channels,
    categories: data.categories,
    isLoaded: true,
    lastUpdated: Date.now()
  }),
}));

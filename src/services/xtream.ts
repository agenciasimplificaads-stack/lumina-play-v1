import { useAuthStore } from '@/store/authStore';

const PROXY_BASE = '/api/proxy';

export const XtreamService = {
  
  async fetchFromProxy(params: Record<string, string>) {
    const { username, password, url } = useAuthStore.getState();
    const query = new URLSearchParams({ ...params, username, password, host: url });

    try {
      const res = await fetch(`${PROXY_BASE}?${query.toString()}`);
      if (!res.ok) return [];
      return await res.json();
    } catch (error) {
      return [];
    }
  },

  async authenticate(user: string, pass: string, host: string) {
    return true; // Mantém a chave mestra para desenvolvimento
  },

  // --- GETTERS (Categorias) ---
  async getCategories(type: 'vod' | 'series' | 'live') {
    const action = type === 'vod' ? 'get_vod_categories' : 
                   type === 'series' ? 'get_series_categories' : 'get_live_categories';
    const data = await this.fetchFromProxy({ action });
    return Array.isArray(data) ? data : [];
  },

  // --- GETTERS (Conteúdo) ---
  async getMovies() {
    const rawData = await this.fetchFromProxy({ action: 'get_vod_streams' });
    // FILTRO RIGOROSO: Garante que é filme
    return Array.isArray(rawData) ? rawData.filter((i:any) => i.stream_type === 'movie') : [];
  },

  async getSeries() {
    const rawData = await this.fetchFromProxy({ action: 'get_series' });
    return Array.isArray(rawData) ? rawData : [];
  },

  async getLiveChannels() {
    const rawData = await this.fetchFromProxy({ action: 'get_live_streams' });
    // FILTRO RIGOROSO: Garante que é live
    return Array.isArray(rawData) ? rawData.filter((i:any) => i.stream_type === 'live') : [];
  },

  // --- INFO & URL ---
  async getInfo(type: string, id: string | number) {
    const action = type === 'series' ? 'get_series_info' : 'get_vod_info';
    const paramName = type === 'series' ? 'series_id' : 'vod_id';
    
    const data = await this.fetchFromProxy({ action, [paramName]: String(id) });
    
    if (type === 'series') {
      return data.info ? {
        description: data.info.plot,
        rating: data.info.rating,
        genre: data.info.genre
      } : null;
    } else {
      return data.info ? {
        description: data.info.description || data.info.plot,
        rating: data.info.rating,
        genre: data.info.genre
      } : null;
    }
  },

  getStreamUrl(type: string, id: string | number) {
    const { username, password, url } = useAuthStore.getState();
    
    let category = 'live';
    let extension = '.m3u8';

    if (['movie', 'Filme', 'vod'].includes(type)) {
        category = 'movie';
        extension = '.mp4'; // Tenta .mp4 (mais comum)
    } else if (['series', 'Série'].includes(type)) {
        category = 'series';
        extension = '.mp4'; 
    }

    return `${url}/${category}/${username}/${password}/${id}${extension}`;
  }
};

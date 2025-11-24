import { useAuthStore } from '@/store/authStore';

const PROXY_BASE = '/api/proxy'; // Mantido para o JSON (Listas)

export const XtreamService = {
  
  async fetchFromProxy(params: Record<string, string>) {
    const { username, password, url } = useAuthStore.getState();
    if (!url || !username || !password) return [];
    
    const query = new URLSearchParams({ ...params, username, password, host: url });

    try {
      const res = await fetch(`${PROXY_BASE}?${query.toString()}`);
      if (!res.ok) return [];
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      return [];
    }
  },

  async authenticate(user: string, pass: string, host: string) { return true; }, 
  async getCategories(type: 'vod' | 'series' | 'live') {
    const action = type === 'vod' ? 'get_vod_categories' : 
                   type === 'series' ? 'get_series_categories' : 'get_live_categories';
    return await this.fetchFromProxy({ action });
  },
  async getMovies() {
    const rawData = await this.fetchFromProxy({ action: 'get_vod_streams' });
    return rawData.filter((item: any) => item.stream_type === 'movie');
  },
  async getSeries() {
    return await this.fetchFromProxy({ action: 'get_series' });
  },
  async getLiveChannels() {
    const rawData = await this.fetchFromProxy({ action: 'get_live_streams' });
    return rawData.filter((item: any) => item.stream_type === 'live');
  },
  async getInfo(type: string, id: string | number) {
    const action = type === 'series' ? 'get_series_info' : 'get_vod_info';
    const paramName = type === 'series' ? 'series_id' : 'vod_id';
    
    try {
        const { username, password, url } = useAuthStore.getState();
        const query = new URLSearchParams({ action, [paramName]: String(id), username, password, host: url });
        const res = await fetch(`${PROXY_BASE}?${query.toString()}`);
        const data = await res.json();

        if (!data.info) return null;
        return {
        description: data.info.plot || data.info.description || "Sem descrição.",
        rating: data.info.rating,
        genre: data.info.genre,
        cast: data.info.cast,
        director: data.info.director
        };
    } catch (e) { return null; }
  },

  // --- O SEGREDO DO XCIPTV: RETORNA O LINK PURO HTTP ---
  getStreamUrl(type: string, id: string | number) {
    const { username, password, url } = useAuthStore.getState();
    
    let category = 'live';
    let extension = '.m3u8';

    if (['movie', 'Filme', 'vod'].includes(type)) {
        category = 'movie';
        extension = '.mp4'; 
    } else if (['series', 'Série'].includes(type)) {
        category = 'series';
        extension = '.mp4'; 
    }

    // Retorna a URL HTTP crua para o celular abrir no player nativo
    return `${url}/${category}/${username}/${password}/${id}${extension}`;
  }
};

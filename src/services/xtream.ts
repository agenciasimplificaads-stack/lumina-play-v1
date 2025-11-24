import { useAuthStore } from '@/store/authStore';

const PROXY_BASE = '/api/proxy';

export const XtreamService = {
  
  // 1. Fetch Genérico
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

  // 2. Autenticação
  async authenticate(user: string, pass: string, host: string) {
    return true; 
  },

  // 3. Categorias
  async getCategories(type: 'vod' | 'series' | 'live') {
    const action = type === 'vod' ? 'get_vod_categories' : 
                   type === 'series' ? 'get_series_categories' : 'get_live_categories';
    return await this.fetchFromProxy({ action });
  },

  // 4. Filmes
  async getMovies() {
    const rawData = await this.fetchFromProxy({ action: 'get_vod_streams' });
    return rawData.filter((item: any) => item.stream_type === 'movie');
  },

  // 5. Séries
  async getSeries() {
    return await this.fetchFromProxy({ action: 'get_series' });
  },

  // 6. Canais
  async getLiveChannels() {
    const rawData = await this.fetchFromProxy({ action: 'get_live_streams' });
    return rawData.filter((item: any) => item.stream_type === 'live');
  },

  // 7. Informações (Sinopse)
  async getInfo(type: string, id: string | number) {
    const action = type === 'series' ? 'get_series_info' : 'get_vod_info';
    const paramName = type === 'series' ? 'series_id' : 'vod_id';
    
    try {
        const { username, password, url } = useAuthStore.getState();
        const query = new URLSearchParams({ 
            action, 
            [paramName]: String(id),
            username, password, host: url 
        });
        
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
    } catch (e) {
        return null;
    }
  },

  // 8. Gerador de URL (Com Proxy de Vídeo)
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

    const originalUrl = `${url}/${category}/${username}/${password}/${id}${extension}`;

    // Encode é vital para a URL passar pelo túnel
    return `/api/stream?url=${encodeURIComponent(originalUrl)}`;
  }

}; 
// FIM DO ARQUIVO

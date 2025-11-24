import { useAuthStore } from '@/store/authStore';

const PROXY_BASE = '/api/proxy';

export const XtreamService = {
  
  async fetchFromProxy(params: Record<string, string>) {
    const { username, password, url } = useAuthStore.getState();
    const query = new URLSearchParams({ ...params, username, password, host: url });

    try {
      const res = await fetch(`${PROXY_BASE}?${query.toString()}`);
      if (!res.ok) throw new Error('Falha Proxy');
      return await res.json();
    } catch (error) {
      console.warn("Erro fetch:", error);
      return [];
    }
  },

  async authenticate(user: string, pass: string, host: string) {
    // Mantém a lógica de "Chave Mestra" que fizemos antes
    return true; 
  },

  // --- BUSCA DE DADOS (AGORA COM CATEGORIAS) ---

  // 1. Buscar lista de nomes das categorias (Ex: ID 5 = Ação)
  async getCategories(type: 'vod' | 'series' | 'live') {
    const action = type === 'vod' ? 'get_vod_categories' : 
                   type === 'series' ? 'get_series_categories' : 'get_live_categories';
    return await this.fetchFromProxy({ action });
  },

  // 2. Buscar Tudo (Mantido)
  async getMovies() {
    const rawData = await this.fetchFromProxy({ action: 'get_vod_streams' });
    return Array.isArray(rawData) ? rawData : [];
  },

  async getSeries() {
    const rawData = await this.fetchFromProxy({ action: 'get_series' });
    return Array.isArray(rawData) ? rawData : [];
  },

  async getLiveChannels() {
    const rawData = await this.fetchFromProxy({ action: 'get_live_streams' });
    return Array.isArray(rawData) ? rawData : [];
  },

  // 3. Buscar Detalhes (Sinopse)
  async getInfo(type: string, id: string | number) {
    const action = type === 'series' ? 'get_series_info' : 'get_vod_info';
    const paramName = type === 'series' ? 'series_id' : 'vod_id';
    
    const data = await this.fetchFromProxy({ action, [paramName]: String(id) });
    
    // O Xtream retorna estruturas diferentes para filmes e séries
    if (type === 'series') {
      return data.info ? {
        description: data.info.plot || "Sem sinopse disponível.",
        director: data.info.director,
        cast: data.info.cast,
        rating: data.info.rating
      } : null;
    } else {
      return data.info ? {
        description: data.info.description || data.info.plot || "Sem sinopse disponível.",
        director: data.info.director,
        cast: data.info.cast,
        rating: data.info.rating
      } : null;
    }
  },

  // --- URL GENERATOR ---
  getStreamUrl(type: string, id: string | number) {
    const { username, password, url } = useAuthStore.getState();
    
    let category = 'live';
    let extension = '.m3u8';

    // Padronização dos tipos
    if (['movie', 'Filme', 'vod'].includes(type)) {
        category = 'movie';
        extension = '.mp4'; // Tenta MP4 primeiro para filmes
    } else if (['series', 'Série'].includes(type)) {
        category = 'series';
        extension = '.mp4'; 
    }

    return `${url}/${category}/${username}/${password}/${id}${extension}`;
  }
};

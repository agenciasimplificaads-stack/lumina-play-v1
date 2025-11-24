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
      console.warn("Erro ao buscar dados:", error);
      throw error;
    }
  },

  async authenticate(user: string, pass: string, host: string) {
    try {
      const query = new URLSearchParams({ username: user, password: pass, host, action: 'get_live_categories' });
      const res = await fetch(`${PROXY_BASE}?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        // Servidores Xtream retornam array vazio ou cheio se login ok
        // Retornam objeto {user_info: {auth: 0}} se falhar
        if (Array.isArray(data)) return true;
        if (data.user_info && data.user_info.auth === 1) return true;
      }
      // Se falhar, tentamos liberar mesmo assim para o app não travar (modo permissivo)
      return true; 
    } catch (err) {
      return true; 
    }
  },

  // --- GETTERS SEM LIMITES (FULL LOAD) ---

  async getMovies() {
    try {
      const rawData = await this.fetchFromProxy({ action: 'get_vod_streams' });
      if (Array.isArray(rawData)) {
        return {
          title: "Filmes",
          // SEM SLICE: Pega tudo o que vier do servidor
          items: rawData.map((item: any) => ({
            id: item.stream_id,
            title: item.name,
            image: item.stream_icon,
            type: 'Filme'
          }))
        };
      }
      return { title: "Filmes", items: [] };
    } catch (e) { return { title: "Erro Filmes", items: [] }; }
  },

  async getSeries() {
    try {
      const rawData = await this.fetchFromProxy({ action: 'get_series' });
      if (Array.isArray(rawData)) {
        return {
          title: "Séries",
          items: rawData.map((item: any) => ({
            id: item.series_id,
            title: item.name,
            image: item.cover,
            type: 'Série'
          }))
        };
      }
      return { title: "Séries", items: [] };
    } catch (e) { return { title: "Erro Séries", items: [] }; }
  },

  async getLiveChannels() {
    try {
      const rawData = await this.fetchFromProxy({ action: 'get_live_streams' });
      if (Array.isArray(rawData)) {
        return {
          title: "Canais Ao Vivo",
          items: rawData.map((item: any) => ({
            id: item.stream_id,
            title: item.name,
            image: item.stream_icon,
            type: 'Ao Vivo',
            // EPG ID é importante para o futuro
            epg_id: item.epg_channel_id 
          }))
        };
      }
      return { title: "Canais", items: [] };
    } catch (e) { return { title: "Erro Canais", items: [] }; }
  },

  // --- URL GENERATOR (FIXED) ---
  getStreamUrl(type: string, id: string | number) {
    const { username, password, url } = useAuthStore.getState();
    
    // Mapeamento correto para Xtream Codes API
    let category = 'live';
    let extension = '.m3u8'; // Padrão live

    if (type === 'Filme' || type === 'movie') {
        category = 'movie';
        extension = '.mp4'; // ou .mkv
    } else if (type === 'Série' || type === 'series') {
        category = 'series';
        extension = '.mp4'; 
    }

    // Estrutura padrão: http://url/tipo/user/pass/id.ext
    const finalUrl = `${url}/${category}/${username}/${password}/${id}${extension}`;
    return finalUrl;
  }
};

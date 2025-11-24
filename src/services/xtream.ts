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
      console.warn("Usando dados offline devido a erro:", error);
      throw error;
    }
  },

  // --- AQUI ESTÁ A CHAVE MESTRA ---
  async authenticate(user: string, pass: string, host: string) {
    try {
      const query = new URLSearchParams({ username: user, password: pass, host, action: 'get_live_categories' });
      const res = await fetch(`${PROXY_BASE}?${query.toString()}`);
      
      // Se conectar e devolver dados, ótimo.
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return true;
      }
      
      // Se o servidor negar (senha errada), NÓS deixamos entrar mesmo assim para teste (Modo Demo)
      console.log("Credenciais rejeitadas pelo servidor, ativando Modo Demo...");
      return true; 

    } catch (err) {
      // Se der erro de rede, deixa entrar também
      console.log("Servidor offline, ativando Modo Demo...");
      return true; 
    }
  },

  // --- DADOS REAIS COM FALLBACK (Mantive a lógica anterior) ---
  async getMovies() {
    try {
      const rawData = await this.fetchFromProxy({ action: 'get_vod_streams' });
      if (Array.isArray(rawData)) {
        return {
          title: "Filmes do Servidor",
          items: rawData.slice(0, 50).map((item: any) => ({
            id: item.stream_id,
            title: item.name,
            image: item.stream_icon,
            type: 'Filme'
          }))
        };
      }
      throw new Error("Falha");
    } catch (e) {
      return {
        title: "Filmes (Modo Demo)",
        items: [
          { id: 'demo1', title: "Oppenheimer", type: 'Filme', image: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg" },
          { id: 'demo2', title: "Barbie", type: 'Filme', image: "https://image.tmdb.org/t/p/w500/iuFNMS8U5cb6xfzi51Dbkovj7vM.jpg" },
          { id: 'demo3', title: "John Wick 4", type: 'Filme', image: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg" },
        ]
      };
    }
  },

  async getSeries() {
    try {
      const rawData = await this.fetchFromProxy({ action: 'get_series' });
      if (Array.isArray(rawData)) {
        return {
          title: "Séries do Servidor",
          items: rawData.slice(0, 50).map((item: any) => ({
            id: item.series_id,
            title: item.name,
            image: item.cover,
            type: 'Série'
          }))
        };
      }
      throw new Error("Falha");
    } catch (e) {
      return {
        title: "Séries (Modo Demo)",
        items: [
          { id: 'demo10', title: "The Last of Us", type: 'Série', image: "https://image.tmdb.org/t/p/w500/uKvVjHNqB5VmOrdxqAt2F7J78ED.jpg" },
          { id: 'demo11', title: "Breaking Bad", type: 'Série', image: "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg" },
        ]
      };
    }
  },

  async getLiveChannels() {
    try {
      const rawData = await this.fetchFromProxy({ action: 'get_live_streams' });
      if (Array.isArray(rawData)) {
        return {
          title: "Canais Ao Vivo",
          items: rawData.slice(0, 50).map((item: any) => ({
            id: item.stream_id,
            title: item.name,
            image: item.stream_icon,
            type: 'Ao Vivo'
          }))
        };
      }
      throw new Error("Falha");
    } catch (e) {
      return {
        title: "Canais (Modo Demo)",
        items: [
          { id: 'demo20', title: "ESPN", type: 'Ao Vivo', image: "https://upload.wikimedia.org/wikipedia/commons/2/2f/ESPN_Latin_America_logo.svg" },
          { id: 'demo21', title: "HBO", type: 'Ao Vivo', image: "https://upload.wikimedia.org/wikipedia/commons/d/de/HBO_logo.svg" },
        ]
      };
    }
  },

  getStreamUrl(type: string, id: string | number) {
    const { username, password, url } = useAuthStore.getState();
    
    if (String(id).startsWith('demo')) {
        if (type === 'movie' || type === 'Filme') return "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
        return "https://ntv1.akamaized.net/hls/live/2013530/NTV1/master.m3u8";
    }

    let category = 'live';
    let extension = '.m3u8';

    if (type === 'movie' || type === 'Filme') {
        category = 'movie';
        extension = '.mp4';
    } else if (type === 'series' || type === 'Série') {
        category = 'series';
        extension = '.mp4'; 
    }

    return `${url}/${category}/${username}/${password}/${id}${extension}`;
  }
};
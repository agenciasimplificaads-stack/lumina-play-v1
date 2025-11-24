'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { XtreamService } from '@/services/xtream';
import { useAuthStore } from '@/store/authStore';
import dynamic from 'next/dynamic';

// O Next.js exige que o Player seja carregado dinamicamente no lado do cliente (SSR False)
const DynamicReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface PlayerPageProps {
  params: {
    type: string;
    id: string;
  };
}

// Player é uma página de cliente para funcionar com Hooks e o componente de vídeo
export default function PlayerPage({ params }: PlayerPageProps) {
  const router = useRouter();
  const playerRef = useRef(null);
  const { isLogged } = useAuthStore();
  const [streamUrl, setStreamUrl] = useState('');
  const [error, setError] = useState('');
  const [showControls, setShowControls] = useState(true);
  
  const { type, id } = params;

  useEffect(() => {
    // 1. Redireciona se não estiver logado
    if (!isLogged) {
      router.push('/login');
      return;
    }

    // 2. Gera a URL do Túnel
    const rawStreamUrl = XtreamService.getStreamUrl(type, id);
    
    // 3. Envelopa a URL real com o nosso Proxy de Vídeo
    // O encodeURIComponent é VITAL para não quebrar a URL com caracteres especiais
    const tunnelUrl = `/api/stream?url=${encodeURIComponent(rawStreamUrl)}`;
    
    setStreamUrl(tunnelUrl);

  }, [isLogged, type, id, router]);

  const handleBack = () => {
    router.back();
  };

  const handleScreenClick = () => {
    setShowControls(true);
    // Esconde os controles após 3 segundos
    setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };
  
  if (error) {
      return (
          <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-4">
              <h1 className="text-xl mb-4 text-red-500">Erro de Reprodução</h1>
              <p className="mb-8 text-center">Não foi possível carregar o stream. Isso pode ser um bloqueio de segurança (HTTP/406) do servidor IPTV ou problemas com a URL.</p>
              <button 
                  onClick={handleBack} 
                  className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all"
              >
                  <ArrowLeft size={20} /> Voltar
              </button>
          </div>
      );
  }

  // Renderiza apenas se tiver a URL do stream
  if (!streamUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div 
        className="w-full h-screen bg-black relative flex items-center justify-center overflow-hidden" 
        onClick={handleScreenClick}
    >
      <div className="w-full h-full relative" style={{ maxWidth: '100vw', maxHeight: '100vh' }}>
        <DynamicReactPlayer
          ref={playerRef}
          url={streamUrl}
          playing={true}
          controls={false} // Usamos controles customizados
          width="100%"
          height="100%"
          onError={(e: any) => {
              console.error("Player Error:", e);
              setError("Falha ao carregar o vídeo.");
          }}
          config={{
              file: {
                  forceHLS: true, // Força o HLS para a maioria dos streams IPTV
                  attributes: {
                      crossOrigin: 'anonymous', // Importante para CORS
                  }
              }
          }}
        />

        {/* Controles Customizados (Visíveis em estado showControls) */}
        <div 
          className={`absolute top-0 left-0 right-0 p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
          <button 
            onClick={handleBack} 
            className="flex items-center gap-2 text-white bg-black/50 p-2 rounded-full backdrop-blur-sm hover:bg-black/70 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

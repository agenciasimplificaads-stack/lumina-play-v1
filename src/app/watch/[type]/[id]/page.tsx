'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { XtreamService } from '@/services/xtream';
import { useAuthStore } from '@/store/authStore';
import dynamic from 'next/dynamic';

const DynamicReactPlayer = dynamic(() => import('react-player'), { ssr: false });

interface PlayerPageProps {
  params: {
    type: string;
    id: string;
  };
}

export default function PlayerPage({ params }: PlayerPageProps) {
  const router = useRouter();
  const playerRef = useRef(null);
  
  // AQUI: Pegamos o estado de hidratação
  const { isLogged, _hasHydrated } = useAuthStore(); 
  
  const [streamUrl, setStreamUrl] = useState('');
  const [error, setError] = useState('');
  const [showControls, setShowControls] = useState(true);
  
  const { type, id } = params;

  useEffect(() => {
    // 1. ESPERE A HIDRATAÇÃO: Se ainda não carregou do Local Storage, SAIA.
    // Isso impede o redirecionamento instantâneo.
    if (!_hasHydrated) {
        return;
    }
    
    // 2. REDIRECIONAMENTO: Agora que o estado real foi lido, verifique o login.
    if (!isLogged) {
      router.replace('/login'); // Usa replace para não empilhar histórico
      return;
    }

    // 3. Geração da URL (apenas se logado e hidratado)
    const rawStreamUrl = XtreamService.getStreamUrl(type, id);
    const tunnelUrl = `/api/stream?url=${encodeURIComponent(rawStreamUrl)}`;
    
    setStreamUrl(tunnelUrl);

  }, [isLogged, _hasHydrated, type, id, router]); // Adicionamos _hasHydrated como dependência

  // ... (função handleBack e handleScreenClick mantidas iguais) ...

  // NOVA LÓGICA DE RENDERIZAÇÃO:
  // Se não está hidratado OU não tem a URL do stream, mostra o loading.
  if (!_hasHydrated || !streamUrl || error) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-4">
            {error ? (
                // Lógica de erro (mantida igual)
                <>
                    <h1 className="text-xl mb-4 text-red-500">Erro de Reprodução</h1>
                    <p className="mb-8 text-center">Não foi possível carregar o stream. Isso pode ser um bloqueio de segurança (HTTP/406) do servidor IPTV ou problemas com a URL.</p>
                    <button 
                        onClick={handleBack} 
                        className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all"
                    >
                        <ArrowLeft size={20} /> Voltar
                  // ... (código anterior mantido) ...

  // Renderiza apenas se tiver a URL do stream
  // Se não estiver hidratado ou logado, a lógica acima já mostra um spinner/redireciona
  if (!streamUrl || error) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-black text-white p-4">
            {error ? (
                <>
                    <h1 className="text-xl mb-4 text-red-500">Erro de Reprodução</h1>
                    <p className="mb-8 text-center">Não foi possível carregar o stream. Isso pode ser um bloqueio de segurança (HTTP/406) do servidor IPTV ou problemas com a URL.</p>
                    <button 
                        onClick={handleBack} 
                        className="flex items-center gap-2 bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-gray-200 transition-all"
                    >
                        <ArrowLeft size={20} /> Voltar
                    </button>
                </>
            ) : (
                // Tela de Loading while waiting for URL
                <div className="flex items-center justify-center h-screen bg-black">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                </div>
            )}
        </div>
    );
  }
  
  // RENDERIZAÇÃO FINAL: O Player e Controles
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
          controls={false}
          width="100%"
          height="100%"
          onError={(e: any) => {
              console.error("Player Error:", e);
              setError("Falha ao carregar o vídeo.");
          }}
          config={{
              file: {
                  forceHLS: true, 
                  attributes: {
                      crossOrigin: 'anonymous',
                  }
              }
          }}
        />

        {/* Controles Customizados */}
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

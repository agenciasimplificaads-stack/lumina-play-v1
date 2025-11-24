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
                    </button>
                </>
            ) : (
                // Tela de Loading enquanto espera a hidratação ou a URL
                <div className="flex items-center justify-center h-screen bg-black">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                </div>
            )}
        </div>
    );
  }
  
  // ... (Resto do Player) ...
  return (
    // ... Código do Player funcionando ...
  );
}

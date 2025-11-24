import { useRef, useState } from 'react';
import { MediaPlayer, MediaProvider, isHLSProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { AlertTriangle } from 'lucide-react';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

interface PlayerProps {
  src: string;
  title?: string;
}

export default function Player({ src, title }: PlayerProps) {
  const player = useRef<any>(null);
  const [error, setError] = useState(false);

  function onProviderChange(provider: any) {
    if (isHLSProvider(provider)) {
      provider.config = { lowLatencyMode: true };
    }
  }

  function handleError() {
    setError(true);
  }

  if (error) {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center p-6 text-center">
        <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4" />
        <h3 className="text-white text-lg font-bold mb-2">Bloqueio de Segurança</h3>
        <p className="text-gray-400 text-sm max-w-md">
          O navegador bloqueou a conexão com o servidor de vídeo (HTTP).
          <br/><br/>
          <strong>Como resolver:</strong>
          <br/>
          1. Clique no cadeado 🔒 na barra de endereço.
          <br/>
          2. Configurações do Site {'>'} Conteúdo Inseguro {'>'} <strong>Permitir</strong>.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <MediaPlayer
        ref={player}
        title={title}
        src={src}
        aspectRatio="16/9"
        load="eager"
        onProviderChange={onProviderChange}
        onError={handleError} // Detecta o erro
        className="w-full h-full"
      >
        <MediaProvider />
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { MediaPlayer, MediaProvider, isHLSProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';

// Importar estilos do Vidstack (Obrigatório)
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

interface PlayerProps {
  src: string;
  title?: string;
}

export default function Player({ src, title }: PlayerProps) {
  const player = useRef<any>(null);

  // Configuração para HLS (IPTV)
  function onProviderChange(provider: any) {
    if (isHLSProvider(provider)) {
      provider.config = {
        // Otimizações para carregar mais rápido
        lowLatencyMode: true, 
      };
    }
  }

  return (
    <div className="w-full h-full bg-black flex items-center justify-center overflow-hidden">
      <MediaPlayer
        ref={player}
        title={title}
        src={src}
        aspectRatio="16/9"
        load="eager" // Carrega assim que abre
        onProviderChange={onProviderChange}
        className="w-full h-full"
      >
        <MediaProvider />
        
        {/* Layout Padrão com botões (Play, Volume, Fullscreen) */}
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    </div>
  );
}
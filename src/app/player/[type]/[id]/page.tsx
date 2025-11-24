'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Player from '@/components/Player';
import { XtreamService } from '@/services/xtream';
import { ChevronLeft } from 'lucide-react';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const [streamUrl, setStreamUrl] = useState<string>('');
  
  // O Next.js preenche isso baseado no nome das pastas [type] e [id]
  const type = params.type as string;
  const id = params.id as string;

  useEffect(() => {
    const url = XtreamService.getStreamUrl(type, id);
    setStreamUrl(url);
  }, [type, id]);

  return (
    <div className="w-screen h-screen bg-black flex flex-col">
      <div className="absolute top-4 left-4 z-50 group">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 px-4 py-2 rounded-full backdrop-blur-md transition-all"
        >
          <ChevronLeft /> Voltar
        </button>
      </div>

      {streamUrl ? (
        <Player src={streamUrl} title={`Reproduzindo ${type}`} />
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          Carregando stream...
        </div>
      )}
    </div>
  );
}
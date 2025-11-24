'use client';

import { Loader2, Tv, Film, Clapperboard } from 'lucide-react';

interface StartupLoaderProps {
  status: string; // Ex: "Baixando Canais..."
  progress: number; // 0 a 100
}

export default function StartupLoader({ status, progress }: StartupLoaderProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-[#0F0F0F] flex flex-col items-center justify-center text-white">
      
      {/* Logo Pulsando */}
      <div className="mb-12 relative">
        <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.1)] animate-pulse">
          <div className="w-0 h-0 border-t-[12px] border-t-transparent border-l-[20px] border-l-black border-b-[12px] border-b-transparent ml-1"></div>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="w-64 h-1.5 bg-gray-800 rounded-full overflow-hidden mb-4">
        <div 
          className="h-full bg-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Texto de Status */}
      <h2 className="text-xl font-bold mb-1">Lumina Play</h2>
      <div className="flex items-center gap-2 text-gray-400 text-sm animate-pulse">
        {status.includes("Canais") && <Tv size={16} />}
        {status.includes("Filmes") && <Film size={16} />}
        {status.includes("Séries") && <Clapperboard size={16} />}
        <span>{status}</span>
      </div>
      
      <p className="absolute bottom-8 text-xs text-gray-600">Conectando ao servidor seguro...</p>
    </div>
  );
}

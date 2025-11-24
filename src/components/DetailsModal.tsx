import { useEffect, useState } from 'react';
import { X, Play, Star } from 'lucide-react';
import { XtreamService } from '@/services/xtream';
import Link from 'next/link'; // Importante: Voltar a usar Link

// ... (Resto do código mantido igual) ...

export default function DetailsModal({ isOpen, onClose, item }: DetailsModalProps) {
  // ... (Lógica e Hooks mantidos iguais) ...

  if (!isOpen || !item) return null;

  // NOVO: Link interno para o Player
  const isChannel = item.type === 'Ao Vivo';
  const playerLink = `/watch/${isChannel ? 'live' : 'movie'}/${item.id}`; // Volta a navegar interno

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
      {/* Backdrop e Botão Fechar... (mantidos iguais) */}

      <div className="relative bg-[#181818] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        
        {/* Botão Fechar... (mantido igual) */}

        <div className="grid md:grid-cols-[300px_1fr] gap-0 md:gap-6">
          {/* Colunas da Imagem e Info... (mantidas iguais) */}

          <div className="p-6 md:py-10 md:pr-10 flex flex-col justify-end md:justify-start">
            {/* Título, Detalhes... (mantidos iguais) */}
            
            {/* AQUI ESTÁ A CHAVE: Voltamos a usar o Link interno */}
            <div className="flex gap-3 mb-8">
              <Link href={playerLink} className="w-full">
                <button 
                  className="w-full flex items-center justify-center gap-2 bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition-transform active:scale-95"
                >
                  <Play fill="currentColor" /> Assistir (Player Interno)
                </button>
              </Link>
            </div>
            {/* ... (Sinopse e Final mantidos iguais) ... */}
          </div>
        </div>
      </div>
    </div>
  );
}

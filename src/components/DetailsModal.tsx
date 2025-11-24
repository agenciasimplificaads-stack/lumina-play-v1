'use client';

import { useEffect, useState } from 'react';
import { X, Play, Star } from 'lucide-react';
import { XtreamService } from '@/services/xtream';
import Link from 'next/link'; 

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export default function DetailsModal({ isOpen, onClose, item }: DetailsModalProps) {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && item) {
      setLoading(true);
      setDetails(null);
      
      const type = item.type === 'Série' ? 'series' : 'vod';
      if (item.type === 'Ao Vivo') {
        setLoading(false);
        return;
      }

      XtreamService.getInfo(type, item.id).then(data => {
        setDetails(data);
        setLoading(false);
      });
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  // URL HTTP PURO: Dispara o Deep Link
  const streamUrl = XtreamService.getStreamUrl(item.type, item.id);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[#181818] w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl border border-white/10 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-white hover:text-black transition-all"
        >
          <X size={24} />
        </button>

        <div className="grid md:grid-cols-[300px_1fr] gap-0 md:gap-6">
          <div className="relative h-64 md:h-full w-full">
             <img src={item.image} className="w-full h-full object-cover md:object-contain bg-black" alt={item.title} />
             <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent md:hidden" />
          </div>

          <div className="p-6 md:py-10 md:pr-10 flex flex-col justify-end md:justify-start">
            <h2 className="text-3xl font-bold text-white mb-2 leading-tight">{item.title}</h2>
            
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
              <span className="bg-white/20 px-2 py-0.5 rounded text-white font-medium">{item.type}</span>
              {details?.rating && (
                <span className="flex items-center gap-1 text-green-400"><Star size={14} fill="currentColor" /> {details.rating}</span>
              )}
            </div>

            {/* O BOTÃO DE AÇÃO QUE BYPASSA O BROWSER */}
            <div className="flex gap-3 mb-8">
              <a 
                href={streamUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-white text-black px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition-transform active:scale-95"
              >
                <Play fill="currentColor" /> Assistir (App Nativo)
              </a>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-300">Sinopse</h3>
              {loading ? (
                <div className="h-20 bg-white/5 animate-pulse rounded-lg" />
              ) : (
                <p className="text-gray-400 leading-relaxed text-sm md:text-base">
                  {details?.description || "Nenhuma descrição disponível."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { PlayCircle, Heart } from 'lucide-react';
import clsx from 'clsx';
import { useFavoritesStore } from '@/store/favoritesStore';

interface MediaCardProps {
  title: string;
  image: string;
  type: string;
  id?: number | string; 
}

// O MediaCard NÃO usa Link do Next.js. Ele apenas dispara o Modal (onClick).
export default function MediaCard({ title, image, type, id }: MediaCardProps) {
  const isChannel = type === 'Ao Vivo' || type === 'live';
  
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const isFav = id ? isFavorite(id) : false;

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!id) return;
    isFav ? removeFavorite(id) : addFavorite({ id, title, image, type });
  };

  // O card inteiro agora é um div clicável (o clique é tratado na Home page)
  return (
    <div className="group relative flex-shrink-0 w-28 md:w-40 cursor-pointer transition-transform duration-300 md:hover:scale-105 z-0 md:hover:z-10">
      
      {/* Container da Imagem */}
      <div className={clsx(
        "aspect-[2/3] rounded-lg overflow-hidden relative shadow-md bg-gray-800",
        isChannel && "bg-[#151515]"
      )}>
        <img 
          src={image} 
          alt={title} 
          className={clsx(
            "w-full h-full transition-opacity opacity-90 group-hover:opacity-100",
            isChannel ? "object-contain p-2" : "object-cover"
          )}
          loading="lazy"
        />

        {/* Botão de Favoritar */}
        <button 
          onClick={toggleFavorite}
          className="absolute top-1 right-1 z-20 p-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
        >
          <Heart size={14} className={isFav ? "fill-red-500 text-red-500" : ""} />
        </button>
        
        {/* Play Icon (Apenas Desktop) */}
        <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 items-center justify-center pointer-events-none">
          <PlayCircle className="w-10 h-10 text-white" />
        </div>
      </div>

      {/* Título */}
      <div className="mt-1.5 px-0.5">
        <h3 className="text-[11px] md:text-xs font-medium text-gray-300 group-hover:text-white truncate leading-tight">
          {title}
        </h3>
      </div>
    </div>
  );
}

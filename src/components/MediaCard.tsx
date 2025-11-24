'use client';

import { PlayCircle, Heart } from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { useFavoritesStore } from '@/store/favoritesStore';

interface MediaCardProps {
  title: string;
  image: string;
  type: string;
  id?: number | string; 
}

export default function MediaCard({ title, image, type, id }: MediaCardProps) {
  const isChannel = type === 'Ao Vivo' || type === 'live';
  const linkHref = `/player/${isChannel ? 'live' : 'movie'}/${id || 0}`;
  
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  const isFav = id ? isFavorite(id) : false;

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!id) return;
    isFav ? removeFavorite(id) : addFavorite({ id, title, image, type });
  };

  return (
    <Link href={linkHref}>
      {/* MUDANÇA: Tamanhos fixos e travados para não quebrar o layout */}
      {/* Mobile: w-28 (112px) | Desktop: w-40 (160px) */}
      <div className="group relative flex-shrink-0 w-28 md:w-40 cursor-pointer transition-transform duration-300 md:hover:scale-105 z-0 md:hover:z-10">
        
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

          <button 
            onClick={toggleFavorite}
            className="absolute top-1 right-1 z-20 p-1.5 rounded-full bg-black/60 text-white hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Heart size={14} className={isFav ? "fill-red-500 text-red-500" : ""} />
          </button>
          
          <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 items-center justify-center">
            <PlayCircle className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="mt-1.5 px-0.5">
          <h3 className="text-[11px] md:text-xs font-medium text-gray-300 group-hover:text-white truncate">
            {title}
          </h3>
        </div>
      </div>
    </Link>
  );
}

'use client'; // Necessário pois agora temos interatividade (click)

import { PlayCircle, Heart, Check } from 'lucide-react'; // Importei Heart e Check
import clsx from 'clsx';
import Link from 'next/link';
import { useFavoritesStore } from '@/store/favoritesStore'; // Importar a store

interface MediaCardProps {
  title: string;
  image: string;
  type: string;
  id?: number | string; 
}

export default function MediaCard({ title, image, type, id }: MediaCardProps) {
  const isChannel = type === 'Ao Vivo' || type === 'live';
  const linkHref = `/player/${isChannel ? 'live' : 'movie'}/${id || 0}`;

  // Hooks da Store
  const { addFavorite, removeFavorite, isFavorite } = useFavoritesStore();
  
  // Verifica se este card específico já é favorito
  const isFav = id ? isFavorite(id) : false;

  const toggleFavorite = (e: React.MouseEvent) => {
    // A MÁGICA: Impede que o clique no coração abra o filme
    e.preventDefault();
    e.stopPropagation();

    if (!id) return;

    if (isFav) {
      removeFavorite(id);
    } else {
      addFavorite({ id, title, image, type });
    }
  };

  return (
    <Link href={linkHref}>
      <div className="group relative flex-shrink-0 w-28 md:w-full cursor-pointer transition-all duration-300 md:hover:scale-105 md:hover:z-10">
        
        {/* Container da Imagem */}
        <div className={clsx(
          "aspect-[2/3] rounded-lg overflow-hidden relative shadow-md md:group-hover:shadow-2xl md:group-hover:shadow-blue-500/20",
          isChannel ? "bg-[#1A1A1A]" : "bg-gray-800"
        )}>
          <img 
            src={image} 
            alt={title} 
            className={clsx(
              "w-full h-full transition-opacity opacity-90 group-hover:opacity-100",
              isChannel ? "object-contain p-4" : "object-cover"
            )}
            loading="lazy"
          />

          {/* --- BOTÃO DE FAVORITAR (Novo) --- */}
          <button 
            onClick={toggleFavorite}
            className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:bg-white hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100"
          >
            {isFav ? (
              <Heart size={16} className="fill-red-500 text-red-500" />
            ) : (
              <Heart size={16} />
            )}
          </button>
          
          {/* Play Icon (Desktop) */}
          <div className="hidden md:flex absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center pointer-events-none">
            <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" />
          </div>
        </div>

        <div className="mt-2 px-0.5">
          <h3 className="text-xs md:text-sm font-medium text-gray-200 group-hover:text-white truncate leading-tight">
            {title}
          </h3>
          {!isChannel && (
            <p className="text-[10px] text-gray-500 capitalize mt-0.5">{type}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
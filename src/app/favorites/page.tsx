'use client';

import { useEffect, useState } from 'react';
import { useFavoritesStore } from '@/store/favoritesStore';
import MediaCard from '@/components/MediaCard';
import { Heart, Ghost } from 'lucide-react'; // Ícone Ghost para lista vazia

export default function FavoritesPage() {
  const [mounted, setMounted] = useState(false);
  const items = useFavoritesStore((state) => state.items);

  // Evita erro de hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#0F0F0F]" />;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-24 md:pb-10">
      
      {/* Header */}
      <header className="sticky top-0 z-20 bg-[#0F0F0F]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center gap-3">
        <div className="p-2 bg-pink-600/20 rounded-lg text-pink-500">
          <Heart size={24} className="fill-current" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Minha Lista</h1>
          <p className="text-xs text-gray-500 font-medium">{items.length} itens salvos</p>
        </div>
      </header>

      <main className="p-6">
        {items.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {items.map((item) => (
              <MediaCard 
                key={item.id}
                id={item.id}
                title={item.title} 
                image={item.image} 
                type={item.type} 
              />
            ))}
          </div>
        ) : (
          /* Estado Vazio */
          <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
            <Ghost size={64} className="mb-4 opacity-20" />
            <h3 className="text-lg font-medium">Sua lista está vazia</h3>
            <p className="text-sm opacity-60">Adicione filmes e canais para assistir depois.</p>
          </div>
        )}
      </main>
    </div>
  );
}
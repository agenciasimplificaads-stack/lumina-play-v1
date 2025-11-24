'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import MediaCard from '@/components/MediaCard';
import { XtreamService } from '@/services/xtream';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function SearchPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [allContent, setAllContent] = useState<any[]>([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  // 1. Verificação de Segurança
  useEffect(() => {
    if (!isAuthenticated) router.push('/login');
  }, [isAuthenticated, router]);

  // 2. Carregar o catálogo na memória (Uma vez só)
  useEffect(() => {
    const loadCatalog = async () => {
      setLoading(true);
      // Buscamos tudo de uma vez para a busca ser instantânea (Client-side filtering)
      // Em apps gigantes, faríamos a busca no servidor, mas para IPTV isso é mais rápido
      const [movies, series, channels] = await Promise.all([
        XtreamService.getMovies(),
        XtreamService.getSeries(),
        XtreamService.getLiveChannels()
      ]);

      const combined = [
        ...(movies.items || []),
        ...(series.items || []),
        ...(channels.items || [])
      ];

      setAllContent(combined);
      setResults(combined.slice(0, 20)); // Mostra alguns aleatórios de início
      setDataLoaded(true);
      setLoading(false);
    };

    if (isAuthenticated) loadCatalog();
  }, [isAuthenticated]);

  // 3. O Motor de Busca (Filtro)
  useEffect(() => {
    if (!dataLoaded) return;

    if (query.trim() === '') {
      setResults(allContent.slice(0, 20)); // Se vazio, mostra sugestões
      return;
    }

    const lowerQuery = query.toLowerCase();
    const filtered = allContent.filter(item => 
      item.title.toLowerCase().includes(lowerQuery)
    );

    setResults(filtered.slice(0, 50)); // Limita a 50 resultados para não travar
  }, [query, allContent, dataLoaded]);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-24 md:pb-10 md:pl-0">
      
      {/* Barra de Busca Fixa */}
      <header className="sticky top-0 z-30 bg-[#0F0F0F]/95 backdrop-blur-xl border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="O que você quer assistir?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/10 text-white pl-12 pr-4 py-3 rounded-xl outline-none focus:bg-white/15 focus:ring-1 focus:ring-white/20 transition-all placeholder:text-gray-500 font-medium"
            autoFocus
          />
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-7xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center mt-20 text-gray-500 gap-4">
            <Loader2 className="animate-spin" size={40} />
            <p className="text-sm">Indexando catálogo...</p>
          </div>
        ) : (
          <>
            {/* Contador de Resultados */}
            <div className="mb-6 px-1">
              <h2 className="text-sm font-medium text-gray-400">
                {query ? `Encontrados ${results.length} resultados` : 'Sugestões para você'}
              </h2>
            </div>

            {/* Grid de Resultados */}
            {results.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-6">
                {results.map((item) => (
                  <MediaCard 
                    key={`${item.type}-${item.id}`}
                    id={item.id}
                    title={item.title} 
                    image={item.image} 
                    type={item.type} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center mt-20 text-gray-500">
                <p>Nenhum resultado encontrado para "{query}"</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
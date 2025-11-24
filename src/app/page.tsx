'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useContentStore } from '@/store/contentStore'; // <--- Cache
import { XtreamService } from '@/services/xtream';
import MediaCard from '@/components/MediaCard';
import StartupLoader from '@/components/StartupLoader';
import DetailsModal from '@/components/DetailsModal';
import clsx from 'clsx';

type TabType = 'filmes' | 'series' | 'aovivo';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { isLoaded, setAllContent, movies, series, channels, categories } = useContentStore();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('filmes');
  
  // Controle de UI
  const [groupedData, setGroupedData] = useState<Record<string, any[]>>({});
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!isLoaded);
  const [loadStatus, setLoadStatus] = useState("Iniciando...");
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Função para carregar tudo DO ZERO (só roda na primeira vez)
    const fetchAll = async () => {
      try {
        setLoadStatus("Baixando Catálogo Completo...");
        setLoadProgress(10);

        // 1. Categorias
        const [catVod, catSeries, catLive] = await Promise.all([
          XtreamService.getCategories('vod'),
          XtreamService.getCategories('series'),
          XtreamService.getCategories('live')
        ]);
        setLoadProgress(30);

        // 2. Conteúdo
        setLoadStatus("Baixando Filmes e Canais...");
        const [mov, ser, live] = await Promise.all([
          XtreamService.getMovies(),
          XtreamService.getSeries(),
          XtreamService.getLiveChannels()
        ]);
        setLoadProgress(90);

        // 3. Salva no Cache Global
        setAllContent({
          movies: mov,
          series: ser,
          channels: live,
          categories: { vod: catVod, series: catSeries, live: catLive }
        });

        setLoadProgress(100);
        setTimeout(() => setIsLoading(false), 500);

      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };

    // Se já tiver dados carregados, não carrega de novo!
    if (!isLoaded) {
      fetchAll();
    } else {
      setIsLoading(false);
    }

  }, [isAuthenticated, isLoaded, router, setAllContent]);

  // Processa os dados para exibir na tela (Agrupa por Categoria)
  useEffect(() => {
    if (!isLoaded) return;

    const process = (items: any[], cats: any[]) => {
      const groups: Record<string, any[]> = {};
      const catMap = new Map(cats.map((c: any) => [String(c.category_id), c.category_name]));

      items.forEach(item => {
        const catId = item.category_id || item.series_category_id || item.category_id; // Xtream varia o nome
        const catName = catMap.get(String(catId)) || "Outros";
        
        if (!groups[catName]) groups[catName] = [];
        groups[catName].push(item);
      });

      // Ordena chaves alfabeticamente
      return Object.keys(groups).sort().reduce((acc: any, key) => {
        if (groups[key].length > 0) acc[key] = groups[key];
        return acc;
      }, {});
    };

    if (activeTab === 'filmes') setGroupedData(process(movies, categories.vod));
    else if (activeTab === 'series') setGroupedData(process(series, categories.series));
    else setGroupedData(process(channels, categories.live));

  }, [activeTab, isLoaded, movies, series, channels, categories]);

  if (!mounted) return <div className="min-h-screen bg-[#0F0F0F]" />;
  if (isLoading) return <StartupLoader status={loadStatus} progress={loadProgress} />;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-24 md:pb-10">
      
      {/* Header */}
      <header className="px-5 py-4 sticky top-0 z-30 bg-[#0F0F0F]/95 backdrop-blur-md border-b border-white/5 md:bg-transparent md:border-none md:backdrop-blur-none md:pt-8">
        <div className="flex items-center gap-3 mb-4 md:hidden">
           <h1 className="text-lg font-bold">Lumina Play</h1>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          <TabButton label="Filmes" isActive={activeTab === 'filmes'} onClick={() => setActiveTab('filmes')} />
          <TabButton label="Séries" isActive={activeTab === 'series'} onClick={() => setActiveTab('series')} />
          <TabButton label="Ao Vivo" isActive={activeTab === 'aovivo'} onClick={() => setActiveTab('aovivo')} />
        </div>
      </header>

      <main className="space-y-8 mt-6 pb-10">
        {Object.keys(groupedData).length > 0 ? (
          Object.entries(groupedData).map(([category, items]) => (
            <section key={category} className="animate-in fade-in duration-700">
              
              <h2 className="px-5 text-base md:text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
                {category}
                <span className="text-[10px] text-gray-500 border border-white/10 px-1.5 rounded">
                  {items.length}
                </span>
              </h2>
              
              {/* LAYOUT APPLE TV: Sempre Carrossel Horizontal */}
              <div className="px-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory flex flex-nowrap gap-3 md:gap-4">
                {items.map((item: any) => (
                  <div key={item.id} className="snap-start flex-shrink-0" onClick={() => setSelectedItem(item)}>
                    <div className="pointer-events-none"> 
                        <MediaCard 
                          id={item.id}
                          title={item.title} 
                          image={item.image} 
                          type={activeTab === 'aovivo' ? 'Ao Vivo' : activeTab === 'series' ? 'Série' : 'Filme'} 
                        />
                    </div>
                  </div>
                ))}
                <div className="w-8 flex-shrink-0" /> 
              </div>
            </section>
          ))
        ) : (
           <div className="text-center mt-20 text-gray-500">Nenhum conteúdo encontrado.</div>
        )}
      </main>

      <DetailsModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem}
      />

    </div>
  );
}

function TabButton({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={clsx("px-5 py-1.5 rounded-full text-sm font-medium transition-all", isActive ? "bg-white text-black shadow-lg" : "bg-white/10 text-gray-400")}>
      {label}
    </button>
  );
}

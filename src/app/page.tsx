'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useContentStore } from '@/store/contentStore'; 
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
  const [groupedData, setGroupedData] = useState<Record<string, any[]>>({});
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(!isLoaded);
  const [loadStatus, setLoadStatus] = useState("Iniciando...");
  const [loadProgress, setLoadProgress] = useState(0);

  // 1. Carga Inicial Otimizada
  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) { router.push('/login'); return; }
    if (isLoaded) { setIsLoading(false); return; }

    const fetchAll = async () => {
      try {
        setLoadStatus("Conectando..."); setLoadProgress(20);
        const [catVod, catSer, catLive] = await Promise.all([
          XtreamService.getCategories('vod'), XtreamService.getCategories('series'), XtreamService.getCategories('live')
        ]);
        setLoadProgress(40);
        
        setLoadStatus("Baixando Catálogo...");
        // Otimização: Baixa tudo, o filtro acontece no processamento
        const [mov, ser, live] = await Promise.all([
          XtreamService.getMovies(), XtreamService.getSeries(), XtreamService.getLiveChannels()
        ]);
        setLoadProgress(90);
        
        setAllContent({ movies: mov, series: ser, channels: live, categories: { vod: catVod, series: catSer, live: catLive } });
        setLoadProgress(100);
        setTimeout(() => setIsLoading(false), 500);
      } catch (error) { setIsLoading(false); }
    };
    fetchAll();
  }, [isAuthenticated, isLoaded, router, setAllContent]);

  // 2. Agrupamento Inteligente
  useEffect(() => {
    if (!isLoaded) return;

    let sourceItems: any[] = [];
    let sourceCats: any[] = [];
    
    if (activeTab === 'filmes') { sourceItems = movies; sourceCats = categories.vod; }
    else if (activeTab === 'series') { sourceItems = series; sourceCats = categories.series; }
    else { sourceItems = channels; sourceCats = categories.live; }

    const catMap = new Map(sourceCats.map((c: any) => [String(c.category_id), c.category_name]));
    const groups: Record<string, any[]> = {};

    sourceItems.forEach(item => {
      const catId = item.category_id || item.series_category_id;
      const catName = catMap.get(String(catId)) || "Outros";
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(item);
    });

    // Filtra categorias vazias e ordena
    const ordered = Object.keys(groups).sort().reduce((acc: any, key) => {
      if (groups[key].length > 0) acc[key] = groups[key];
      return acc;
    }, {});

    setGroupedData(ordered);
  }, [activeTab, isLoaded, movies, series, channels, categories]);

  if (!mounted) return <div className="min-h-screen bg-[#0F0F0F]" />;
  if (isLoading) return <StartupLoader status={loadStatus} progress={loadProgress} />;

  // ... (imports e lógica do componente HomePage mantidos iguais) ...

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-24 md:pb-10 overflow-x-hidden">
      
      <header className="px-4 py-4 sticky top-0 z-30 bg-[#0F0F0F]/95 backdrop-blur-md border-b border-white/5 md:bg-transparent md:border-none md:pt-8">
        <div className="flex items-center justify-center mb-2 md:hidden">
           <h1 className="text-lg font-bold text-white tracking-wide">Lumina Play</h1>
        </div>
        <div className="flex justify-center gap-3 overflow-x-auto scrollbar-hide pb-1">
          <TabButton label="Filmes" isActive={activeTab === 'filmes'} onClick={() => setActiveTab('filmes')} />
          <TabButton label="Séries" isActive={activeTab === 'series'} onClick={() => setActiveTab('series')} />
          <TabButton label="Ao Vivo" isActive={activeTab === 'aovivo'} onClick={() => setActiveTab('aovivo')} />
        </div>
      </header>

      <main className="mt-6 space-y-8 pb-10">
        {Object.keys(groupedData).length > 0 ? (
          Object.keys(groupedData).sort().map((category) => (
            <section key={category} className="animate-in fade-in duration-500 pl-4 md:pl-6">
              
              {/* Título da Categoria */}
              <h2 className="text-sm md:text-xl font-bold text-gray-200 mb-3 flex items-center gap-2">
                {category}
                <span className="text-[10px] text-gray-500 border border-white/10 px-1.5 rounded font-normal">
                  {groupedData[category].length}
                </span>
              </h2>
              
              {/* --- AQUI ESTÁ A CORREÇÃO DO LAYOUT --- */}
              {/* flex-nowrap: OBRIGA a ficar em uma linha só */}
              {/* overflow-x-auto: Permite rolar para o lado */}
              <div className="flex flex-nowrap gap-3 overflow-x-auto pb-4 pr-4 scrollbar-hide snap-x snap-mandatory">
                {groupedData[category].slice(0, 15).map((item: any) => (
                  <div key={item.stream_id || item.series_id} className="flex-shrink-0 snap-start w-28 md:w-40" onClick={() => setSelectedItem(item)}>
                    <div className="pointer-events-none"> 
                        <MediaCard 
                          id={item.stream_id || item.series_id}
                          title={item.name} 
                          image={item.stream_icon || item.cover} 
                          type={activeTab === 'aovivo' ? 'Ao Vivo' : 'Vod'} 
                        />
                    </div>
                  </div>
                ))}
                {/* Espaço fantasma para o último item não colar na borda */}
                <div className="w-2 flex-shrink-0" />
              </div>
            </section>
          ))
        ) : (
           <div className="text-center mt-20 text-gray-500 text-sm px-10">
             Selecione uma categoria acima para carregar o conteúdo.
           </div>
        )}
      </main>

      <DetailsModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} item={selectedItem} />
    </div>
  );
}

// ... (TabButton mantido igual)

function TabButton({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={clsx("px-4 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all", isActive ? "bg-white text-black font-bold shadow-lg" : "bg-white/5 text-gray-400 hover:bg-white/10")}>
      {label}
    </button>
  );
}


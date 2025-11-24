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
  // Pegamos os dados já limpos do Store
  const { isLoaded, setAllContent, movies, series, channels, categories } = useContentStore();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('filmes');
  
  const [groupedData, setGroupedData] = useState<Record<string, any[]>>({});
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  // Se já está carregado no Store, não mostra loading
  const [isLoading, setIsLoading] = useState(!isLoaded);
  const [loadStatus, setLoadStatus] = useState("Iniciando...");
  const [loadProgress, setLoadProgress] = useState(0);

  // 1. Carga Inicial (Só roda se o Store estiver vazio)
  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) { router.push('/login'); return; }
    if (isLoaded) { setIsLoading(false); return; } // Já temos dados!

    const fetchAll = async () => {
      try {
        setLoadStatus("Conectando ao Servidor..."); setLoadProgress(20);
        const [catVod, catSer, catLive] = await Promise.all([
          XtreamService.getCategories('vod'), XtreamService.getCategories('series'), XtreamService.getCategories('live')
        ]);
        setLoadProgress(50);
        setLoadStatus("Baixando e Filtrando Conteúdo...");
        // O XtreamService agora aplica o filtro rigoroso aqui
        const [mov, ser, live] = await Promise.all([
          XtreamService.getMovies(), XtreamService.getSeries(), XtreamService.getLiveChannels()
        ]);
        setLoadProgress(90);
        
        // Salva no cofre global
        setAllContent({ movies: mov, series: ser, channels: live, categories: { vod: catVod, series: catSer, live: catLive } });
        setLoadProgress(100);
        setTimeout(() => setIsLoading(false), 500);
      } catch (error) { setIsLoading(false); }
    };
    fetchAll();
  }, [isAuthenticated, isLoaded, router, setAllContent]);

  // 2. Processamento e Agrupamento (Roda quando muda a aba)
  useEffect(() => {
    if (!isLoaded) return;

    // Escolhe a fonte de dados correta baseada na aba
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

    setGroupedData(groups);
  }, [activeTab, isLoaded, movies, series, channels, categories]);

  if (!mounted) return <div className="min-h-screen bg-[#0F0F0F]" />;
  if (isLoading) return <StartupLoader status={loadStatus} progress={loadProgress} />;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-24 md:pb-10">
      <header className="px-4 py-4 sticky top-0 z-30 bg-[#0F0F0F]/95 backdrop-blur-md border-b border-white/5 md:bg-transparent md:border-none md:pt-8">
        <h1 className="text-lg font-bold mb-4 md:hidden">Lumina Play</h1>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          <TabButton label="Filmes" isActive={activeTab === 'filmes'} onClick={() => setActiveTab('filmes')} />
          <TabButton label="Séries" isActive={activeTab === 'series'} onClick={() => setActiveTab('series')} />
          <TabButton label="Ao Vivo" isActive={activeTab === 'aovivo'} onClick={() => setActiveTab('aovivo')} />
        </div>
      </header>

      <main className="space-y-8 mt-6 px-4 md:px-0 pb-10">
        {Object.keys(groupedData).length > 0 ? (
          Object.keys(groupedData).sort().map((category) => (
            <section key={category} className="animate-in fade-in duration-500">
              <h2 className="text-base md:text-xl font-bold text-gray-100 mb-3 md:px-5">{category}</h2>
              
              {/* --- MUDANÇA DE LAYOUT AQUI --- */}
              {/* Mobile: Grid vertical de 2 colunas */}
              {/* Desktop (md:): Flex horizontal (trilho) */}
              <div className="grid grid-cols-2 gap-3 md:flex md:overflow-x-auto md:pb-4 md:scrollbar-hide md:snap-x md:snap-mandatory md:gap-4 md:px-5">
                {groupedData[category].map((item: any) => (
                  <div key={item.stream_id || item.series_id} className="md:snap-start md:flex-shrink-0" onClick={() => setSelectedItem(item)}>
                    <div className="pointer-events-none"> 
                        <MediaCard 
                          id={item.stream_id || item.series_id}
                          title={item.name} 
                          image={item.stream_icon || item.cover} 
                          type={activeTab} 
                        />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
           <div className="text-center mt-20 text-gray-500">Nenhum conteúdo encontrado.</div>
        )}
      </main>
      <DetailsModal isOpen={!!selectedItem} onClose={() => setSelectedItem(null)} item={selectedItem} />
    </div>
  );
}

function TabButton({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button onClick={onClick} className={clsx("px-5 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap", isActive ? "bg-white text-black shadow-lg" : "bg-white/10 text-gray-400")}>
      {label}
    </button>
  );
}

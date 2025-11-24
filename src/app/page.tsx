'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { XtreamService } from '@/services/xtream';
import MediaCard from '@/components/MediaCard';
import StartupLoader from '@/components/StartupLoader';
import DetailsModal from '@/components/DetailsModal';
import clsx from 'clsx';

type TabType = 'filmes' | 'series' | 'aovivo';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('filmes');
  
  // Dados agrupados por categoria
  const [groupedData, setGroupedData] = useState<Record<string, any[]>>({});

  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadStatus, setLoadStatus] = useState("Iniciando...");
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const processCategories = (items: any[], categories: any[]) => {
      const groups: Record<string, any[]> = {};
      // Cria mapa seguro de ID -> Nome
      const catMap = new Map();
      categories.forEach((c: any) => {
        // Mapeia tanto string quanto number para garantir
        catMap.set(String(c.category_id), c.category_name);
        catMap.set(Number(c.category_id), c.category_name);
      });

      items.forEach(item => {
        // Tenta pegar o nome da categoria, se não achar, joga em "Outros"
        const catId = item.category_id || item.series_category_id;
        const catName = catMap.get(catId) || "Geral";
        
        if (!groups[catName]) groups[catName] = [];
        groups[catName].push(item);
      });
      
      // Ordena alfabeticamente
      return Object.keys(groups).sort().reduce((acc: any, key) => {
        if (groups[key].length > 0) acc[key] = groups[key];
        return acc;
      }, {});
    };

    const loadTab = async (tab: TabType) => {
      setIsLoading(true);
      setGroupedData({}); // Limpa antes de carregar

      try {
        if (tab === 'filmes') {
          setLoadStatus("Carregando Filmes...");
          setLoadProgress(30);
          const [cats, items] = await Promise.all([
            XtreamService.getCategories('vod'),
            XtreamService.getMovies()
          ]);
          setLoadProgress(70);
          setGroupedData(processCategories(items.items, cats));
        } 
        else if (tab === 'series') {
          setLoadStatus("Carregando Séries...");
          setLoadProgress(30);
          const [cats, items] = await Promise.all([
            XtreamService.getCategories('series'),
            XtreamService.getSeries()
          ]);
          setLoadProgress(70);
          setGroupedData(processCategories(items.items, cats));
        }
        else {
          setLoadStatus("Sintonizando Canais...");
          setLoadProgress(30);
          const [cats, items] = await Promise.all([
            XtreamService.getCategories('live'),
            XtreamService.getLiveChannels()
          ]);
          setLoadProgress(70);
          setGroupedData(processCategories(items.items, cats));
        }
        
        setLoadProgress(100);
        setTimeout(() => setIsLoading(false), 500);

      } catch (error) {
        console.error(error);
        setIsLoading(false);
      }
    };

    loadTab(activeTab);

  }, [isAuthenticated, router, activeTab]);

  if (!mounted) return <div className="min-h-screen bg-[#0F0F0F]" />;
  if (isLoading) return <StartupLoader status={loadStatus} progress={loadProgress} />;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-24 md:pb-10">
      
      {/* Header */}
      <header className="px-5 py-4 sticky top-0 z-30 bg-[#0F0F0F]/95 backdrop-blur-md border-b border-white/5 md:bg-transparent md:border-none md:backdrop-blur-none md:pt-8">
        <div className="flex items-center gap-3 mb-4 md:hidden">
           <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center"><div className="w-0 h-0 border-l-[8px] border-l-black border-y-[4px] border-y-transparent ml-0.5"></div></div>
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
              
              {/* Título da Categoria */}
              <h2 className="px-5 text-base md:text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
                {category}
                <span className="text-[10px] text-gray-500 font-normal border border-white/10 px-1.5 rounded">
                  {items.length}
                </span>
              </h2>
              
              {/* CARROSSEL HORIZONTAL (CORREÇÃO MOBILE) */}
              <div className="px-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory flex flex-nowrap gap-3 md:gap-4">
                {items.map((item: any) => (
                  <div key={item.id} className="snap-start flex-shrink-0" onClick={() => setSelectedItem(item)}>
                    <div className="pointer-events-none"> 
                        <MediaCard 
                          id={item.id}
                          title={item.title} 
                          image={item.image} 
                          type={item.type} 
                        />
                    </div>
                  </div>
                ))}
                {/* Espaçador final */}
                <div className="w-4 flex-shrink-0" />
              </div>
            </section>
          ))
        ) : (
           <div className="text-center mt-20 text-gray-500">Nenhum conteúdo encontrado nesta seção.</div>
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

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { XtreamService } from '@/services/xtream';
import MediaCard from '@/components/MediaCard';
import StartupLoader from '@/components/StartupLoader';
import DetailsModal from '@/components/DetailsModal'; // <--- NOVO
import clsx from 'clsx';

type TabType = 'filmes' | 'series' | 'aovivo';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('filmes');
  
  // Dados Agrupados: { "Ação": [filme1, filme2], "Comédia": [...] }
  const [groupedMovies, setGroupedMovies] = useState<Record<string, any[]>>({});
  const [groupedSeries, setGroupedSeries] = useState<Record<string, any[]>>({});
  const [groupedChannels, setGroupedChannels] = useState<Record<string, any[]>>({});

  // Controle do Modal
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Loading
  const [isLoading, setIsLoading] = useState(true);
  const [loadStatus, setLoadStatus] = useState("Iniciando...");
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const processContent = (items: any[], categories: any[]) => {
      const groups: Record<string, any[]> = {};
      // Cria mapa de ID -> Nome da Categoria
      const catMap = new Map(categories.map((c: any) => [c.category_id, c.category_name]));

      items.forEach(item => {
        const catName = catMap.get(item.category_id) || "Outros";
        if (!groups[catName]) groups[catName] = [];
        groups[catName].push(item);
      });
      
      // Ordena as categorias alfabeticamente
      return Object.keys(groups).sort().reduce((acc: any, key) => {
        acc[key] = groups[key];
        return acc;
      }, {});
    };

    const initApp = async () => {
      try {
        setLoadStatus("Baixando Categorias...");
        setLoadProgress(10);
        const [catVod, catSeries, catLive] = await Promise.all([
            XtreamService.getCategories('vod'),
            XtreamService.getCategories('series'),
            XtreamService.getCategories('live')
        ]);

        setLoadStatus("Baixando Filmes...");
        setLoadProgress(30);
        const moviesRaw = await XtreamService.getMovies();
        setGroupedMovies(processContent(moviesRaw.items, catVod));
        
        setLoadStatus("Baixando Séries...");
        setLoadProgress(60);
        const seriesRaw = await XtreamService.getSeries();
        setGroupedSeries(processContent(seriesRaw.items, catSeries));

        setLoadStatus("Baixando Canais...");
        setLoadProgress(80);
        const channelsRaw = await XtreamService.getLiveChannels();
        setGroupedChannels(processContent(channelsRaw.items, catLive));

        setLoadStatus("Organizando Catálogo...");
        setLoadProgress(100);
        setTimeout(() => setIsLoading(false), 800);

      } catch (error) {
        console.error("Erro:", error);
        setIsLoading(false);
      }
    };

    initApp();
  }, [isAuthenticated, router]);

  if (!mounted) return <div className="min-h-screen bg-[#0F0F0F]" />;
  if (isLoading) return <StartupLoader status={loadStatus} progress={loadProgress} />;

  // Seleciona o conteúdo atual
  const currentData = 
    activeTab === 'filmes' ? groupedMovies :
    activeTab === 'series' ? groupedSeries :
    groupedChannels;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-24 md:pb-10">
      
      {/* Header */}
      <header className="px-5 py-4 sticky top-0 z-30 bg-[#0F0F0F]/95 backdrop-blur-md border-b border-white/5 md:bg-transparent md:border-none md:backdrop-blur-none md:pt-8">
        <div className="flex items-center gap-3 mb-4 md:hidden">
           {/* Logo Mobile */}
           <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center"><div className="w-0 h-0 border-l-[8px] border-l-black border-y-[4px] border-y-transparent ml-0.5"></div></div>
           <h1 className="text-lg font-bold">Lumina Play</h1>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          <TabButton label="Filmes" isActive={activeTab === 'filmes'} onClick={() => setActiveTab('filmes')} />
          <TabButton label="Séries" isActive={activeTab === 'series'} onClick={() => setActiveTab('series')} />
          <TabButton label="Ao Vivo" isActive={activeTab === 'aovivo'} onClick={() => setActiveTab('aovivo')} />
        </div>
      </header>

      <main className="space-y-8 mt-4 pb-10">
        {Object.keys(currentData).length > 0 ? (
          Object.entries(currentData).map(([category, items]) => (
            <section key={category} className="animate-in fade-in duration-700">
              {/* Título da Categoria */}
              <h2 className="px-5 text-lg md:text-xl font-bold text-gray-100 mb-3 flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                {category}
                <span className="text-xs font-normal text-gray-500">({items.length})</span>
              </h2>
              
              {/* TRILHO HORIZONTAL (CARROSSEL) */}
              {/* Isso resolve o pedido: "Lista uma ao lado da outra no smartphone" */}
              <div className="px-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory flex gap-3 md:gap-4">
                {items.map((item: any) => (
                  <div key={item.id} className="snap-start flex-shrink-0" onClick={() => setSelectedItem(item)}>
                    {/* Removemos o Link do MediaCard para abrir o Modal ao invés de navegar direto */}
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
                <div className="w-8 flex-shrink-0" /> {/* Espaço final */}
              </div>
            </section>
          ))
        ) : (
           <div className="text-center mt-20 text-gray-500">Nenhum conteúdo encontrado.</div>
        )}
      </main>

      {/* O MODAL DE DETALHES */}
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
    <button onClick={onClick} className={clsx("px-5 py-1.5 rounded-full text-sm font-medium transition-all", isActive ? "bg-white text-black" : "bg-white/10 text-gray-400")}>
      {label}
    </button>
  );
}

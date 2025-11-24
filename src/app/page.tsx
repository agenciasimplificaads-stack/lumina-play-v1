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
  
  // Controle de Loading
  const [isLoading, setIsLoading] = useState(!isLoaded);
  const [loadStatus, setLoadStatus] = useState("Iniciando...");
  const [loadProgress, setLoadProgress] = useState(0);

  // 1. Verificação de Segurança (Com Delay anti-loop)
  useEffect(() => {
    setMounted(true);
    
    // Pequeno delay para garantir que o Zustand hidratou antes de redirecionar
    const timer = setTimeout(() => {
        if (!isAuthenticated) {
            router.replace('/login');
        }
    }, 200);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  // 2. Carga Inicial de Dados (Só roda se o Cache estiver vazio)
  useEffect(() => {
    if (!isAuthenticated) return;
    if (isLoaded) { setIsLoading(false); return; }

    const fetchAll = async () => {
      try {
        setLoadStatus("Conectando ao Servidor..."); setLoadProgress(20);
        const [catVod, catSer, catLive] = await Promise.all([
          XtreamService.getCategories('vod'), 
          XtreamService.getCategories('series'), 
          XtreamService.getCategories('live')
        ]);
        setLoadProgress(40);
        
        setLoadStatus("Baixando Catálogo Completo...");
        const [mov, ser, live] = await Promise.all([
          XtreamService.getMovies(), 
          XtreamService.getSeries(), 
          XtreamService.getLiveChannels()
        ]);
        setLoadProgress(90);
        
        setAllContent({ 
            movies: mov, 
            series: ser, 
            channels: live, 
            categories: { vod: catVod, series: catSer, live: catLive } 
        });
        
        setLoadProgress(100);
        setTimeout(() => setIsLoading(false), 800);
      } catch (error) { 
          console.error(error);
          setIsLoading(false); 
      }
    };
    fetchAll();
  }, [isAuthenticated, isLoaded, setAllContent]);

  // 3. Agrupamento Inteligente (Roda quando muda a aba)
  useEffect(() => {
    if (!isLoaded) return;

    let sourceItems: any[] = [];
    let sourceCats: any[] = [];
    
    if (activeTab === 'filmes') { sourceItems = movies; sourceCats = categories.vod; }
    else if (activeTab === 'series') { sourceItems = series; sourceCats = categories.series; }
    else { sourceItems = channels; sourceCats = categories.live; }

    // Cria mapa de Categorias
    const catMap = new Map(sourceCats.map((c: any) => [String(c.category_id), c.category_name]));
    const groups: Record<string, any[]> = {};

    sourceItems.forEach(item => {
      const catId = item.category_id || item.series_category_id || item.category_id;
      const catName = catMap.get(String(catId)) || "Outros";
      
      if (!groups[catName]) groups[catName] = [];
      groups[catName].push(item);
    });

    // Ordena as categorias alfabeticamente e remove as vazias
    const ordered = Object.keys(groups).sort().reduce((acc: any, key) => {
      if (groups[key].length > 0) acc[key] = groups[key];
      return acc;
    }, {});

    setGroupedData(ordered);
  }, [activeTab, isLoaded, movies, series, channels, categories]);

  if (!mounted) return <div className="min-h-screen bg-[#0F0F0F]" />;
  if (isLoading) return <StartupLoader status={loadStatus} progress={loadProgress} />;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-24 md:pb-10 overflow-x-hidden">
      
      {/* Header Fixo */}
      <header className="px-4 py-3 sticky top-0 z-30 bg-[#0F0F0F]/95 backdrop-blur-md border-b border-white/5 md:bg-transparent md:border-none md:pt-6 transition-all">
        <h1 className="text-lg font-bold mb-3 md:hidden text-center tracking-wide">Lumina Play</h1>
        <div className="flex justify-center gap-4">
          <TabButton label="Filmes" isActive={activeTab === 'filmes'} onClick={() => setActiveTab('filmes')} />
          <TabButton label="Séries" isActive={activeTab === 'series'} onClick={() => setActiveTab('series')} />
          <TabButton label="Ao Vivo" isActive={activeTab === 'aovivo'} onClick={() => setActiveTab('aovivo')} />
        </div>
      </header>

      <main className="mt-6 space-y-10 pb-10 pl-4 md:pl-6">
        {Object.keys(groupedData).length > 0 ? (
          Object.entries(groupedData).map(([category, items]) => (
            <section key={category} className="animate-in fade-in duration-500">
              
              {/* Título da Categoria */}
              <h2 className="text-base md:text-xl font-bold text-gray-100 mb-3 flex items-center gap-2">
                {category}
                <span className="text-[10px] text-gray-500 border border-white/10 px-1.5 rounded font-normal">
                  {items.length}
                </span>
              </h2>
              
              {/* TRILHO HORIZONTAL (LAYOUT NETFLIX) */}
              {/* flex-nowrap: Força linha única */}
              {/* overflow-x-auto: Permite scroll lateral */}
              <div className="flex flex-nowrap gap-3 overflow-x-auto pb-4 pr-4 scrollbar-hide snap-x snap-mandatory">
                {/* SLICE: Limitamos a 20 itens por categoria para não pesar no celular */}
                {items.slice(0, 20).map((item: any) => (
                  <div 
                    key={item.stream_id || item.series_id} 
                    className="flex-shrink-0 snap-start w-28 md:w-40" 
                    onClick={() => setSelectedItem(item)}
                  >
                    {/* Wrapper para desativar o link padrão e abrir o Modal */}
                    <div className="pointer-events-none"> 
                        <MediaCard 
                          id={item.stream_id || item.series_id}
                          title={item.name} 
                          image={item.stream_icon || item.cover} 
                          type={activeTab === 'aovivo' ? 'Ao Vivo' : activeTab === 'series' ? 'Série' : 'Filme'} 
                        />
                    </div>
                  </div>
                ))}
                {/* Espaço fantasma final */}
                <div className="w-2 flex-shrink-0" />
              </div>
            </section>
          ))
        ) : (
           <div className="flex flex-col items-center justify-center h-64 text-gray-500">
             <p>Nenhum conteúdo encontrado.</p>
           </div>
        )}
      </main>

      {/* Modal de Detalhes */}
      <DetailsModal 
        isOpen={!!selectedItem} 
        onClose={() => setSelectedItem(null)} 
        item={selectedItem} 
      />
    </div>
  );
}

// Componente de Botão
function TabButton({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick} 
      className={clsx(
        "px-5 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all transform active:scale-95",
        isActive 
          ? "bg-white text-black font-bold shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
      )}
    >
      {label}
    </button>
  );
}

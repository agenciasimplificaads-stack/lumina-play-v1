'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { XtreamService } from '@/services/xtream';
import MediaCard from '@/components/MediaCard';
import StartupLoader from '@/components/StartupLoader'; // <--- NOVO
import clsx from 'clsx';

type TabType = 'filmes' | 'series' | 'aovivo';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('filmes');
  
  // Controle de Dados
  const [moviesData, setMoviesData] = useState<any>(null);
  const [seriesData, setSeriesData] = useState<any>(null);
  const [liveData, setLiveData] = useState<any>(null);

  // Controle de Carregamento
  const [isLoading, setIsLoading] = useState(true);
  const [loadStatus, setLoadStatus] = useState("Iniciando...");
  const [loadProgress, setLoadProgress] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // --- SEQUÊNCIA DE INICIALIZAÇÃO ESTILO XCIPTV ---
    const initApp = async () => {
      try {
        setLoadStatus("Baixando Filmes...");
        setLoadProgress(10);
        const movies = await XtreamService.getMovies();
        setMoviesData(movies);
        
        setLoadStatus("Baixando Séries...");
        setLoadProgress(45);
        const series = await XtreamService.getSeries();
        setSeriesData(series);

        setLoadStatus("Atualizando Guia de Canais...");
        setLoadProgress(80);
        const channels = await XtreamService.getLiveChannels();
        setLiveData(channels);

        setLoadStatus("Finalizando...");
        setLoadProgress(100);
        
        // Pequeno delay para ver o 100%
        setTimeout(() => setIsLoading(false), 800);

      } catch (error) {
        console.error("Erro no load:", error);
        setIsLoading(false); // Entra mesmo com erro
      }
    };

    initApp();
  }, [isAuthenticated, router]);

  // Define qual conteúdo mostrar baseado na aba
  const currentContent = 
    activeTab === 'filmes' ? moviesData :
    activeTab === 'series' ? seriesData :
    liveData;

  if (!mounted) return <div className="min-h-screen bg-[#0F0F0F]" />;

  // Se estiver carregando, mostra a Tela de Startup
  if (isLoading) {
    return <StartupLoader status={loadStatus} progress={loadProgress} />;
  }

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-24 md:pb-10">
      
      {/* Header Sticky */}
      <header className="px-5 py-4 sticky top-0 z-30 bg-[#0F0F0F]/90 backdrop-blur-md border-b border-white/5 md:bg-transparent md:border-none md:backdrop-blur-none md:pt-8">
        <div className="flex items-center gap-3 mb-4 md:hidden">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-white/10">
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-l-black border-b-[4px] border-b-transparent ml-0.5"></div>
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">Lumina Play</h1>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          <TabButton label="Filmes" isActive={activeTab === 'filmes'} onClick={() => setActiveTab('filmes')} />
          <TabButton label="Séries" isActive={activeTab === 'series'} onClick={() => setActiveTab('series')} />
          <TabButton label="Ao Vivo" isActive={activeTab === 'aovivo'} onClick={() => setActiveTab('aovivo')} />
        </div>
      </header>

      <main className="space-y-6 mt-2 md:mt-0">
          {currentContent && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="px-5 text-base md:text-2xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
                {currentContent.title}
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400 font-normal border border-white/5">
                  {currentContent.items?.length || 0} Itens
                </span>
              </h2>
              
              {/* Grid Responsivo */}
              <div className="px-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory flex gap-3 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4 md:overflow-visible">
                {currentContent.items?.slice(0, 500).map((item: any) => ( // Renderiza até 500 itens por aba para não travar o DOM
                  <div key={item.id} className="snap-start flex-shrink-0 md:flex-shrink">
                    <MediaCard 
                      id={item.id}
                      title={item.title} 
                      image={item.image} 
                      type={item.type} 
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
      </main>
    </div>
  );
}

function TabButton({ label, isActive, onClick }: { label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "px-5 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap",
        isActive 
          ? "bg-white text-black shadow-lg scale-105" 
          : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
      )}
    >
      {label}
    </button>
  );
}

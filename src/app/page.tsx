'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { XtreamService } from '@/services/xtream';
import MediaCard from '@/components/MediaCard';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

type TabType = 'filmes' | 'series' | 'aovivo';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('filmes');
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadTabContent('filmes');
  }, [isAuthenticated, router]);

  const loadTabContent = async (tab: TabType) => {
    setLoading(true);
    setActiveTab(tab);
    let data;
    switch(tab) {
      case 'filmes': data = await XtreamService.getMovies(); break;
      case 'series': data = await XtreamService.getSeries(); break;
      case 'aovivo': data = await XtreamService.getLiveChannels(); break;
    }
    setContent(data);
    setLoading(false);
  };

  if (!mounted) return <div className="min-h-screen bg-[#0F0F0F]" />;

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-24 md:pb-10">
      
      {/* Header */}
      <header className="px-5 py-4 sticky top-0 z-30 bg-[#0F0F0F]/90 backdrop-blur-md border-b border-white/5 md:bg-transparent md:border-none md:backdrop-blur-none md:pt-8">
        <div className="flex items-center gap-3 mb-4 md:hidden">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg shadow-white/10">
            <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[8px] border-l-black border-b-[4px] border-b-transparent ml-0.5"></div>
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">Lumina Play</h1>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          <TabButton label="Filmes" isActive={activeTab === 'filmes'} onClick={() => loadTabContent('filmes')} />
          <TabButton label="Séries" isActive={activeTab === 'series'} onClick={() => loadTabContent('series')} />
          <TabButton label="Ao Vivo" isActive={activeTab === 'aovivo'} onClick={() => loadTabContent('aovivo')} />
        </div>
      </header>

      <main className="space-y-6 mt-2 md:mt-0">
        {loading ? (
          <div className="flex h-64 items-center justify-center animate-pulse">
            <Loader2 className="animate-spin text-white/50" size={32} />
          </div>
        ) : (
          content && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="px-5 text-base md:text-2xl font-semibold text-gray-100 mb-4 flex items-center gap-2">
                {content.title}
                <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-gray-400 font-normal border border-white/5">
                  Populares
                </span>
              </h2>
              
              <div className="px-5 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory flex gap-3 md:grid md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4 md:overflow-visible">
                {content.items.map((item: any) => (
                  <div key={item.id} className="snap-start flex-shrink-0 md:flex-shrink">
                    {/* AQUI ESTÁ A MUDANÇA QUE FIZ PARA VOCÊ: */}
                    <MediaCard 
                      id={item.id}   // <--- Passei o ID aqui
                      title={item.title} 
                      image={item.image} 
                      type={item.type} 
                    />
                  </div>
                ))}
              </div>
            </section>
          )
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
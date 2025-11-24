'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { XtreamService } from '@/services/xtream';
import MediaCard from '@/components/MediaCard';
import { Loader2, Tv } from 'lucide-react';

export default function ChannelsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  const [channels, setChannels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    const loadChannels = async () => {
      const data = await XtreamService.getLiveChannels();
      setChannels(data.items || []);
      setLoading(false);
    };

    loadChannels();
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-24 md:pb-10">
      
      {/* Header Fixo */}
      <header className="sticky top-0 z-20 bg-[#0F0F0F]/95 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex items-center gap-3">
        <div className="p-2 bg-blue-600/20 rounded-lg text-blue-500">
          <Tv size={24} />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Canais Ao Vivo</h1>
          <p className="text-xs text-gray-500 font-medium">Todos os canais disponíveis</p>
        </div>
      </header>

      <main className="p-6">
        {loading ? (
          <div className="flex h-[60vh] items-center justify-center">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-4">
            {channels.map((item) => (
              <MediaCard 
                key={item.id}
                id={item.id}
                title={item.title} 
                image={item.image} 
                type={item.type} 
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
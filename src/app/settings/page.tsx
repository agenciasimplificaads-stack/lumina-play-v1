'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LogOut, User, Shield, CreditCard, ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { username, url, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white pb-24 md:pb-10">
      
      <header className="px-6 py-8">
        <h1 className="text-3xl font-bold mb-2">Configurações</h1>
        <p className="text-gray-400">Gerencie sua conta e preferências</p>
      </header>

      <main className="px-6 max-w-2xl space-y-8">
        
        {/* Cartão de Perfil */}
        <section className="bg-white/5 rounded-2xl p-6 border border-white/5 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold">
            {username?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{username}</h2>
            <p className="text-sm text-gray-400 truncate">{url}</p>
          </div>
          <div className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full uppercase tracking-wider">
            Ativo
          </div>
        </section>

        {/* Menu de Opções */}
        <section className="space-y-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Geral</h3>
          
          <SettingsItem icon={<User />} label="Dados da Conta" />
          <SettingsItem icon={<Shield />} label="Controle dos Pais" />
          <SettingsItem icon={<CreditCard />} label="Assinatura" value="Premium" />
        </section>

        {/* Zona de Perigo */}
        <section className="pt-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all group"
          >
            <div className="flex items-center gap-3">
              <LogOut size={20} />
              <span className="font-medium">Sair da Conta</span>
            </div>
          </button>
        </section>

        <p className="text-center text-xs text-gray-600 pt-8">
          Lumina Play v1.0.0 • Build 2024
        </p>
      </main>
    </div>
  );
}

// Componente auxiliar de item
function SettingsItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors group">
      <div className="flex items-center gap-3 text-gray-300 group-hover:text-white">
        {icon}
        <span className="font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {value && <span className="text-sm text-gray-500">{value}</span>}
        <ChevronRight size={16} className="text-gray-600" />
      </div>
    </div>
  );
}
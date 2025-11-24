'use client'; // Necessário para usar usePathname se quisermos destacar o ativo (opcional, mas boa prática)

import { Home, Tv, Search, Settings, Heart } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0F0F0F]/95 backdrop-blur-xl border-t border-white/10 flex items-center justify-around z-50 pb-safe shadow-2xl">
      <NavItem href="/" icon={<Home size={20} />} label="Início" isActive={pathname === '/'} />
      <NavItem href="/channels" icon={<Tv size={20} />} label="Canais" isActive={pathname === '/channels'} />
      
      {/* --- NOVO ITEM: FAVORITOS --- */}
      <NavItem href="/favorites" icon={<Heart size={20} />} label="Minha Lista" isActive={pathname === '/favorites'} />
      
      <NavItem href="/search" icon={<Search size={20} />} label="Buscar" isActive={pathname === '/search'} />
      <NavItem href="/settings" icon={<Settings size={20} />} label="Ajustes" isActive={pathname === '/settings'} />
    </div>
  );
}

// Componente Auxiliar para manter o código limpo
function NavItem({ href, icon, label, isActive }: any) {
  return (
    <Link 
      href={href} 
      className={clsx(
        "flex flex-col items-center gap-1 transition-colors p-2 rounded-lg",
        isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
      )}
    >
      <div className={clsx("transition-transform duration-200", isActive && "scale-110")}>
        {icon}
      </div>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
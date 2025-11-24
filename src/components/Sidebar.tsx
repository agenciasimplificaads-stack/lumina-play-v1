import { Home, Tv, Search, Settings, Heart } from 'lucide-react';
import Link from 'next/link';

export default function Sidebar() {
  return (
    // "hidden md:flex": Escondido no celular, Flexível no PC
    <aside className="hidden md:flex w-24 hover:w-64 transition-all duration-300 h-screen bg-black/40 backdrop-blur-xl border-r border-white/10 flex-col z-50 fixed left-0 top-0 group">
      
      {/* --- ÁREA DO LOGO --- */}
      <div className="h-20 flex items-center border-b border-white/5 overflow-hidden">
        
        {/* Container do Logo: Largura FIXA (w-24) para travar o logo na esquerda */}
        <div className="w-24 flex-shrink-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.3)]">
            <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-black border-b-[6px] border-b-transparent ml-1"></div>
          </div>
        </div>

        {/* Nome da Marca: Aparece suavemente ao lado */}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white font-bold text-lg whitespace-nowrap">
          Lumina Play
        </span>
      </div>

      {/* --- NAVEGAÇÃO --- */}
      <nav className="flex-1 flex flex-col gap-2 p-4 mt-4">
        <NavItem icon={<Home size={22} />} label="Início" href="/" />
        <NavItem icon={<Tv size={22} />} label="Canais Ao Vivo" href="/channels" />
        
        {/* Novo Item de Favoritos */}
        <NavItem icon={<Heart size={22} />} label="Minha Lista" href="/favorites" />
        
        <NavItem icon={<Search size={22} />} label="Buscar" href="/search" />
        
        {/* Espaçador que empurra o resto para baixo */}
        <div className="flex-1" />
        
        <NavItem icon={<Settings size={22} />} label="Configurações" href="/settings" />
      </nav>
    </aside>
  );
}

// Componente Auxiliar para os Botões
function NavItem({ icon, label, href }: { icon: any, label: string, href: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all group/item overflow-hidden">
      {/* Ícone fixo centralizado */}
      <div className="min-w-[24px] flex justify-center">{icon}</div>
      
      {/* Texto com atraso suave */}
      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap font-medium text-sm ml-2">
        {label}
      </span>
    </Link>
  );
}
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

// Configurações de Janela (Mobile Viewport)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Impede que o usuário dê zoom pinçando a tela (comportamento de App)
  themeColor: "#000000",
};

// Metadados do App (SEO e PWA)
export const metadata: Metadata = {
  title: "Lumina Play",
  description: "Premium Streaming Experience",
  
  // Link para o Manifesto (Transforma em App Instalável)
  manifest: "/manifest.json",

  // Configurações específicas para iPhone (iOS)
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent", // Barra de status transparente
    title: "Lumina Play",
  },
  formatDetection: {
    telephone: false, // Evita que números virem links de telefone
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br">
      <body className={`${inter.className} bg-[#0F0F0F] text-white selection:bg-white/20 overflow-x-hidden antialiased`}>
        
        {/* Menu Lateral (Aparece só no PC) */}
        <Sidebar />

        {/* Área Principal do Conteúdo */}
        {/* pl-0: Sem margem no celular */}
        {/* md:pl-24: Margem esquerda no PC para não ficar embaixo da Sidebar */}
        <main className="pl-0 md:pl-24 w-full min-h-screen">
          {children}
        </main>

        {/* Menu Inferior (Aparece só no Celular) */}
        <BottomNav />
        
      </body>
    </html>
  );
}
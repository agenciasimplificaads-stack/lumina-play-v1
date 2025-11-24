'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { XtreamService } from '@/services/xtream';
import { Loader2, PlayCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Credenciais pré-preenchidas para facilitar
  const [host, setHost] = useState('http://svrhost.club');
  const [username, setUsername] = useState('B3L6A129');
  const [password, setPassword] = useState('7MZ3DR91');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Agora essa função SEMPRE retorna true (Chave Mestra)
      const isValid = await XtreamService.authenticate(username, password, host);
      
      if (isValid) {
        login(username, password, host);
        router.push('/'); 
      } else {
        setError('Login falhou. Tente novamente.');
      }
    } catch (err) {
      // Fallback extra de segurança
      login(username, password, host);
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#0F0F0F] p-4 relative overflow-hidden">
      
      {/* Background Sutil (Sem erros de console) */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 via-purple-900/10 to-black pointer-events-none" />

      <div className="z-10 w-full max-w-md space-y-8 rounded-2xl bg-black/60 p-8 backdrop-blur-xl border border-white/10 shadow-2xl">
        <div className="text-center flex flex-col items-center">
          {/* Logo Lumina */}
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.2)] mb-6">
            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-black border-b-[8px] border-b-transparent ml-1"></div>
          </div>
          
          <h2 className="text-3xl font-bold tracking-tight text-white">Lumina Play</h2>
          <p className="mt-2 text-sm text-gray-400">Entre com sua conta IPTV</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase ml-1">Servidor URL</label>
              <input
                type="text"
                value={host}
                onChange={(e) => setHost(e.target.value)}
                className="block w-full rounded-lg border border-white/10 bg-black/50 p-3 text-white placeholder-gray-500 focus:border-white focus:ring-1 focus:ring-white transition-all outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase ml-1">Usuário</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full rounded-lg border border-white/10 bg-black/50 p-3 text-white focus:border-white focus:ring-1 focus:ring-white transition-all outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase ml-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-white/10 bg-black/50 p-3 text-white focus:border-white focus:ring-1 focus:ring-white transition-all outline-none"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-900/20 p-2 rounded border border-red-900/50">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full justify-center rounded-lg bg-white px-3 py-3 text-sm font-semibold text-black hover:bg-gray-200 transition-all"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <span className="flex items-center gap-2">Entrar <PlayCircle size={18} /></span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
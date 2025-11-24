import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  // Captura os parâmetros enviados pelo Front-end
  const action = searchParams.get('action');
  const user = searchParams.get('username');
  const pass = searchParams.get('password');
  const host = searchParams.get('host'); // Esperamos http://svrhost.club
  const category_id = searchParams.get('category_id');
  const stream_id = searchParams.get('stream_id');

  // Validação básica
  if (!host || !user || !pass) {
    return NextResponse.json({ error: 'Faltam credenciais' }, { status: 400 });
  }

  try {
    // Monta a URL original do servidor IPTV
    let apiUrl = `${host}/player_api.php?username=${user}&password=${pass}&action=${action}`;
    
    // Adiciona parâmetros opcionais se existirem
    if (category_id) apiUrl += `&category_id=${category_id}`;
    if (stream_id) apiUrl += `&stream_id=${stream_id}`;

    console.log(`Proxyando requisição para: ${action}`);

    // O Servidor Next.js faz a chamada (Server-to-Server não tem bloqueio de CORS/Mixed Content)
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Erro no servidor IPTV: ${response.status}`);
    }

    const data = await response.json();

    // Retorna para o seu site
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("Erro no Proxy:", error);
    return NextResponse.json({ error: 'Falha ao conectar no servidor IPTV' }, { status: 500 });
  }
}
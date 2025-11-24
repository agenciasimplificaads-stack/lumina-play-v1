import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  
  const action = searchParams.get('action');
  const user = searchParams.get('username');
  const pass = searchParams.get('password');
  const host = searchParams.get('host');
  const category_id = searchParams.get('category_id');
  const stream_id = searchParams.get('stream_id');

  if (!host || !user || !pass) {
    return NextResponse.json({ error: 'Credenciais ausentes' }, { status: 400 });
  }

  try {
    // Monta a URL
    let apiUrl = `${host}/player_api.php?username=${user}&password=${pass}&action=${action}`;
    if (category_id) apiUrl += `&category_id=${category_id}`;
    if (stream_id) apiUrl += `&stream_id=${stream_id}`;

    console.log(`[Proxy] Tentando conectar: ${action} em ${host}`);

    // --- A CAMUFLAGEM (HEADERS) ---
    // Fingimos ser um Player legítimo para o servidor não bloquear
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'IPTV Smarters Pro', // Crachá falso
        'Accept': '*/*',
        'Connection': 'keep-alive'
      }
    });
    
    if (!response.ok) {
      console.error(`[Proxy Error] Status: ${response.status}`);
      throw new Error(`Erro no servidor IPTV: ${response.status}`);
    }

    const data = await response.json();

    // Verifica se o servidor retornou erro de autenticação no JSON
    // Alguns servidores retornam 200 OK mas com JSON {user_info: {auth: 0}}
    if (data.user_info && data.user_info.auth === 0) {
        console.error("[Proxy] Login Recusado pelo servidor");
        return NextResponse.json({ error: 'Login inválido' }, { status: 401 });
    }

    return NextResponse.json(data);
    
  } catch (error) {
    console.error("[Proxy Falha Crítica]:", error);
    // Retorna erro 500 para o frontend saber que falhou e usar o Demo se quiser
    return NextResponse.json({ error: 'Falha ao conectar no servidor IPTV' }, { status: 500 });
  }
}

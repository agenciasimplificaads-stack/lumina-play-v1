import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const user = searchParams.get('username');
  const pass = searchParams.get('password');
  const host = searchParams.get('host');
  
  // Pega outros params dinamicamente (vod_id, series_id, category_id)
  const otherParams = new URLSearchParams(searchParams);
  otherParams.delete('action');
  otherParams.delete('username');
  otherParams.delete('password');
  otherParams.delete('host');

  if (!host || !user || !pass) {
    return NextResponse.json({ error: 'Credenciais ausentes' }, { status: 400 });
  }

  try {
    // Monta a URL final com todos os parâmetros extras (vod_id, etc)
    const apiUrl = `${host}/player_api.php?username=${user}&password=${pass}&action=${action}&${otherParams.toString()}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'IPTV Smarters Pro',
      }
    });
    
    if (!response.ok) {
      throw new Error(`Status IPTV: ${response.status}`);
    }

    // BLINDAGEM: Verifica se é JSON antes de tentar ler
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        return NextResponse.json(data);
    } else {
        // Se não for JSON (ex: erro HTML do servidor), retorna texto ou erro tratado
        const text = await response.text();
        console.error("[Proxy] Resposta não-JSON:", text.substring(0, 100));
        return NextResponse.json({ error: 'Formato inválido do servidor' }, { status: 502 });
    }
    
  } catch (error: any) {
    console.error("[Proxy Error]:", error.message);
    return NextResponse.json({ error: 'Falha na conexão' }, { status: 500 });
  }
}

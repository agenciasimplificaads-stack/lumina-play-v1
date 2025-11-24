import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');

  if (!url) {
    return new NextResponse("URL not provided", { status: 400 });
  }

  try {
    // O Vercel vai buscar o vídeo no servidor HTTP
    const response = await fetch(url, {
      headers: {
        // Fingimos ser um player legítimo
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', 
      }
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch video: ${response.status}`, { status: response.status });
    }

    // Prepara os cabeçalhos para o navegador aceitar o stream
    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    
    // Importante: Removemos codificação gzip para vídeo não corromper
    headers.delete('content-encoding'); 

    // Retorna o fluxo de vídeo (Stream)
    return new NextResponse(response.body, {
      status: 200,
      headers: headers,
    });

  } catch (error) {
    console.error("Stream Proxy Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

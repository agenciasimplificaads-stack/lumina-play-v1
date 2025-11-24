import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const videoUrl = request.nextUrl.searchParams.get('url');

  if (!videoUrl) return new NextResponse("URL missing", { status: 400 });

  try {
    const urlObject = new URL(videoUrl);
    
    // Faz a requisição ao servidor de vídeo original, enviando headers que o servidor espera (anti-406)
    const response = await fetch(videoUrl, {
        headers: {
            'User-Agent': 'VLC Media Player/3.0.18', // Simula um player real
            'Referer': urlObject.origin, // Adiciona o referer
            'Host': urlObject.host,
            'Connection': 'keep-alive',
            'Accept-Encoding': 'identity;q=1, *;q=0', // Importante para HLS
        },
        // O cache 'no-store' é vital para streaming para evitar timeout
        cache: 'no-store' 
    });

    if (!response.ok) throw new Error(`Stream Error: ${response.status}`);

    // Cria a resposta de streaming, copiando os headers do servidor de vídeo
    const newHeaders = new Headers(response.headers);
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.delete("content-encoding"); // Remove compressão que pode quebrar o stream
    newHeaders.delete("transfer-encoding"); // Essencial para o Vercel Serverless

    // Retorna o fluxo de vídeo (Stream)
    return new NextResponse(response.body, {
        status: 200,
        headers: newHeaders,
    });

  } catch (error) {
    console.error("Stream Proxy Fail:", error);
    return new NextResponse(`Stream connection failed: ${error}`, { status: 500 });
  }
}

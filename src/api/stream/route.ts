import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const videoUrl = request.nextUrl.searchParams.get('url');

  if (!videoUrl) return new NextResponse("URL missing", { status: 400 });

  try {
    // Faz a requisição ao servidor de vídeo original
    const response = await fetch(videoUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        }
    });

    if (!response.ok) throw new Error(`Stream Error: ${response.status}`);

    // Cria a resposta de streaming
    const newHeaders = new Headers(response.headers);
    
    // Importante: Configura CORS e Tipo para o navegador aceitar
    newHeaders.set("Access-Control-Allow-Origin", "*");
    newHeaders.set("Content-Type", response.headers.get("Content-Type") || "video/mp4");
    newHeaders.delete("content-encoding"); // Evita erro de compressão

    return new NextResponse(response.body, {
        status: 200,
        headers: newHeaders
    });

  } catch (error) {
    console.error("Stream Fail:", error);
    return new NextResponse("Stream Failed", { status: 500 });
  }
}

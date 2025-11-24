import { NextResponse } from 'next/server';

const BASE = 'http://svrhost.club';

async function forwardRequest(targetUrl: string, init: RequestInit) {
  const res = await fetch(targetUrl, init);
  const text = await res.text();
  try {
    const json = JSON.parse(text);
    return json;
  } catch (e) {
    return { text };
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;
    const action = params.get('action') || '';

    // Build target URL
    const targetPath = action ? `/${action}` : '/';
    const targetUrl = `${BASE}${targetPath}?${params.toString()}`;

    const payload = await forwardRequest(targetUrl, { method: 'GET' });
    return NextResponse.json(payload);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Proxy error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const params = url.searchParams;
    const action = params.get('action') || '';
    const body = await req.text();

    const targetPath = action ? `/${action}` : '/';
    const targetUrl = `${BASE}${targetPath}?${params.toString()}`;

    const payload = await forwardRequest(targetUrl, { method: 'POST', body, headers: { 'content-type': 'application/json' } });
    return NextResponse.json(payload);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Proxy error' }, { status: 500 });
  }
}

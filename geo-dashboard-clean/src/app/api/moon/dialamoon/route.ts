import { NextResponse } from 'next/server';

// Proxy ligero a NASA Dial-A-Moon para una fecha/hora dada (UTC)
// Uso: /api/moon/dialamoon?time=2025-08-20T22:00
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const time = searchParams.get('time');
    if (!time) return NextResponse.json({ error: 'Missing time param (e.g. 2025-08-20T22:00)' }, { status: 400 });

    const nasaUrl = `https://svs.gsfc.nasa.gov/api/dialamoon/${encodeURIComponent(time)}`;
    const res = await fetch(nasaUrl, { headers: { 'accept': 'application/json' }, cache: 'no-store' });
    if (!res.ok) return NextResponse.json({ error: 'NASA API error' }, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data, { headers: { 'cache-control': 'public, max-age=600' } });
  } catch (e) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}



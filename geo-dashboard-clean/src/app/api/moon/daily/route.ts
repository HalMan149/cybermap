export const revalidate = 21600; // 6h

async function fetchLatestMoonImageUrl(): Promise<string | null> {
  const pageUrl = 'https://svs.gsfc.nasa.gov/5415/';
  try {
    const res = await fetch(pageUrl, { method: 'GET', cache: 'no-store' });
    if (!res.ok) return null;
    const html = await res.text();
    const matches = Array.from(html.matchAll(/https?:\/\/[^"']+?\.jpg/gi)).map(m => m[0]);
    const frames = matches.filter(u => u.includes('/frames/'));
    if (frames.length === 0) return null;
    const candidates = frames.filter(u => u.includes('730x730'));
    const list = candidates.length ? candidates : frames;
    // Try to pick the highest frame number
    const scored = list.map(u => {
      const m = u.match(/_(\d+)\.jpg$/);
      const n = m ? parseInt(m[1], 10) : 0;
      return { url: u, n };
    }).sort((a, b) => b.n - a.n);
    return (scored[0] && scored[0].url) || list[list.length - 1];
  } catch {
    return null;
  }
}

export async function GET() {
  const url = await fetchLatestMoonImageUrl();
  if (!url) {
    return new Response(JSON.stringify({ error: 'Moon image not found' }), { status: 502 });
  }
  return Response.redirect(url, 302);
}


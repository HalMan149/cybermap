import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';

export const dynamic = 'force-dynamic';
export const revalidate = 21600;
export const runtime = 'nodejs';

async function getLatestMoonFrameUrl(): Promise<string | null> {
  try {
    const res = await fetch('https://svs.gsfc.nasa.gov/5415/', { cache: 'no-store' });
    if (!res.ok) return null;
    const html = await res.text();
    const matches = Array.from(html.matchAll(/https?:\/\/[^"']+?\.jpg/gi)).map(m => m[0]);
    const frames = matches.filter(u => u.includes('/frames/'));
    const candidates = frames.filter(u => u.includes('730x730'));
    const list = candidates.length ? candidates : frames;
    const scored = list.map(u => {
      const m = u.match(/_(\d+)\.jpg$/);
      const n = m ? parseInt(m[1], 10) : 0;
      return { url: u, n };
    }).sort((a, b) => b.n - a.n);
    return (scored[0] && scored[0].url) || list[list.length - 1] || null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const frameUrl = await getLatestMoonFrameUrl();

  let browser: import('puppeteer-core').Browser | null = null;
  try {
    const exePath = await chromium.executablePath();
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 200, height: 200, deviceScaleFactor: 2 },
      executablePath: exePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    const html = `<!doctype html>
      <html><head><meta charset="utf-8"/><style>
      html,body{margin:0;padding:0;background:#0b1021;}
      .wrap{width:200px;height:200px;display:flex;align-items:center;justify-content:center}
      img{width:180px;height:180px;border-radius:50%;object-fit:cover}
      </style></head><body>
      <div class="wrap"><img src="${frameUrl || ''}" /></div>
      </body></html>`;
    await page.setContent(html, { waitUntil: ['domcontentloaded', 'networkidle0'] });
    const buf = await page.screenshot({ type: 'png' });
    const blob = new Blob([buf], { type: 'image/png' });
    return new Response(blob, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=21600' } });
  } catch (err) {
    // Fallback: si Puppeteer falla en el entorno de Netlify, redirige al JPG diario
    try {
      const dailyUrl = new URL('/api/moon/daily', request.url).toString();
      // Netlify/Next devolverá 302 hacia el último JPG de NASA
      return Response.redirect(dailyUrl, 302);
    } catch {
      if (frameUrl) return Response.redirect(frameUrl, 302);
      return new Response('Internal Server Error', { status: 500 });
    }
  } finally {
    try { if (browser) await browser.close(); } catch {}
  }
}



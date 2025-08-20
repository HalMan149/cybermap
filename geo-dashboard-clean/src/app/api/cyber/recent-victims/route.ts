export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const res = await fetch('https://api.ransomware.live/v2/recentvictims', { next: { revalidate: 60 } });
    if (!res.ok) return new Response(JSON.stringify({ error: 'Upstream error' }), { status: res.status });
    const data = await res.json();
    return Response.json(data);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Unknown error' }), { status: 500 });
  }
}



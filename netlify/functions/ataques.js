const fetch = require('node-fetch');

// URLs de listas públicas de IP maliciosas
const SOURCES = [
  'https://feodotracker.abuse.ch/downloads/ipblocklist.txt',
  'https://sslbl.abuse.ch/blacklist/sslipblacklist.txt',
  'https://ransomwaretracker.abuse.ch/downloads/RW_IPBL.txt'
];

// Límite de IPs a devolver para no saturar el mapa
const MAX_IPS = 500;
const BATCH_SIZE = 100;

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function fetchList(url) {
  const res = await fetch(url, { timeout: 10000 });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#') && /^[0-9.]+$/.test(l));
}

async function geoBatch(ips) {
  try {
    const res = await fetch('http://ip-api.com/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
      body: JSON.stringify(
        ips.map(ip => ({
          query: ip,
          fields: 'query,lat,lon,country,status'
        }))
      )
    });
    const data = await res.json();
    return data
      .filter(d => d.status === 'success' && typeof d.lat === 'number' && typeof d.lon === 'number')
      .map(d => ({
        ip: d.query,
        lat: d.lat,
        lon: d.lon,
        country: d.country || 'N/D',
        source: 'public-feed',
        ts: Date.now()
      }));
  } catch (e) {
    return [];
  }
}

exports.handler = async function () {
  try {
    // Descargar y combinar listas
    const lists = await Promise.allSettled(SOURCES.map(fetchList));
    const ips = new Set();
    for (const res of lists) {
      if (res.status === 'fulfilled') {
        res.value.forEach(ip => ips.add(ip));
      }
    }
    const all = shuffle(Array.from(ips)).slice(0, MAX_IPS);

    // Geolocalizar en batch para minimizar fallos
    const events = [];
    for (let i = 0; i < all.length; i += BATCH_SIZE) {
      const chunk = all.slice(i, i + BATCH_SIZE);
      const geos = await geoBatch(chunk);
      events.push(...geos);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count: events.length, events })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'failed', detail: error.message })
    };
  }
};


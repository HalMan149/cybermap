const fetch = require('node-fetch');

// URLs de listas públicas de IP maliciosas
const SOURCES = [
  'https://feodotracker.abuse.ch/downloads/ipblocklist.txt',
  'https://sslbl.abuse.ch/blacklist/sslipblacklist.txt',
  'https://ransomwaretracker.abuse.ch/downloads/RW_IPBL.txt'
];

// Límite de IPs a devolver para no saturar el mapa
const MAX_IPS = 500;

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

async function geoIP(ip) {
  try {
    const res = await fetch(`https://ipwho.is/${ip}`, { timeout: 8000 });
    const data = await res.json();
    if (!data.success) return null;
    const { latitude, longitude, country } = data;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return null;
    return { lat: latitude, lon: longitude, country: country || 'N/D' };
  } catch (e) {
    return null;
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

    // Geolocalizar (secuencial sencillo para no abusar)
    const events = [];
    for (const ip of all) {
      const geo = await geoIP(ip);
      if (geo) {
        events.push({
          ip,
          lat: geo.lat,
          lon: geo.lon,
          country: geo.country,
          source: 'public-feed',
          ts: Date.now()
        });
      }
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


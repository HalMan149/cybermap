const fs = require('fs');
const fetch = require('node-fetch');
const maxmind = require('maxmind');

// Fuentes de datos
const SOURCES = {
  firehol: 'https://raw.githubusercontent.com/firehol/blocklist-ipsets/master/firehol_level1.netset',
  ransomware: 'https://api.ransomware.live/recentvictims',
  feodo: 'https://feodotracker.abuse.ch/downloads/ipblocklist.json',
  ipsum: 'https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt',
  blocklist: 'https://lists.blocklist.de/lists/all.txt',
  // PhishStats deshabilitado - sitio inaccesible
  sans: 'https://isc.sans.edu/api/sources/attacks/' // Sin /1000 - endpoint correcto
};

// Coordenadas por país (para fallback)
const COUNTRY_COORDS = {
  'US': [37.09, -95.71], 'CA': [56.13, -106.34], 'MX': [23.63, -102.55],
  'BR': [-14.23, -51.92], 'AR': [-38.41, -63.61], 'CL': [-35.67, -71.54],
  'GB': [55.37, -3.43], 'FR': [46.22, 2.21], 'DE': [51.16, 10.45], 'IT': [41.87, 12.56],
  'ES': [40.46, -3.74], 'NL': [52.13, 5.29], 'BE': [50.50, 4.47], 'CH': [46.81, 8.22],
  'SE': [60.12, 18.64], 'NO': [60.47, 8.46], 'DK': [56.26, 9.50], 'FI': [61.92, 25.74],
  'PL': [51.91, 19.14], 'RU': [61.52, 105.31], 'UA': [48.37, 31.16], 'TR': [38.96, 35.24],
  'IN': [20.59, 78.96], 'CN': [35.86, 104.19], 'JP': [36.20, 138.25], 'KR': [35.90, 127.76],
  'AU': [-25.27, 133.77], 'NZ': [-40.90, 174.88], 'ZA': [-30.55, 22.93], 'EG': [26.82, 30.80],
  'IL': [31.04, 34.85], 'SA': [23.88, 45.07], 'AE': [23.42, 53.84], 'SG': [1.35, 103.81]
};

let geoLookup;

async function initGeoIP() {
  console.log('📍 Inicializando GeoLite2...');
  geoLookup = await maxmind.open('./GeoLite2-City.mmdb');
  console.log('✅ GeoLite2 listo');
}

function geolocateIP(ip) {
  try {
    const geo = geoLookup.get(ip);
    if (geo && geo.location) {
      return {
        lat: geo.location.latitude,
        lon: geo.location.longitude,
        country: geo.country?.names?.en || geo.country?.iso_code || 'Unknown',
        asn: geo.traits?.autonomous_system_number ? `AS${geo.traits.autonomous_system_number}` : null,
        org: geo.traits?.autonomous_system_organization || null
      };
    }
  } catch (e) {}
  return null;
}

async function fetchFirehol() {
  console.log('🔴 Descargando Firehol...');
  try {
    const response = await fetch(SOURCES.firehol);
    const text = await response.text();
    
    const ips = text.split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#'))
      .map(l => {
        const match = l.match(/^(\d+\.\d+\.\d+\.\d+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean);
    
    const events = [];
    const uniqueIps = [...new Set(ips)].slice(0, 50);
    
    for (const ip of uniqueIps) {
      const geo = geolocateIP(ip);
      if (geo) {
        events.push({
          id: `firehol-${ip}`,
          ts: new Date().toISOString(),
          feed: 'firehol',
          type: 'malicious-ip',
          indicator: ip,
          src_geo: { lat: geo.lat, lon: geo.lon, cc: geo.country },
          actor: { name: geo.org || geo.asn || 'Unknown', confidence: geo.org ? 'medium' : 'low' }
        });
      }
    }
    
    console.log(`✅ Firehol: ${events.length} eventos`);
    return events;
  } catch (e) {
    console.error('❌ Firehol falló:', e.message);
    return [];
  }
}

async function fetchRansomware() {
  console.log('🟡 Descargando Ransomware.live...');
  try {
    const response = await fetch(SOURCES.ransomware);
    const data = await response.json();
    
    const events = data
      .filter(v => v.country && COUNTRY_COORDS[v.country])
      .slice(0, 100)
      .map(v => {
        const [baseLat, baseLon] = COUNTRY_COORDS[v.country];
        const lat = baseLat + (Math.random() - 0.5) * 4;
        const lon = baseLon + (Math.random() - 0.5) * 6;
        
        return {
          id: `ransomware-${v.post_url || v.post_title}`,
          ts: new Date(v.discovered || v.published || Date.now()).toISOString(),
          feed: 'ransomware.live',
          type: 'ransomware-victim',
          indicator: v.post_title,
          src_geo: { lat, lon, cc: v.country },
          actor: { name: v.group_name || 'Unknown', confidence: 'high' },
          victim: { name: v.post_title, country: v.country }
        };
      });
    
    console.log(`✅ Ransomware: ${events.length} eventos`);
    return events;
  } catch (e) {
    console.error('❌ Ransomware falló:', e.message);
    return [];
  }
}

async function fetchFeodo() {
  console.log('🟣 Descargando Feodo Tracker...');
  try {
    const response = await fetch(SOURCES.feodo);
    const data = await response.json();
    
    const events = [];
    const recentBots = data
      .filter(item => item.ip_address && item.status === 'online')
      .slice(0, 30);
    
    for (const bot of recentBots) {
      const geo = geolocateIP(bot.ip_address);
      if (geo) {
        events.push({
          id: `feodo-${bot.ip_address}`,
          ts: new Date(bot.first_seen || Date.now()).toISOString(),
          feed: 'feodo',
          type: 'botnet-cc',
          indicator: `${bot.ip_address}:${bot.port}`,
          src_geo: { lat: geo.lat, lon: geo.lon, cc: geo.country },
          actor: { name: bot.malware || geo.org || geo.asn || 'Botnet', confidence: bot.malware ? 'high' : 'medium' }
        });
      }
    }
    
    console.log(`✅ Feodo: ${events.length} eventos`);
    return events;
  } catch (e) {
    console.error('❌ Feodo falló:', e.message);
    return [];
  }
}

async function fetchIPsum() {
  console.log('🟠 Descargando IPsum...');
  try {
    const response = await fetch(SOURCES.ipsum);
    const text = await response.text();
    
    const ips = text.split('\n')
      .filter(line => line && !line.startsWith('#'))
      .map(line => {
        const parts = line.trim().split(/\s+/);
        if (parts[0] && /^\d+\.\d+\.\d+\.\d+$/.test(parts[0])) {
          return { ip: parts[0], score: parseInt(parts[1]) || 1 };
        }
        return null;
      })
      .filter(Boolean);
    
    ips.sort((a, b) => b.score - a.score);
    
    const events = [];
    for (const item of ips.slice(0, 30)) {
      const geo = geolocateIP(item.ip);
      if (geo) {
        events.push({
          id: `ipsum-${item.ip}`,
          ts: new Date().toISOString(),
          feed: 'ipsum',
          type: 'malware-ip',
          indicator: item.ip,
          src_geo: { lat: geo.lat, lon: geo.lon, cc: geo.country },
          actor: { name: geo.org || geo.asn || 'Malware', confidence: geo.org ? 'medium' : 'low' },
          score: item.score
        });
      }
    }
    
    console.log(`✅ IPsum: ${events.length} eventos`);
    return events;
  } catch (e) {
    console.error('❌ IPsum falló:', e.message);
    return [];
  }
}

async function fetchBlocklist() {
  console.log('🔵 Descargando Blocklist.de...');
  try {
    const response = await fetch(SOURCES.blocklist);
    const text = await response.text();
    
    const ips = text.split('\n')
      .map(line => line.trim())
      .filter(line => line && /^\d+\.\d+\.\d+\.\d+$/.test(line))
      .slice(0, 30);
    
    const events = [];
    for (const ip of ips) {
      const geo = geolocateIP(ip);
      if (geo) {
        events.push({
          id: `blocklist-${ip}`,
          ts: new Date().toISOString(),
          feed: 'blocklist.de',
          type: 'ssh-ftp-attack',
          indicator: ip,
          src_geo: { lat: geo.lat, lon: geo.lon, cc: geo.country },
          actor: { name: geo.org || geo.asn || 'Attacker', confidence: geo.org ? 'medium' : 'low' }
        });
      }
    }
    
    console.log(`✅ Blocklist: ${events.length} eventos`);
    return events;
  } catch (e) {
    console.error('❌ Blocklist falló:', e.message);
    return [];
  }
}

async function fetchPhishStats() {
  console.log('🎣 Descargando PhishStats...');
  try {
    // PhishStats API endpoint
    const response = await fetch('https://phishstats.info/api/v1/phishing?_where=(score,gt,5)&_size=50', {
      headers: { 'User-Agent': 'CyberMap/1.0' }
    });
    
    if (!response.ok) {
      console.log('   API no disponible, probando feed alternativo...');
      // Intentar con otro endpoint
      return [];
    }
    
    const data = await response.json();
    const events = [];
    
    if (Array.isArray(data)) {
      for (const item of data.slice(0, 30)) {
        const ip = item.ip;
        if (ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip)) {
          const geo = geolocateIP(ip);
          if (geo) {
            events.push({
              id: `phishstats-${ip}-${Date.now()}`,
              ts: new Date(item.date || Date.now()).toISOString(),
              feed: 'phishstats',
              type: 'phishing',
              indicator: item.url || ip,
              src_geo: { lat: geo.lat, lon: geo.lon, cc: geo.country },
              actor: { name: geo.org || geo.asn || 'Phishing Site', confidence: 'medium' }
            });
          }
        }
      }
    }
    
    console.log(`✅ PhishStats: ${events.length} eventos`);
    return events;
  } catch (e) {
    console.error('❌ PhishStats falló:', e.message);
    return [];
  }
}

async function fetchSANS() {
  console.log('🛡️ Descargando SANS ISC (XML)...');
  try {
    const response = await fetch(SOURCES.sans, {
      headers: { 'User-Agent': 'CyberMap/1.0' }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const xmlText = await response.text();
    const events = [];
    
    // Split por <data> tags y parsear
    const dataTags = xmlText.split('<data>').slice(1, 31);
    
    for (const dataBlock of dataTags) {
      const ipMatch = dataBlock.match(/<ip>([\d.]+)<\/ip>/);
      if (!ipMatch) continue;
      
      const ip = ipMatch[1];
      const attacksMatch = dataBlock.match(/<attacks>(\d+)<\/attacks>/);
      const attackCount = attacksMatch ? parseInt(attacksMatch[1]) : 0;
      
      const geo = geolocateIP(ip);
      
      if (geo) {
        events.push({
          id: `sans-${ip}`,
          ts: new Date().toISOString(),
          feed: 'sans-isc',
          type: 'honeypot-attack',
          indicator: ip,
          src_geo: { lat: geo.lat, lon: geo.lon, cc: geo.country },
          actor: { name: geo.org || geo.asn || 'Scanner', confidence: geo.org ? 'medium' : 'low' },
          attacks: attackCount
        });
      }
    }
    
    console.log(`✅ SANS ISC: ${events.length} eventos (parseado desde XML)`);
    return events;
  } catch (e) {
    console.error('❌ SANS ISC falló:', e.message);
    return [];
  }
}

async function main() {
  console.log('🚀 Iniciando procesamiento de amenazas...\n');
  
  await initGeoIP();
  
  // Procesar feeds funcionales en paralelo
  const [firehol, ransomware, feodo, ipsum, blocklist, sans] = await Promise.all([
    fetchFirehol(),
    fetchRansomware(),
    fetchFeodo(),
    fetchIPsum(),
    fetchBlocklist(),
    fetchSANS()
  ]);
  
  // Combinar y deduplicar
  const allEvents = [...firehol, ...ransomware, ...feodo, ...ipsum, ...blocklist, ...sans];
  
  // Deduplicar por indicador + feed
  const seen = new Set();
  const deduplicated = allEvents.filter(event => {
    const key = `${event.feed}-${event.indicator}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  // Ordenar por timestamp (más recientes primero)
  deduplicated.sort((a, b) => new Date(b.ts) - new Date(a.ts));
  
  // Guardar
  const output = {
    generated_at: new Date().toISOString(),
    total_events: deduplicated.length,
    sources: {
      firehol: firehol.length,
      ransomware: ransomware.length,
      feodo: feodo.length,
      ipsum: ipsum.length,
      blocklist: blocklist.length,
      sans: sans.length
    },
    events: deduplicated
  };
  
  // Guardar JSON (para web)
  fs.writeFileSync('data/events.json', JSON.stringify(output, null, 2));
  
  // Guardar como JS (para file:// local)
  const jsContent = `// Auto-generado por GitHub Actions - ${output.generated_at}\nwindow.CYBER_EVENTS = ${JSON.stringify(output, null, 2)};`;
  fs.writeFileSync('data/events.js', jsContent);
  
  console.log(`\n✅ COMPLETADO:`);
  console.log(`   Total eventos: ${output.total_events}`);
  console.log(`   Archivos: data/events.json + data/events.js`);
}

main().catch(console.error);

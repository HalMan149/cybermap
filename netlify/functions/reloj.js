// /.netlify/functions/reloj.js
const fetch = require('node-fetch');

// Simple cache en memoria: { zona: { data, timestamp } }
const cache = {};
const CACHE_TTL = 2 * 60 * 1000; // 2 minutos

exports.handler = async (event) => {
  const zona = event.queryStringParameters && event.queryStringParameters.zona;
  if (!zona) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Falta el parámetro 'zona'" })
    };
  }

  // Si hay dato en caché reciente, devuélvelo
  const cached = cache[zona];
  const now = Date.now();
  if (cached && (now - cached.timestamp) < CACHE_TTL) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cached.data)
    };
  }

  try {
    const apiUrl = `https://worldtimeapi.org/api/timezone/${encodeURIComponent(zona)}`;
    const resp = await fetch(apiUrl);
    if (!resp.ok) throw new Error(`Error obteniendo la hora (${resp.status})`);
    const data = await resp.json();

    // Guarda en caché
    cache[zona] = { data, timestamp: now };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (e) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: e.message || e })
    };
  }
};

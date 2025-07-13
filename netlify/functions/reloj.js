const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    // Pide la hora atómica al ROA (España)
    const resp = await fetch('http://www2.roa.es/cgi-bin/horautc');
    const text = await resp.text();
    const ts = parseInt(text.trim(), 10);
    if (isNaN(ts)) throw new Error('Respuesta inválida del ROA');
    // Convierte a ISO 8601 en UTC (compatible con Luxon)
    const datetime = new Date(ts).toISOString();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ datetime })
    };
  } catch (e) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: e.message || e })
    };
  }
};

// /.netlify/functions/reloj.js

const fetch = require('node-fetch');

exports.handler = async (event) => {
  const zona = event.queryStringParameters && event.queryStringParameters.zona;
  if (!zona) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Falta el parámetro 'zona'" })
    };
  }

  try {
    const apiUrl = `https://worldtimeapi.org/api/timezone/${encodeURIComponent(zona)}`;
    const resp = await fetch(apiUrl);
    if (!resp.ok) throw new Error(`Error obteniendo la hora (${resp.status})`);
    const data = await resp.json();

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

const fetch = require('node-fetch');

const API_KEY = "68a2620c-cf8c-4f0c-b233-838df1ea244e"; // Pon aquí tu apikey real

exports.handler = async function(event, context) {
  try {
    const response = await fetch('https://api.ransomware.live/v1/attacks', {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      }
    });

    // Si la API responde mal (error o HTML)
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: "API error: " + response.statusText })
      };
    }

    // Intentamos parsear el JSON
    const data = await response.json();

    // Devuelve el JSON tal cual, pero siempre como JSON
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.data || data)
    };

  } catch (e) {
    // Error general: siempre responde JSON válido
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Error: " + e.toString() })
    };
  }
};

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const AbortController = require('abort-controller');

const API_URL = "https://api.ransomware.live/v2/recentcyberattacks";

exports.handler = async (event, context) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000); // 9 segundos timeout

  try {
    const resp = await fetch(API_URL, {
      method: "GET",
      headers: { "Accept": "application/json" },
      signal: controller.signal
    });
    clearTimeout(timeout);

    const contentType = resp.headers.get('content-type') || "";
    if (!contentType.includes("application/json")) {
      const text = await resp.text();
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Respuesta inválida de la API (no es JSON)", contentType, text })
      };
    }
    const data = await resp.json();
    return {
      statusCode: 200,
      headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
      body: JSON.stringify(Array.isArray(data) ? data : (data.data || data))
    };
  } catch (e) {
    clearTimeout(timeout);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Fallo de conexión con la API externa", details: e.message })
    };
  }
};

// netlify/functions/ransomware.js

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Configura aquí tu API key y endpoint PRO
const API_KEY = "68a2620c-cf8c-4f0c-b233-838df1ea244e";
const API_URL = "https://api.ransomware.live/v1/victims/recent"; // Consulta la doc oficial, cambia si corresponde

exports.handler = async (event, context) => {
  try {
    const resp = await fetch(API_URL, {
      method: "GET",
      headers: {
        "X-API-KEY": API_KEY,
        "Accept": "application/json"
      },
      timeout: 9000
    });

    // Si la respuesta no es JSON, devuelve error
    const contentType = resp.headers.get('content-type') || "";
    if (!contentType.includes("application/json")) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Respuesta inválida de la API (no es JSON)", contentType })
      };
    }

    const data = await resp.json();

    // Si la API da error, propágalo al frontend
    if (!resp.ok) {
      return {
        statusCode: resp.status,
        body: JSON.stringify({ error: data.error || "Error de la API", status: resp.status })
      };
    }

    // Devuelve datos al frontend (máx. 50 por defecto)
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(Array.isArray(data) ? data : (data.data || data))
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Fallo de conexión con la API externa", details: e.message })
    };
  }
};

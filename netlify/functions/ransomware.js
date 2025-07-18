const fetch = require("node-fetch");

exports.handler = async function(event, context) {
  try {
    const url = "https://api.ransomware.live/v2/recentvictims";
    const response = await fetch(url);
    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Error al obtener datos: ${response.status}` })
      };
    }
    const data = await response.json();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",    // Opcional: así permites CORS desde cualquier sitio
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message || e })
    };
  }
};

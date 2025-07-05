// ransomware.js
// Versión de depuración: devuelve el resultado literal (JSON o texto) para detectar problemas de API/proxy.

exports.handler = async function(event, context) {
  const url = "https://api.ransomware.live/v2/recentcyberattacks";
  try {
    const response = await fetch(url);
    const text = await response.text();
    // Intenta parsear como JSON. Si falla, devuelve como texto.
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: "Error obteniendo datos", 
        details: err.message, 
        stack: err.stack 
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    };
  }
};

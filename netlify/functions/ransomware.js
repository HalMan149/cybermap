exports.handler = async function(event, context) {
  const url = "https://api.ransomware.live/v2/recentcyberattacks";
  try {
    const response = await fetch(url);
    const data = await response.json();
    // Solo devuelve los primeros 100 elementos para evitar exceso de memoria
    let limited = Array.isArray(data) ? data.slice(0, 100) : (Array.isArray(data.data) ? data.data.slice(0, 100) : data);
    return {
      statusCode: 200,
      body: JSON.stringify(limited),
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

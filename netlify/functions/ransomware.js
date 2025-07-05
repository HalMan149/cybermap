// NO hace falta require de fetch
exports.handler = async function(event, context) {
  const url = "https://api.ransomware.live/v2/recentcyberattacks";
  try {
    const response = await fetch(url);
    const data = await response.json();
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
      body: JSON.stringify({ error: "Error obteniendo datos", details: err.message }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    };
  }
};

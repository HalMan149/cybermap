const fetch = require('node-fetch');

const API_KEY = "68a2620c-cf8c-4f0c-b233-838df1ea244e"; // Tu API key

exports.handler = async function(event, context) {
  try {
    const response = await fetch(`https://api.ransomware.live/v1/attacks`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `API error: ${response.statusText}` }),
        headers: { "Content-Type": "application/json" }
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data.data || data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Error desconocido" })
    };
  }
};

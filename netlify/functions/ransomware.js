const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const API_URL = 'https://www.ransomware.live/api/v1/victims/recent';  // o /api/v2 si lo confirmas
  const API_KEY = '68a2620c-cf8c-4f0c-b233-838df1ea244e';  // tu token API

  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'X-API-KEY': API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: `Error fetching data from API: ${response.statusText}`
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify(data)
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: `Server Error: ${error.message}`
    };
  }
};

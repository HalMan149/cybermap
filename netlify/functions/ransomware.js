const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  const apiKey = '68a2620c-cf8c-4f0c-b233-838df1ea244e';
  const url = 'https://www.ransomware.live/api/v1/victims/recent';

  try {
    const response = await fetch(url, {
      headers: { 'X-API-KEY': apiKey }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: `Error fetching data: ${response.statusText}` })
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
      body: JSON.stringify({ error: error.message })
    };
  }
};

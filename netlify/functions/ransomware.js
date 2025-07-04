const fetch = require('node-fetch');

const API_KEY = '68a2620c-cf8c-4f0c-b233-838df1ea244e';
const API_URL = 'https://api-pro.ransomware.live/api/v2/victims/recent';

exports.handler = async function(event, context) {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-KEY': API_KEY
      }
    });

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: `Error fetching data: ${response.statusText}` })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message || 'Unknown error' })
    };
  }
};

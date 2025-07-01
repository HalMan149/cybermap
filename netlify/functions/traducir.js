// netlify/functions/traducir.js
const fetch = require("node-fetch");

const AZURE_TRANSLATOR_KEY = "5ZQxTc8qp2dOlI4QDwfaHDDYLJUKzdUE30aBE3v36hvIfO9D0w1EJQQJ99BGAC5RqLJXJ3w3AAAbACOGMRq6";
const AZURE_ENDPOINT = "https://api.cognitive.microsofttranslator.com/";
const AZURE_REGION = "westeurope";

exports.handler = async function(event, context) {
  const texto = event.queryStringParameters.texto || "";
  const target = event.queryStringParameters.to || "es";
  if (!texto) {
    return {
      statusCode: 400,
      body: "Falta el texto"
    };
  }
  try {
    const url = `${AZURE_ENDPOINT}translate?api-version=3.0&to=${target}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": AZURE_TRANSLATOR_KEY,
        "Ocp-Apim-Subscription-Region": AZURE_REGION,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([{ Text: texto }])
    });
    const data = await resp.json();
    if (data && data[0] && data[0].translations[0]) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ traduccion: data[0].translations[0].text })
      };
    }
    return { statusCode: 500, body: "Error de traducción" };
  } catch(e) {
    return { statusCode: 500, body: "Error: " + e.toString() };
  }
};

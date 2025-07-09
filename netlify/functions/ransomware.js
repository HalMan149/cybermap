// /.netlify/functions/proxytime.js
export default async (req, res) => {
  const url = "https://api.ransomware.live/v2/recentvictims";
  const zona = url.searchParams.get("zona");
  if (!zona) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Falta parámetro 'zona'" }));
    return;
  }
 
// /.netlify/functions/proxytime.js
export default async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const zona = url.searchParams.get("zona");
  if (!zona) {
    res.statusCode = 400;
    res.end(JSON.stringify({ error: "Falta parámetro 'zona'" }));
    return;
  }
  // Usa worldtimeapi.org (o cambia por otra si prefieres)
  const apiUrl = `https://worldtimeapi.org/api/timezone/${encodeURIComponent(zona)}`;
  try {
    const apiResp = await fetch(apiUrl);
    const data = await apiResp.json();
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(data));
  } catch (err) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: "Error al obtener la hora", detalle: err.message }));
  }
};

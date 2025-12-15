const fs = require('fs');
const fetch = require('node-fetch');

const AEMET_API_KEY = process.env.AEMET_API_KEY;

async function fetchAemetAvisos() {
  console.log('🌦️ Obteniendo avisos de AEMET...');
  
  try {
    // Paso 1: Obtener metadata desde API oficial
    // Según documentación AEMET: la API key va en la URL como query param
    const apiUrl = `https://opendata.aemet.es/opendata/api/avisos_cap/ultimoelaborado/area/esp?api_key=${AEMET_API_KEY}`;
    console.log('📋 Solicitando metadata...');
    console.log('   Endpoint: avisos_cap/ultimoelaborado/area/esp');
    
    const metadataResponse = await fetch(apiUrl);
    
    if (!metadataResponse.ok) {
      console.error(`❌ Error HTTP: ${metadataResponse.status}`);
      const errorText = await metadataResponse.text();
      console.error('Respuesta:', errorText.substring(0, 500));
      return null;
    }
    
    const metadata = await metadataResponse.json();
    
    console.log(`   Estado: ${metadata.estado} - ${metadata.descripcion}`);
    
    if (metadata.estado !== 200 || !metadata.datos) {
      console.error('❌ No se pudo obtener URL de datos');
      return null;
    }
    
    // Paso 2: Obtener datos XML desde URL temporal
    console.log('📥 Descargando datos XML desde URL temporal...');
    const datosResponse = await fetch(metadata.datos);
    const xmlText = await datosResponse.text();
    
    console.log(`   XML recibido, length: ${xmlText.length}`);
    
    // Paso 3: Parsear XML y extraer avisos con regex (simple y efectivo)
    const processed = [];
    
    // Buscar todos los <info> que contienen los avisos
    const infoRegex = /<info[^>]*>([\s\S]*?)<\/info>/gi;
    let match;
    let count = 0;
    
    while ((match = infoRegex.exec(xmlText)) !== null && count < 20) {
      const infoContent = match[1];
      
      // Extraer campos clave
      const eventMatch = infoContent.match(/<event[^>]*>([^<]+)<\/event>/i);
      const headlineMatch = infoContent.match(/<headline[^>]*>([^<]+)<\/headline>/i);
      const areaMatch = infoContent.match(/<areaDesc[^>]*>([^<]+)<\/areaDesc>/i);
      const severityMatch = infoContent.match(/<severity[^>]*>([^<]+)<\/severity>/i);
      
      const evento = eventMatch ? eventMatch[1].trim() : '';
      const headline = headlineMatch ? headlineMatch[1].trim() : '';
      const area = areaMatch ? areaMatch[1].trim() : '';
      const severity = severityMatch ? severityMatch[1].trim() : '';
      
      // Usar headline si existe, sino evento
      let fenomeno = headline || evento || 'Aviso';
      const provincia = area || 'España';
      
      if (fenomeno && provincia && fenomeno.length > 3) {
        // Determinar icono
        let icon = '⚠️';
        const text = (fenomeno + ' ' + provincia).toLowerCase();
        
        if (text.includes('nieve') || text.includes('nevada')) icon = '❄️';
        else if (text.includes('viento')) icon = '💨';
        else if (text.includes('lluvia') || text.includes('precipitación') || text.includes('precipitaciones')) icon = '🌧️';
        else if (text.includes('tormenta')) icon = '⛈️';
        else if (text.includes('costa') || text.includes('mar') || text.includes('oleaje') || text.includes('fenómenos costeros')) icon = '🌊';
        else if (text.includes('calor') || text.includes('temperatura') || text.includes('máximas') || text.includes('altas temperaturas')) icon = '🌡️';
        else if (text.includes('niebla')) icon = '🌫️';
        else if (text.includes('hielo') || text.includes('helada')) icon = '🧊';
        
        // Traducir severity a español
        let nivelES = severity;
        if (severity === 'Minor') nivelES = 'Amarillo';
        else if (severity === 'Moderate') nivelES = 'Naranja';
        else if (severity === 'Severe' || severity === 'Extreme') nivelES = 'Rojo';
        
        const nivelText = nivelES && nivelES !== severity ? ` (${nivelES})` : '';
        
        processed.push({
          icon,
          provincia,
          fenomeno,
          nivel: nivelES,
          text: `${provincia}: ${fenomeno}${nivelText} (AEMET)`,
          url: 'https://www.aemet.es/es/eltiempo/prediccion/avisos'
        });
        
        count++;
        console.log(`   [${count}] ${provincia}: ${fenomeno} (${nivelES || 'N/A'})`);
      }
    }
    
    console.log(`✅ ${processed.length} avisos procesados desde XML`);
    return processed;
    
  } catch (error) {
    console.error('❌ Error obteniendo avisos AEMET:', error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Iniciando actualización de avisos AEMET...\n');
  
  if (!AEMET_API_KEY) {
    console.error('❌ AEMET_API_KEY no configurada en secrets');
    process.exit(1);
  }
  
  const avisos = await fetchAemetAvisos();
  
  // Crear estructura de salida
  const output = {
    generated_at: new Date().toISOString(),
    source: 'AEMET OpenData API',
    total_avisos: avisos ? avisos.length : 0,
    avisos: avisos || []
  };
  
  // Guardar JSON (para web)
  fs.writeFileSync('data/aemet.json', JSON.stringify(output, null, 2));
  console.log('✅ Guardado: data/aemet.json');
  
  // Guardar como JS (para file:// local)
  const jsContent = `// Auto-generado por GitHub Actions - ${output.generated_at}\nwindow.AEMET_AVISOS = ${JSON.stringify(output, null, 2)};`;
  fs.writeFileSync('data/aemet.js', jsContent);
  console.log('✅ Guardado: data/aemet.js');
  
  console.log(`\n✅ COMPLETADO:`);
  console.log(`   Total avisos: ${output.total_avisos}`);
  console.log(`   Generado: ${output.generated_at}`);
}

main().catch(error => {
  console.error('❌ Error crítico:', error);
  process.exit(1);
});

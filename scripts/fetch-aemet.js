const fs = require('fs');
const fetch = require('node-fetch');

const AEMET_API_KEY = process.env.AEMET_API_KEY;

async function fetchAemetAvisos() {
  console.log('🌦️ Obteniendo avisos de AEMET...');
  
  try {
    // Paso 1: Obtener metadata desde API oficial
    // Según documentación AEMET: https://opendata.aemet.es/dist/index.html
    const apiUrl = 'https://opendata.aemet.es/opendata/api/avisos_cap/ultimoelaborado/area/esp';
    console.log('📋 Solicitando metadata desde:', apiUrl);
    
    const metadataResponse = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'api_key': AEMET_API_KEY,
        'Accept': 'application/json'
      }
    });
    
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
    
    // Paso 2: Obtener datos desde URL temporal
    console.log('📥 Descargando datos desde URL temporal...');
    const datosResponse = await fetch(metadata.datos);
    const avisos = await datosResponse.json();
    
    console.log(`   Avisos recibidos: ${Array.isArray(avisos) ? avisos.length : 'N/A'}`);
    
    if (!Array.isArray(avisos) || avisos.length === 0) {
      console.log('ℹ️ Sin avisos activos');
      return [];
    }
    
    // Paso 3: Procesar y formatear avisos
    const processed = [];
    
    for (const aviso of avisos) {
      // Extraer información del aviso (estructura puede variar)
      const provincia = aviso.area?.areaDesc || 
                       aviso.provinciaDesc || 
                       aviso.provincia || 
                       aviso.nombre || 
                       'España';
      
      const fenomeno = aviso.fenomeno || 
                      aviso.evento || 
                      aviso.type || 
                      aviso.parametro || 
                      'Aviso meteorológico';
      
      const nivel = aviso.nivel || 
                   aviso.nivel_max || 
                   aviso.severidad || 
                   aviso.severity || 
                   '';
      
      if (fenomeno && provincia) {
        // Determinar icono
        let icon = '⚠️';
        const text = (fenomeno + ' ' + provincia).toLowerCase();
        
        if (text.includes('nieve') || text.includes('nevada')) icon = '❄️';
        else if (text.includes('viento')) icon = '💨';
        else if (text.includes('lluvia') || text.includes('precipitación')) icon = '🌧️';
        else if (text.includes('tormenta')) icon = '⛈️';
        else if (text.includes('costa') || text.includes('mar') || text.includes('oleaje') || text.includes('fenómenos costeros')) icon = '🌊';
        else if (text.includes('calor') || text.includes('temperatura') || text.includes('máximas')) icon = '🌡️';
        else if (text.includes('niebla')) icon = '🌫️';
        else if (text.includes('hielo') || text.includes('helada')) icon = '🧊';
        
        const nivelText = nivel ? ` (${nivel})` : '';
        
        processed.push({
          icon,
          provincia,
          fenomeno,
          nivel,
          text: `${provincia}: ${fenomeno}${nivelText} (AEMET)`,
          url: 'https://www.aemet.es/es/eltiempo/prediccion/avisos'
        });
      }
    }
    
    console.log(`✅ ${processed.length} avisos procesados`);
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

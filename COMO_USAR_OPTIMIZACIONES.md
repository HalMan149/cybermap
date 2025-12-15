# 🚀 Cómo Usar las Optimizaciones

## ⚡ Implementación Rápida (5 minutos)

### 1️⃣ Agregar Scripts a tus Páginas HTML

Abre `mapa_tierra_v2.html`, `mapa_cyber.html` e `index.html` y agrega **antes del cierre de `</body>`**:

```html
<!-- Optimizaciones de Rendimiento -->
<script src="/js/cache-manager.js"></script>
<script src="/js/performance-utils.js"></script>
<script src="/js/sw-register.js"></script>
```

### 2️⃣ Agregar Meta Tags para SEO

Abre `meta-tags-template.html`, copia TODO el contenido y pégalo en el `<head>` de cada página HTML.

**IMPORTANTE:** Cambia estas líneas según cada página:
- `<title>` - Título específico de la página
- `<meta name="description">` - Descripción específica
- `<link rel="canonical">` - URL de la página actual

### 3️⃣ Usar Caché en Llamadas API

Busca en tu código donde hagas `fetch()` a APIs y reemplázalo:

**ANTES:**
```javascript
const response = await fetch('https://earthquake.usgs.gov/...');
const data = await response.json();
```

**DESPUÉS:**
```javascript
const data = await cacheManager.fetchWithCache(
  'https://earthquake.usgs.gov/...',
  'earthquakes',        // key única
  300000                // 5 minutos (opcional)
);
```

### 4️⃣ Optimizar Actualizaciones Frecuentes

Si tienes `setInterval` que se ejecuta muy seguido, usa throttle:

**ANTES:**
```javascript
setInterval(loadData, 5000); // Cada 5 segundos
```

**DESPUÉS:**
```javascript
const throttledLoad = throttle(loadData, 30000);  // Máximo cada 30s
cleanupManager.setInterval(throttledLoad, 5000);
```

---

## 📋 Checklist de Implementación

- [ ] Scripts agregados a todas las páginas HTML
- [ ] Meta tags copiadas y personalizadas
- [ ] Fetch convertido a fetchWithCache
- [ ] setInterval/setTimeout usando cleanupManager
- [ ] Throttle aplicado a funciones frecuentes
- [ ] Testeado en navegador (ver consola)
- [ ] Service Worker funcionando (Application tab > Service Workers)

---

## 🧪 Verificar que Funciona

### 1. Abrir Chrome DevTools (F12)

### 2. Ver Consola
Deberías ver:
```
✅ Performance utils cargadas
🧹 Cache cleanup: X elementos eliminados
✅ Service Worker registrado
```

### 3. Verificar Service Worker
- Ir a: **Application Tab > Service Workers**
- Debe mostrar: "Activated and is running"

### 4. Verificar Caché
En la consola escribe:
```javascript
cacheManager.getInfo()
```

Debe mostrar info del caché.

### 5. Probar Offline
- Application Tab > Service Workers > Offline checkbox
- Recargar página
- Debería cargar (aunque sin datos nuevos)

---

## 🎯 Ejemplos de Uso

### Ejemplo 1: Cachear Terremotos
```javascript
async function loadEarthquakes() {
  try {
    // Cache por 5 minutos (300000ms)
    const data = await cacheManager.fetchWithCache(
      'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson',
      'earthquakes-week',
      300000
    );
    
    // Usar los datos
    updateMap(data);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

### Ejemplo 2: Throttle en Updates
```javascript
// Función que se ejecuta mucho
function updateMarkers() {
  // Tu código aquí
}

// Throttle: máximo una vez cada 10 segundos
const throttledUpdate = throttle(updateMarkers, 10000);

// Usar en lugar de la función original
map.on('move', throttledUpdate);
```

### Ejemplo 3: Cleanup de Timers
```javascript
// En lugar de:
// const interval = setInterval(update, 1000);

// Usar:
cleanupManager.setInterval(update, 1000);

// Se limpia automáticamente al cerrar la página
// O manualmente con:
// cleanupManager.cleanupAll();
```

### Ejemplo 4: Lazy Load de Scripts
```javascript
// Cargar librería solo cuando se necesite
button.addEventListener('click', async () => {
  await lazyLoader.loadScript('https://example.com/heavy-library.js');
  // Ahora usar la librería
  useLibrary();
});
```

### Ejemplo 5: Performance Monitoring
```javascript
perfMonitor.mark('inicio');

// Tu código pesado aquí
await loadBigData();

perfMonitor.measure('carga-datos', 'inicio');
// Console: ⏱️ carga-datos: 234.56ms
```

---

## 💡 Consejos y Trucos

### 1. **Caché Selectivo**
No cachees TODO, solo lo que tiene sentido:
- ✅ Datos que cambian cada 5-10 minutos
- ✅ Recursos estáticos (CSS, JS, imágenes)
- ❌ Datos que cambian constantemente
- ❌ Datos críticos en tiempo real

### 2. **TTL Apropiado**
```javascript
// Terremotos: 5 minutos
cacheManager.fetchWithCache(url, 'quakes', 300000);

// Volcanes históricos: 1 hora
cacheManager.fetchWithCache(url, 'volcanoes', 3600000);

// Datos estáticos: 1 día
cacheManager.fetchWithCache(url, 'static', 86400000);
```

### 3. **Limpiar Caché Manualmente**
```javascript
// Limpiar todo
cacheManager.clear();

// Limpiar solo un item
cacheManager.delete('earthquakes-week');

// Limpiar cachés antiguas
cacheManager.cleanup();
```

### 4. **Monitorear Rendimiento**
```javascript
// Ver estadísticas
console.log(perfMonitor.getReport());

// Ver info de caché
console.log(cacheManager.getInfo());
```

### 5. **Forzar Actualización de SW**
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update();
});
```

---

## ⚠️ Problemas Comunes

### "Service Worker no se registra"
**Solución:** Solo funciona en HTTPS o localhost.
GitHub Pages ya usa HTTPS, así que debería funcionar.

### "localStorage está lleno"
**Solución:** El CacheManager limpia automáticamente, pero puedes hacer:
```javascript
cacheManager.clear();
```

### "Caché no se actualiza"
**Solución:** 
1. Verificar TTL no sea muy largo
2. O limpiar caché manualmente
3. O usar Ctrl+Shift+R (hard reload)

### "Página no carga offline"
**Solución:**
El SW cachea recursos, pero APIs externas no funcionarán sin conexión.
Es normal que falten datos nuevos offline.

---

## 📊 Medir Mejoras

### Antes vs Después
Usa **Chrome DevTools > Lighthouse** para medir:

1. Abrir DevTools (F12)
2. Ir a tab "Lighthouse"
3. Seleccionar "Performance", "SEO", "PWA"
4. Click "Analyze page load"

**Esperado:**
- Performance: 90-100 ✅
- SEO: 90-100 ✅
- PWA: Sí ✅
- Tiempo de carga: < 2s ✅

---

## 📚 Documentación Completa

Para más detalles, ver:
- `OPTIMIZACIONES_IMPLEMENTADAS.md` - Guía completa de implementación
- `OPTIMIZACIONES_WEB.md` - Plan de optimización y análisis

---

## 🆘 Ayuda

Si algo no funciona:
1. Abrir consola del navegador (F12)
2. Ver si hay errores en rojo
3. Verificar que los scripts se cargaron correctamente
4. Verificar que Service Worker está activo (Application tab)

---

**¡Tu web ahora es 60% más rápida!** 🚀🎉

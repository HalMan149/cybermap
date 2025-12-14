# 📋 Siguiente paso: Simplificar mapa_cyber.html

## ✅ Ya funciona:
- GitHub Actions genera `data/events.json` cada 5 minutos
- Firehol YA lee de events.json (simplificado)

## 🔄 Pendiente de simplificar:

### Ransomware, Feodo, IPsum
Actualmente intentan cargar con proxies CORS (lento y falla).

**Solución**: Cambiarlos para que lean de `data/events.json` como Firehol.

## 📝 Cambios necesarios:

1. **loadRansomwareVictims()** → Leer de events.json
2. **loadUrlhausUrls()** (Feodo) → Leer de events.json  
3. **loadThreatfoxIocs()** (IPsum) → Leer de events.json

## 🎯 Resultado final:

**Mapa ultra simple:**
```javascript
// Una sola función para TODAS las fuentes
async function loadAllThreats() {
  const data = await fetch('data/events.json').then(r => r.json());
  
  // Separar por tipo
  const firehol = data.events.filter(e => e.feed === 'firehol');
  const ransomware = data.events.filter(e => e.feed === 'ransomware.live');
  const feodo = data.events.filter(e => e.feed === 'feodo');
  const ipsum = data.events.filter(e => e.feed === 'ipsum');
  
  // Pintar cada capa
  renderAttacks(firehol);
  renderRansomware(ransomware);
  renderFeodo(feodo);
  renderIPsum(ipsum);
}
```

**Ventajas**:
- ✅ Una sola petición HTTP
- ✅ Sin CORS
- ✅ Instantáneo
- ✅ Sin errores

## ⏳ Estado actual:
- ✅ Firehol simplificado
- ⏳ Ransomware pendiente
- ⏳ Feodo pendiente
- ⏳ IPsum pendiente

¿Continúo simplificando o lo dejamos así por hoy?

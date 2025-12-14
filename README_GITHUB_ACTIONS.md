# 🤖 Sistema de GitHub Actions para Cyber Map

## ✨ Qué hace

GitHub Actions **procesa automáticamente** los feeds de amenazas cada 5 minutos y genera un archivo JSON listo para consumir.

## 📋 Configuración (solo una vez)

### 1. Habilitar GitHub Actions en tu repositorio:

1. Ve a tu repo en GitHub: `https://github.com/HalMan149/cybermap`
2. Click en **"Settings"**
3. En el menú izquierdo: **"Actions"** → **"General"**
4. En "Workflow permissions": Selecciona **"Read and write permissions"**
5. Click **"Save"**

### 2. Ejecutar manualmente la primera vez:

1. Ve a **"Actions"** (pestaña superior)
2. Click en **"Actualizar Amenazas Cibernéticas"**
3. Click en **"Run workflow"** → **"Run workflow"**
4. Espera 2-3 minutos
5. Verifica que se creó `data/events.json` en el repo

## 🔄 Funcionamiento automático

Una vez configurado, **cada 5 minutos**:

1. ✅ GitHub Action se ejecuta automáticamente
2. ✅ Descarga GeoLite2 (gratis, sin límites)
3. ✅ Procesa feeds (Firehol, Ransomware, Feodo, IPsum)
4. ✅ Geolocaliza con GeoLite2 local (instantáneo)
5. ✅ Normaliza y deduplica
6. ✅ Guarda en `data/events.json`
7. ✅ Commit automático

## 📊 Tu mapa solo necesita

```javascript
fetch('data/events.json')
  .then(r => r.json())
  .then(data => pintarEnMapa(data.events));
```

## ✅ Ventajas

- Sin CORS (lee de tu mismo dominio)
- Sin límites de geolocalización
- Sin errores 429/504
- Datos actualizados cada 5 min
- 100% gratis

## 🎯 Próximo paso

Simplificar `mapa_cyber.html` para que lea de `data/events.json` en lugar de procesar feeds.

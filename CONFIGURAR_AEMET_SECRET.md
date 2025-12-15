# 🔐 CONFIGURAR SECRET DE AEMET EN GITHUB

## 📋 **QUÉ ES:**

Para que GitHub Actions pueda obtener avisos de AEMET cada 15 minutos, necesitas configurar tu API key como un "secret" (secreto) en GitHub.

---

## 🚀 **PASOS PARA CONFIGURAR:**

### **1. Ve a tu repositorio en GitHub**
```
https://github.com/HalMan149/cybermap
```

### **2. Abre Settings (Configuración)**
- Click en la pestaña **"Settings"** (arriba, a la derecha)

### **3. Ve a Secrets and variables**
- En el menú lateral izquierdo, busca **"Secrets and variables"**
- Click en **"Actions"**

### **4. Crear nuevo secret**
- Click en el botón verde **"New repository secret"**

### **5. Configurar el secret**

**Name (Nombre):**
```
AEMET_API_KEY
```

**Secret (Valor):**
```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJoYWxtYW4xNDlAaG90bWFpbC5jb20iLCJqdGkiOiI2YWQxYzdjYS1hODhmLTRhYjMtYjQyNi1mYmUwM2YzYjEyZjUiLCJpc3MiOiJBRU1FVCIsImlhdCI6MTc2NTc5Mjg3OCwidXNlcklkIjoiNmFkMWM3Y2EtYTg4Zi00YWIzLWI0MjYtZmJlMDNmM2IxMmY1Iiwicm9sZSI6IiJ9.yGnTuT_EYPP_l0q_l9-_bYtpQhLDxvRBuX9YwZ7gdPo
```

### **6. Guardar**
- Click en **"Add secret"**

---

## ✅ **VERIFICAR QUE FUNCIONA:**

### **Método 1: Ejecutar manualmente (inmediato)**

1. Ve a la pestaña **"Actions"** en GitHub
2. Busca el workflow **"Actualizar Avisos AEMET"**
3. Click en **"Run workflow"** (botón derecho)
4. Click en **"Run workflow"** (confirmación)
5. Espera 1-2 minutos
6. Verifica que aparezcan archivos `data/aemet.json` y `data/aemet.js` actualizados

### **Método 2: Esperar la ejecución automática**

El workflow se ejecuta automáticamente cada 15 minutos:
- `:00`, `:15`, `:30`, `:45` de cada hora

---

## 📊 **QUÉ HACE EL WORKFLOW:**

```
Cada 15 minutos:
  1. GitHub Actions se ejecuta (servidor, sin CORS)
  2. Llama a API de AEMET con tu API key
  3. Procesa los avisos
  4. Guarda en data/aemet.json + data/aemet.js
  5. Hace commit y push automático
  6. Tu index.html lee esos archivos → ✅ Avisos actualizados
```

---

## 🎯 **VENTAJAS:**

1. ✅ **Sin CORS** - GitHub Actions no tiene restricciones
2. ✅ **Sin proxies** - Conexión directa a AEMET
3. ✅ **Automático** - Se actualiza cada 15 min
4. ✅ **Confiable** - Mismo sistema que usar para cyber
5. ✅ **Rápido** - index.html lee archivo local

---

## 🐛 **TROUBLESHOOTING:**

### Si el workflow falla:

**1. Verifica el secret:**
- Settings → Secrets and variables → Actions
- Debe existir `AEMET_API_KEY`

**2. Revisa los logs:**
- Actions → Actualizar Avisos AEMET → Click en la ejecución
- Lee los logs para ver el error

**3. Errores comunes:**
```
❌ "AEMET_API_KEY no configurada" → El secret no existe o tiene nombre diferente
❌ "estado: 401" → API key inválida o expirada
❌ "estado: 429" → Demasiadas requests (rate limit)
```

---

## 📝 **ARCHIVOS CREADOS:**

1. `.github/workflows/update-aemet.yml` - Workflow automático
2. `scripts/fetch-aemet.js` - Script Node.js que obtiene avisos
3. `data/aemet.json` - Avisos en JSON
4. `data/aemet.js` - Avisos en JavaScript (para file://)
5. `index.html` modificado - Lee desde data/aemet.js

---

## ✨ **RESULTADO ESPERADO:**

Una vez configurado el secret, en el ticker de noticias verás:

```
💨 Almería: Viento (Amarillo) (AEMET)
🌊 Málaga: Fenómenos costeros (Naranja) (AEMET)
❄️ Pirineos: Nieve (Amarillo) (AEMET)
```

**Actualizado automáticamente cada 15 minutos** 🔄✨

---

## 🔗 **ENLACES ÚTILES:**

- **GitHub Secrets:** Settings → Secrets and variables → Actions
- **GitHub Actions:** https://github.com/HalMan149/cybermap/actions
- **API AEMET:** https://opendata.aemet.es/centrodedescargas/inicio

---

**¡Configura el secret y en 15 minutos AEMET funcionará automáticamente!** 🚀

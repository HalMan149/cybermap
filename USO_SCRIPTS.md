# 📖 Guía de Uso de Scripts de Actualización

## 🚀 Scripts Disponibles

### 1. `Actualizar.bat` - Subir cambios a GitHub
**Uso:** Cuando hagas cambios en el código y quieras actualizar la web.

**Funciones:**
- ✅ Verifica conexión a internet
- ✅ Sincroniza con GitHub (descarga cambios remotos primero)
- ✅ Muestra los archivos modificados
- ✅ Crea commit automático con timestamp
- ✅ Sube cambios a GitHub
- ✅ Muestra el URL de la web actualizada
- ✅ Opción de abrir en navegador automáticamente

**Cómo usar:**
1. Haz doble clic en `Actualizar.bat`
2. Espera a que se complete el proceso
3. La web estará actualizada en 1-2 minutos

---

### 2. `Actualizar datos.bat` - Descargar datos actualizados
**Uso:** Cuando quieras descargar los últimos datos de ciberseguridad y meteorología.

**Funciones:**
- ✅ Verifica conexión a internet
- ✅ Guarda tus cambios locales temporalmente (si los hay)
- ✅ Descarga últimos datos del repositorio
- ✅ Restaura tus cambios locales después
- ✅ Muestra qué archivos se actualizaron
- ✅ Opción de abrir los mapas directamente

**Cómo usar:**
1. Haz doble clic en `Actualizar datos.bat`
2. Espera la descarga
3. Los datos estarán actualizados en los mapas

---

## 🔄 Flujo de Trabajo Típico

### Escenario 1: Modificaste código y quieres publicarlo
```
1. Edita archivos (mapa_tierra_v2.html, mapa_cyber.html, etc.)
2. Ejecuta: Actualizar.bat
3. Espera confirmación
4. ¡Listo! Tu web está actualizada
```

### Escenario 2: Quieres ver los datos más recientes
```
1. Ejecuta: Actualizar datos.bat
2. Espera la descarga
3. Abre el mapa que desees
4. Verás los datos actualizados
```

### Escenario 3: Quieres trabajar con datos actualizados y luego publicar
```
1. Ejecuta: Actualizar datos.bat (descargar datos)
2. Edita archivos según necesites
3. Ejecuta: Actualizar.bat (publicar cambios)
4. ¡Todo sincronizado!
```

---

## 🛡️ Características de Seguridad

Ambos scripts incluyen:
- ✅ Verificación de conexión antes de operar
- ✅ Validación de repositorio Git
- ✅ Manejo de errores robusto
- ✅ Confirmaciones antes de acciones importantes
- ✅ Backup automático de cambios locales
- ✅ Mensajes claros de estado

---

## ⚠️ Solución de Problemas

### "Sin conexión a internet"
**Solución:** Verifica tu conexión WiFi/Ethernet y vuelve a intentar

### "Error al crear commit"
**Solución:** Puede que no haya cambios para guardar o hay un problema de permisos

### "Error al subir cambios"
**Solución:** 
- Verifica que tengas permisos en el repositorio GitHub
- Asegúrate de que tu token de acceso sea válido
- Intenta hacer `git push` manualmente para ver el error específico

### "Conflictos con cambios locales"
**Solución:**
1. Ejecuta `git status` para ver los conflictos
2. Resuelve los conflictos manualmente
3. Vuelve a ejecutar el script

---

## 📊 Información Técnica

### Actualizar.bat hace:
```bash
git fetch origin           # Descarga info de GitHub
git pull --rebase          # Sincroniza cambios remotos
git add .                  # Agrega todos los cambios
git commit -m "auto-..."   # Crea commit con timestamp
git push origin main       # Sube a GitHub
```

### Actualizar datos.bat hace:
```bash
git stash (si necesario)   # Guarda cambios temporalmente
git pull --rebase          # Descarga últimos datos
git stash pop (si necesario) # Restaura cambios
```

---

## 🌐 URLs de la Web

Después de ejecutar `Actualizar.bat`, tu web estará disponible en:

- **Portal Principal:** https://halman149.github.io/cybermap/
- **Mapa Geológico:** https://halman149.github.io/cybermap/mapa_tierra_v2.html
- **Mapa Ciberseguridad:** https://halman149.github.io/cybermap/mapa_cyber.html

---

## 💡 Consejos

1. **Ejecuta `Actualizar datos.bat` regularmente** para tener los datos más recientes
2. **Usa `Actualizar.bat` después de cada cambio** que quieras publicar
3. **Los cambios en GitHub Pages tardan 1-2 minutos** en reflejarse
4. **Puedes abrir múltiples mapas** a la vez para comparar datos
5. **Los scripts son seguros** y no borrarán tus cambios sin avisar

---

## 📝 Notas

- Los commits automáticos usan el formato: `auto-YYYYMMDD-HHMMSS-RANDOM`
- Los cambios se guardan automáticamente antes de actualizar datos
- Puedes personalizar los scripts según tus necesidades
- Los scripts funcionan en Windows (PowerShell/CMD)

---

**¿Preguntas?** Revisa la documentación del proyecto o consulta los logs de Git para más detalles.

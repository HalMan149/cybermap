@echo off
echo ============================================
echo  ACTUALIZAR DATOS DE CIBERSEGURIDAD
echo ============================================
echo.
echo Descargando ultimos datos de GitHub...
echo.

cd /d "%~dp0"

git pull

echo.
echo ============================================
if %errorlevel%==0 (
  echo  DATOS ACTUALIZADOS CORRECTAMENTE
  echo.
  echo  Archivo actualizado: data/events.js
  echo  Puedes abrir mapa_cyber.html ahora
) else (
  echo  ERROR AL DESCARGAR DATOS
  echo  Verifica tu conexion a internet
)
echo ============================================
echo.
pause

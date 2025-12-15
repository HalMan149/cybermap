@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"

:: Colores y formato
set "LINE==============================================="
set "ARROW=→"

echo.
echo %LINE%
echo   📥 ACTUALIZAR DATOS - CYBERMAP
echo %LINE%
echo.

:: Verificar si estamos en un repositorio git
if not exist ".git" (
    echo ❌ ERROR: No se encuentra repositorio Git
    pause
    exit /b 1
)

:: Verificar conexión a internet
echo %ARROW% Verificando conexión...
ping -n 1 github.com >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Sin conexión a internet o GitHub no accesible
    pause
    exit /b 1
)
echo ✓ Conexión OK

:: Mostrar estado actual
echo.
echo %ARROW% Estado actual:
git branch --show-current
echo.

:: Verificar si hay cambios locales sin guardar
git diff --quiet
if %errorlevel% neq 0 (
    echo ⚠️  Tienes cambios locales sin guardar
    set /p "STASH=¿Quieres guardarlos temporalmente? (S/N): "
    if /i "!STASH!"=="S" (
        echo %ARROW% Guardando cambios temporalmente...
        git stash push -m "Auto-stash antes de actualizar datos"
        set "NEED_POP=1"
    )
)

:: Descargar últimos cambios
echo.
echo %ARROW% Descargando últimos datos de GitHub...
echo.
git pull --rebase
set "PULL_RESULT=%errorlevel%"

if %PULL_RESULT%==0 (
    echo.
    echo %LINE%
    echo   ✅ DATOS ACTUALIZADOS CORRECTAMENTE
    echo %LINE%
    echo.
    
    :: Mostrar archivos actualizados
    echo 📝 Archivos actualizados recientemente:
    echo.
    git diff --name-only HEAD@{1} HEAD 2>nul
    
    echo.
    echo 📊 Archivos de datos principales:
    if exist "data\events.js" echo    ✓ data/events.js ^(ciberseguridad^)
    if exist "data\events.json" echo    ✓ data/events.json ^(ciberseguridad^)
    if exist "data\aemet.js" echo    ✓ data/aemet.js ^(meteorología^)
    if exist "data\aemet.json" echo    ✓ data/aemet.json ^(meteorología^)
    echo.
    
    :: Restaurar cambios guardados si es necesario
    if defined NEED_POP (
        echo %ARROW% Restaurando tus cambios locales...
        git stash pop >nul 2>&1
        echo ✓ Cambios restaurados
        echo.
    )
    
    echo 🌐 Mapas disponibles:
    echo    • mapa_cyber.html ^(Mapa de Ciberseguridad^)
    echo    • mapa_tierra_v2.html ^(Mapa Geológico^)
    echo    • index.html ^(Portal Principal^)
    echo.
    
    :: Preguntar si abrir un mapa
    set /p "OPEN=¿Abrir un mapa? (1=Cyber, 2=Geo, 3=Portal, N=No): "
    if "!OPEN!"=="1" start mapa_cyber.html
    if "!OPEN!"=="2" start mapa_tierra_v2.html
    if "!OPEN!"=="3" start index.html
    
) else (
    echo.
    echo %LINE%
    echo   ❌ ERROR AL DESCARGAR DATOS
    echo %LINE%
    echo.
    echo 🔍 Posibles causas:
    echo    • Sin conexión a internet
    echo    • Conflictos con cambios locales
    echo    • Problemas con el repositorio remoto
    echo.
    echo 💡 Solución:
    echo    1. Verifica tu conexión a internet
    echo    2. Revisa si tienes cambios locales con: git status
    echo    3. Si hay conflictos, resuélvelos manualmente
    echo.
)

echo %LINE%
echo.
pause
endlocal

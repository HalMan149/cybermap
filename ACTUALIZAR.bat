@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
cd /d "%~dp0"

:: Colores y formato
set "LINE==============================================="
set "ARROW=→"

echo.
echo %LINE%
echo   🚀 ACTUALIZAR WEB - CYBERMAP
echo %LINE%
echo.

:: Verificar si estamos en un repositorio git
if not exist ".git" (
    echo ❌ ERROR: No se encuentra repositorio Git
    echo    Asegúrate de estar en la carpeta correcta
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

:: Sincronizar con remoto primero
echo.
echo %ARROW% Sincronizando con GitHub...
git fetch origin >nul 2>&1

:: Verificar si hay cambios remotos
git diff origin/main main --quiet >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Hay cambios en GitHub que no tienes localmente
    echo    Descargando cambios primero...
    git pull --rebase
    if %errorlevel% neq 0 (
        echo ❌ Error al sincronizar. Resuelve conflictos manualmente
        pause
        exit /b 1
    )
    echo ✓ Sincronizado
)

:: Verificar si hay cambios locales
echo.
echo %ARROW% Revisando cambios locales...
git diff --quiet
set "hasUnstaged=%errorlevel%"
git diff --cached --quiet
set "hasStaged=%errorlevel%"

if %hasUnstaged%==0 if %hasStaged%==0 (
    echo ✓ No hay cambios para subir
    echo.
    echo %LINE%
    pause
    exit /b 0
)

:: Mostrar resumen de cambios
echo.
echo 📝 Archivos modificados:
echo.
git status --short
echo.

:: Agregar todos los cambios
echo %ARROW% Agregando cambios al staging...
git add .
echo ✓ Archivos agregados

:: Generar mensaje de commit automático
set "DATESTR=%date:~-4%%date:~3,2%%date:~0,2%"
set "TIMESTR=%time:~0,2%%time:~3,2%%time:~6,2%"
set "TIMESTR=%TIMESTR: =0%"
set "RAND=%RANDOM%"
set "MSG=auto-%DATESTR%-%TIMESTR%-%RAND%"

:: Crear commit
echo.
echo %ARROW% Creando commit...
echo    Mensaje: %MSG%
git commit -m "%MSG%"
if %errorlevel% neq 0 (
    echo ❌ Error al crear commit
    pause
    exit /b 1
)
echo ✓ Commit creado

:: Subir a GitHub
echo.
echo %ARROW% Subiendo cambios a GitHub...
echo    Por favor espera...
git push origin main
if %errorlevel% neq 0 (
    echo ❌ Error al subir cambios
    echo    Revisa tu conexión y permisos
    pause
    exit /b 1
)

:: Éxito
echo.
echo %LINE%
echo   ✅ WEB ACTUALIZADA CORRECTAMENTE
echo %LINE%
echo.
echo 🌐 Tu web estará disponible en 1-2 minutos en:
echo    https://halman149.github.io/cybermap/
echo.
echo 📊 Última actualización: %date% %time:~0,5%
echo 🔗 Commit: %MSG%
echo.

:: Obtener estadísticas del commit
for /f "tokens=*" %%a in ('git log -1 --stat --oneline') do (
    echo %%a
)

echo.
echo %LINE%
echo.

:: Preguntar si abrir en navegador
set /p "OPEN=¿Abrir la web en el navegador? (S/N): "
if /i "%OPEN%"=="S" (
    start https://halman149.github.io/cybermap/mapa_tierra_v2.html
    echo ✓ Abriendo navegador...
)

echo.
pause
endlocal

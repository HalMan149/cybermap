@echo off
setlocal EnableExtensions EnableDelayedExpansion
cd /d "%~dp0"

set "LINE================================================"
set "BRANCH="
set "MSG="
set "NEED_PUSH=0"
set "LOG_FILE=%TEMP%\cybermap-actualizar.log"

echo ------------------------------------------------ > "%LOG_FILE%"
echo Inicio: %date% %time% >> "%LOG_FILE%"

echo.
echo %LINE%
echo   ACTUALIZAR WEB - CYBERMAP
echo %LINE%
echo [INFO] Log: %LOG_FILE%

if not exist ".git" (
  echo [ERROR] No se encuentra repositorio Git.
  goto :fail
)

for /f %%b in ('git rev-parse --abbrev-ref HEAD 2^>nul') do set "BRANCH=%%b"
if not defined BRANCH (
  echo [ERROR] No se pudo detectar la rama actual.
  goto :fail
)
echo [INFO] Rama: %BRANCH%

echo [INFO] Verificando conexion...
ping -n 1 github.com >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Sin conexion a internet o GitHub no accesible.
  goto :fail
)
echo [OK] Conexion.

echo [INFO] Preparando cambios locales...
git add . >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
  echo [ERROR] Fallo en git add.
  goto :fail
)

git diff --cached --quiet
if errorlevel 1 (
  set "NEED_PUSH=1"
  set "MSG=auto-%RANDOM%-%RANDOM%"
  echo [INFO] Creando commit: !MSG!
  git commit -m "!MSG!" >> "%LOG_FILE%" 2>&1
  if errorlevel 1 (
    echo [ERROR] Fallo al crear commit.
    goto :fail
  )
) else (
  echo [INFO] No hay cambios locales para commit.
)

echo [INFO] Sincronizando con GitHub...
git fetch origin >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
  echo [ERROR] Fallo en git fetch.
  goto :fail
)

git pull --rebase origin %BRANCH% >> "%LOG_FILE%" 2>&1
if errorlevel 1 (
  echo [ERROR] Fallo en git pull --rebase.
  goto :fail
)
echo [OK] Sincronizacion completada.

echo [INFO] Estado final:
git status --short

for /f %%a in ('git rev-list --left-right --count HEAD...origin/%BRANCH% 2^>nul') do set "AHEAD_BEHIND=%%a"
for /f "tokens=1,2" %%x in ("%AHEAD_BEHIND%") do (
  if not "%%x"=="0" set "NEED_PUSH=1"
)

if "%NEED_PUSH%"=="1" (
  echo [INFO] Subiendo cambios...
  git push origin %BRANCH% >> "%LOG_FILE%" 2>&1
  if errorlevel 1 (
    echo [ERROR] Fallo en git push.
    goto :fail
  )
)

:ok
echo.
echo %LINE%
echo WEB ACTUALIZADA CORRECTAMENTE
echo URL: https://halman149.github.io/cybermap/
if defined MSG echo Commit: %MSG%
echo.
pause
exit /b 0

:fail
echo [INFO] Revisa log: %LOG_FILE%
echo.
pause
exit /b 1

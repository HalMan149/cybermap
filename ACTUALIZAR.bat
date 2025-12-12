@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

:: Generar un nombre automático: auto-YYYYMMDD-HHMMSS-RND
set "DATESTR=%date:~-4%%date:~3,2%%date:~0,2%"
set "TIMESTR=%time:~0,2%%time:~3,2%%time:~6,2%"
set "TIMESTR=%TIMESTR: =0%"
set "RAND=%RANDOM%"
set "MSG=auto-%DATESTR%-%TIMESTR%-%RAND%"

echo -----------------------------
echo Mensaje de commit: %MSG%
echo Agregando cambios...
git add .

:: Si no hay cambios, salir sin error
git diff --cached --quiet
if %errorlevel%==0 (
  echo Sin cambios para commitear.
  goto end
)

echo -----------------------------
echo Haciendo commit...
git commit -m "%MSG%"

echo -----------------------------
echo Subiendo a GitHub...
git push
:end
echo -----------------------------
endlocal
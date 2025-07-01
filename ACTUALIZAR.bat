@echo off
cd /d "%~dp0"
echo -----------------------------
echo Agregando cambios...
git add .
echo -----------------------------
set /p MSG=Mensaje para el commit: 
git commit -m "%MSG%"
echo -----------------------------
echo Subiendo a GitHub...
git push
echo -----------------------------
pause

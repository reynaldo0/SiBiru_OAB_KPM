@echo off
echo ================================================================
echo   Menjalankan SIBIRU Monorepo (Backend MySQL + Frontend React)
echo ================================================================
echo.

start "SIBIRU - Backend Server (FastAPI + MySQL Laragon)" cmd /c "%~dp0run_backend.bat"
timeout /t 2 /nobreak >nul
start "SIBIRU - Frontend Web App (Vite + React)" cmd /c "%~dp0run_frontend.bat"

echo.
echo SIBIRU Backend dan Frontend telah dijalankan di jendela terpisah!
echo Backend:  http://localhost:8000/docs
echo Frontend: http://localhost:3000
echo.
pause

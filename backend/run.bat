@echo off
echo ===================================================
echo   SIBIRU Backend Service - MySQL Laragon Integration
echo ===================================================
echo.

set PYTHON_CMD=python
if exist "%LOCALAPPDATA%\Programs\Python\Python315\python.exe" (
    set "PYTHON_CMD=%LOCALAPPDATA%\Programs\Python\Python315\python.exe"
) else if exist ".venv\Scripts\python.exe" (
    set "PYTHON_CMD=.venv\Scripts\python.exe"
) else if exist "C:\msys64\ucrt64\bin\python.exe" (
    set "PYTHON_CMD=C:\msys64\ucrt64\bin\python.exe"
)

echo Menggunakan Python: %PYTHON_CMD%
echo Database Target: MySQL Laragon (127.0.0.1:3306/sibiru)
echo.
"%PYTHON_CMD%" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
pause

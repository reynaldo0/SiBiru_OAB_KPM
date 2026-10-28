@echo off
echo Starting SIBIRU Backend Service...
if exist .venv\Scripts\python.exe (
    .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
) else (
    "C:\Users\user\AppData\Local\Microsoft\WindowsApps\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
)

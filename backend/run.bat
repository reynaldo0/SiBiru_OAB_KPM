@echo off
echo Starting SIBIRU Backend Service...
if exist .venv\bin\python.exe (
    .\.venv\bin\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
) else if exist .venv\Scripts\python.exe (
    .\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
) else (
    "C:\msys64\ucrt64\bin\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
)

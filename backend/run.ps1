Write-Host "🚀 Menjalankan SIBIRU Backend Service..." -ForegroundColor Cyan

if (Test-Path ".\.venv\bin\python.exe") {
    & ".\.venv\bin\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
} elseif (Test-Path ".\.venv\Scripts\python.exe") {
    & ".\.venv\Scripts\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
} else {
    & "C:\msys64\ucrt64\bin\python.exe" -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
}

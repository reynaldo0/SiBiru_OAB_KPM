Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  SIBIRU Backend Service - MySQL Laragon Integration" -ForegroundColor Yellow
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

$pythonCmd = "python"
$userPython = "$env:LOCALAPPDATA\Programs\Python\Python315\python.exe"

if (Test-Path $userPython) {
    $pythonCmd = $userPython
} elseif (Test-Path ".venv\Scripts\python.exe") {
    $pythonCmd = ".venv\Scripts\python.exe"
} elseif (Test-Path "C:\msys64\ucrt64\bin\python.exe") {
    $pythonCmd = "C:\msys64\ucrt64\bin\python.exe"
}

Write-Host "Menggunakan Python: $pythonCmd" -ForegroundColor Green
Write-Host "Database Target: MySQL Laragon (127.0.0.1:3306/sibiru)" -ForegroundColor Green
Write-Host "API Dokumentasi: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host ""

& $pythonCmd -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

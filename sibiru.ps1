$pythonExe = "python"
$userPython = "$env:LOCALAPPDATA\Programs\Python\Python315\python.exe"

if (Test-Path $userPython) {
    $pythonExe = $userPython
} elseif (Test-Path "C:\msys64\ucrt64\bin\python.exe") {
    $pythonExe = "C:\msys64\ucrt64\bin\python.exe"
}

$cliPath = Join-Path $PSScriptRoot "cli.py"
& $pythonExe $cliPath @args

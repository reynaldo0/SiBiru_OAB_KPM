@echo off
setlocal
set "PYTHON_EXE=python"
if exist "%LOCALAPPDATA%\Programs\Python\Python315\python.exe" (
    set "PYTHON_EXE=%LOCALAPPDATA%\Programs\Python\Python315\python.exe"
) else if exist "C:\msys64\ucrt64\bin\python.exe" (
    set "PYTHON_EXE=C:\msys64\ucrt64\bin\python.exe"
)

"%PYTHON_EXE%" "%~dp0cli.py" %*
endlocal

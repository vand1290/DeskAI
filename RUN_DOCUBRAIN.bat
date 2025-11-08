@echo off
REM ==========================================
REM  DOCUBRAIN COMPLETE SYSTEM - FINAL
REM ==========================================
REM Port 11434 is blocked on this Windows system
REM Using port 12345 instead (Ollama will start on this)

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ==========================================
echo  DOCUBRAIN STARTUP (Port 12345)
echo ==========================================
echo.

REM Kill any existing processes
echo [1/3] Cleaning up...
taskkill /F /IM ollama.exe /T >nul 2>&1
taskkill /F /IM "ollama app.exe" /T >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start Ollama on port 12345
echo [2/3] Starting Ollama on port 12345...
set OLLAMA_HOST=127.0.0.1:12345
start "Ollama Service" "%LocalAppData%\Programs\Ollama\ollama.exe" serve
timeout /t 15 /nobreak >nul

REM Launch DocuBrain
echo [3/3] Starting DocuBrain...
if exist "docubrain.exe" (
    start "" "docubrain.exe"
) else if exist "desktop-app\build\DocuBrain\DocuBrain.exe" (
    start "" "desktop-app\build\DocuBrain\DocuBrain.exe"
) else (
    echo ERROR: DocuBrain.exe not found!
    pause
    exit /b 1
)

echo.
echo ==========================================
echo   ✓ SYSTEM STARTED
echo ==========================================
echo.
echo Ollama:    localhost:12345
echo DocuBrain: Launching...
echo.
echo This window can be closed.
timeout /t 3 /nobreak >nul

exit /b 0

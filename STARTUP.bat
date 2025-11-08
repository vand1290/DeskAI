@echo off
REM ==========================================
REM  DOCUBRAIN COMPLETE STARTUP (WITH ADMIN)
REM ==========================================
REM This script:
REM 1. Kills any existing processes
REM 2. Elevates to admin to start Ollama
REM 3. Waits for Ollama to initialize
REM 4. Launches DocuBrain

setlocal enabledelayedexpansion

cd /d "%~dp0"

echo.
echo ==========================================
echo  STARTING DOCUBRAIN COMPLETE SYSTEM
echo ==========================================
echo.

REM Step 1: Kill existing processes
echo [1/4] Cleaning up existing processes...
taskkill /F /IM ollama.exe /T >nul 2>&1
taskkill /F /IM "ollama app.exe" /T >nul 2>&1
taskkill /F /IM DocuBrain.exe /T >nul 2>&1
timeout /t 3 /nobreak >nul

REM Step 2: Start Ollama as admin using a hidden script
echo [2/4] Starting Ollama service (admin mode)...

REM Create a temporary PowerShell script that runs with admin
set TEMP_PS1=%TEMP%\ollama_start.ps1
(
    echo $env:OLLAMA_HOST = '127.0.0.1:11434'
    echo $ollama = '%LocalAppData%\Programs\Ollama\ollama.exe'
    echo if ^(Test-Path $ollama^) {
    echo   Start-Process $ollama -ArgumentList 'serve' -WindowStyle Minimized
    echo } else {
    echo   Write-Host 'Ollama not found'
    echo }
) > !TEMP_PS1!

REM Run PowerShell with admin elevation
powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"!TEMP_PS1!\"' -WindowStyle Hidden; Start-Sleep 3" >nul 2>&1

echo   Waiting for Ollama to bind...
timeout /t 12 /nobreak >nul

REM Step 3: Test Ollama connection
echo [3/4] Testing Ollama connectivity...
:retry_ollama
for /l %%i in (1,1,5) do (
    REM Simple TCP port check using PowerShell
    powershell -Command "try { $null = New-Object System.Net.Sockets.TcpClient('127.0.0.1', 11434); Write-Host 'OK' } catch { exit 1 }" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   ^✓ Ollama is responding on port 11434
        goto ollama_ok
    ) else (
        echo   Attempt %%i/5 - waiting...
        timeout /t 2 /nobreak >nul
    )
)

echo   ⚠ Ollama may not be responding yet. Continuing anyway...

:ollama_ok
REM Step 4: Launch DocuBrain
echo [4/4] Launching DocuBrain...

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
echo Ollama: Running on localhost:11434
echo DocuBrain: Launching...
echo.
echo This window can be closed.
echo Both services will continue running.
echo.

REM Cleanup temp file
if exist !TEMP_PS1! del /F /Q !TEMP_PS1! >nul 2>&1

exit /b 0

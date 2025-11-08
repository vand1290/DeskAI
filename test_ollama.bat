@echo off
REM Ollama Connection Diagnostic Script
REM Run this to diagnose Ollama connection issues

setlocal enabledelayedexpansion

echo.
echo =============================================
echo  Ollama Connection Diagnostic
echo =============================================
echo.

REM 1. Check if Ollama is running
echo [1/5] Checking if Ollama is running...
tasklist | findstr /I "ollama" >nul
if %errorlevel% equ 0 (
    echo      ✓ Ollama process found
) else (
    echo      ✗ Ollama NOT running!
    echo.
    echo Solution:
    echo   1. Search for "Ollama" in Start Menu
    echo   2. Click to launch Ollama
    echo   3. Wait 5 seconds for startup
    echo   4. Run this script again
    echo.
    pause
    exit /b 1
)

REM 2. Check port 11434
echo.
echo [2/5] Checking port 11434...
netstat -ano | findstr ":11434" >nul
if %errorlevel% equ 0 (
    echo      ✓ Port 11434 is listening
) else (
    echo      ✗ Port 11434 NOT listening!
    echo.
    echo Solution:
    echo   1. Restart Ollama (close and reopen)
    echo   2. Check if another app uses port 11434
    echo   3. Run: netstat -ano ^| findstr ":11434"
    echo.
    pause
    exit /b 1
)

REM 3. Test API connection
echo.
echo [3/5] Testing Ollama API...
powershell -Command "try { Invoke-RestMethod http://localhost:11434/api/tags -TimeoutSec 5 | Out-Null; exit 0 } catch { exit 1 }" >nul
if %errorlevel% equ 0 (
    echo      ✓ API is responding
) else (
    echo      ✗ API NOT responding!
    echo.
    echo Solution:
    echo   1. Make sure Ollama is fully started
    echo   2. Wait 10 seconds and try again
    echo   3. Check Ollama app window for errors
    echo.
    pause
    exit /b 1
)

REM 4. Check for installed models
echo.
echo [4/5] Checking for installed models...
for /f "tokens=*" %%a in ('powershell -Command "(Invoke-RestMethod http://localhost:11434/api/tags).models | Measure-Object | Select-Object -ExpandProperty Count" 2^>nul') do set ModelCount=%%a

if "%ModelCount%"=="" set ModelCount=0

if %ModelCount% gtr 0 (
    echo      ✓ Found %ModelCount% model(s)
    
    REM Get model names
    echo.
    echo      Models available:
    for /f "tokens=*" %%a in ('powershell -Command "(Invoke-RestMethod http://localhost:11434/api/tags).models | Select-Object -ExpandProperty name"') do (
        echo        - %%a
    )
) else (
    echo      ✗ No models installed!
    echo.
    echo Solution:
    echo   1. Open Command Prompt or PowerShell
    echo   2. Run: ollama pull phi3:mini
    echo   3. Wait 2-5 minutes for download
    echo   4. Run this script again
    echo.
    pause
    exit /b 1
)

REM 5. Summary
echo.
echo =============================================
echo  ✓ All Checks Passed!
echo =============================================
echo.
echo Ollama is properly configured and ready.
echo DocuBrain should be able to connect.
echo.
echo You can now:
echo   1. Launch DocuBrain
echo   2. Import a document
echo   3. Ask a question
echo   4. Get AI-powered responses
echo.
pause

exit /b 0

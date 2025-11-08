@echo off
REM Ollama Service Startup Script
REM Run this as Administrator to start Ollama service

setlocal enabledelayedexpansion

echo.
echo ========================================
echo  Starting Ollama Service
echo ========================================
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Must run as Administrator!
    echo Please right-click this file and select "Run as Administrator"
    pause
    exit /b 1
)

echo Starting Ollama service...
echo This window will stay open while Ollama is running.
echo.

REM Set environment for localhost binding
set OLLAMA_HOST=127.0.0.1:11434

REM Start Ollama server
"%LocalAppData%\Programs\Ollama\ollama.exe" serve

echo.
echo Ollama service stopped.
pause

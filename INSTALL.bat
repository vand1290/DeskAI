@echo off
REM ===============================================
REM  DocuBrain PLUG AND PLAY Installer
REM  One Click - That's It!
REM ===============================================
REM  Right-click and select "Run as Administrator"

setlocal enabledelayedexpansion

echo.
echo ===============================================
echo  DocuBrain - Plug and Play Installation
echo ===============================================
echo.
echo This will install everything you need.
echo No other steps required!
echo.

REM Check if running as Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Administrator privileges required!
    echo.
    echo Please right-click this file and select:
    echo   "Run as administrator"
    echo.
    pause
    exit /b 1
)

REM Get the directory where this script is located
set SCRIPT_DIR=%~dp0

REM Run PowerShell installer
echo Installing DocuBrain to Program Files...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "& '!SCRIPT_DIR!installer\Install.ps1' -InstallDir '%ProgramFiles%\DocuBrain'"

if %errorlevel% equ 0 (
    echo.
    echo ===============================================
    echo  READY TO USE!
    echo ===============================================
    echo.
    echo Launching DocuBrain now...
    echo.
    timeout /t 2 /nobreak
    
    REM Launch the app directly
    start "" "%ProgramFiles%\DocuBrain\DocuBrain.exe"
    
    echo.
    echo Installation complete! DocuBrain is launching...
    echo.
) else (
    echo.
    echo ERROR: Installation failed!
    echo Please check the error messages above.
    echo.
    pause
    exit /b 1
)

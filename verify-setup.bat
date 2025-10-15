@echo off
REM DeskAI Setup Verification Script for Windows
REM This script verifies that your development environment is properly configured

echo ================================================================
echo          DeskAI Setup Verification (Windows)
echo ================================================================
echo.

set "EXIT_CODE=0"

REM Check Node.js
echo Checking Node.js...
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo [OK] Node.js !NODE_VERSION! installed
) else (
    echo [FAIL] Node.js not found. Please install Node.js 16 or higher
    set "EXIT_CODE=1"
)
echo.

REM Check npm
echo Checking npm...
where npm >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo [OK] npm !NPM_VERSION! installed
) else (
    echo [FAIL] npm not found
    set "EXIT_CODE=1"
)
echo.

REM Check Rust
echo Checking Rust...
where cargo >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for /f "tokens=*" %%i in ('cargo --version') do set CARGO_VERSION=%%i
    echo [OK] !CARGO_VERSION! installed
) else (
    echo [FAIL] Rust/Cargo not found. Please install from https://rustup.rs
    set "EXIT_CODE=1"
)
echo.

REM Check dependencies
echo Checking project dependencies...
if exist node_modules\ (
    echo [OK] Node modules installed
) else (
    echo [WARN] Node modules not found. Run: npm install
)
echo.

REM Check TypeScript compilation
echo Checking TypeScript compilation...
call npx tsc --noEmit >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] TypeScript compiles successfully
) else (
    echo [FAIL] TypeScript compilation has errors
    set "EXIT_CODE=1"
)
echo.

REM Platform-specific checks
echo Checking Windows-specific dependencies...
echo [OK] Windows platform detected
echo.

REM Check Visual Studio
echo Checking for Visual Studio Build Tools...
if exist "C:\Program Files (x86)\Microsoft Visual Studio\" (
    echo [OK] Visual Studio installation found
) else (
    echo [WARN] Visual Studio not found at default location
    echo       Tauri requires Visual Studio 2022 or VS Build Tools
)
echo.

REM Summary
echo ================================================================
if %EXIT_CODE% EQU 0 (
    echo  [OK] All checks passed! Ready to develop.
    echo.
    echo  Next steps:
    echo  - Run 'npm run tauri:dev' to start development
    echo  - Run 'npm run tauri:build' to build for production
) else (
    echo  [WARN] Some checks failed. Please fix the issues above.
)
echo ================================================================

exit /b %EXIT_CODE%

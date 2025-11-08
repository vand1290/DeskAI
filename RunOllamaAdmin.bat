@echo off
REM Run Ollama as Administrator
cd /d "%LocalAppData%\Programs\Ollama"

echo ========================================
echo  Starting Ollama with Admin Privileges
echo ========================================

REM Use VBScript to self-elevate if not already admin
PowerShell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -Command \"$env:OLLAMA_HOST=\\\"127.0.0.1:11434\\\"; & \\\"%LocalAppData%\\Programs\\Ollama\\ollama.exe\\\" serve\"' -WindowStyle Minimized"

echo.
echo Ollama starting in minimized window...
timeout /t 5

exit /b

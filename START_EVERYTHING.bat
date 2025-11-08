@echo off
REM Auto-start Ollama and DocuBrain

echo Starting Ollama service...
cd /d "%LOCALAPPDATA%\Programs\Ollama"
start ollama.exe serve

echo Waiting 20 seconds for Ollama to initialize...
timeout /t 20 /nobreak

echo Testing connection...
curl http://localhost:11434/api/tags

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Ollama is not responding
    echo Please ensure:
    echo   1. Ollama is installed
    echo   2. Port 11434 is not blocked by firewall
    echo   3. Run as Administrator if needed
    pause
    exit /b 1
)

echo.
echo SUCCESS: Ollama is running!
echo Launching DocuBrain...

start "" "%USERPROFILE%\Desktop\DocBrain\docbrain-starter\desktop-app\build\DocuBrain\DocuBrain.exe"

echo Done!
pause

# Ollama Network Configuration Fix

## Problem
Docker containers cannot reach Ollama because it only listens on localhost (127.0.0.1).

## Solution
Configure Ollama to listen on all network interfaces.

### For Windows:

1. **Set environment variable:**
   - Open System Properties → Advanced → Environment Variables
   - Add new System Variable:
     - Name: `OLLAMA_HOST`
     - Value: `0.0.0.0:11434`

2. **Restart Ollama:**
   - Close Ollama from system tray
   - Restart Ollama

### OR Quick PowerShell Fix:

```powershell
# Set for current session
$env:OLLAMA_HOST = "0.0.0.0:11434"

# Restart Ollama
Stop-Process -Name "ollama" -Force -ErrorAction SilentlyContinue
Start-Process "ollama" "serve"
```

### Verify it's working:
```powershell
curl http://192.168.1.78:11434/api/tags
```

After this, restart Docker containers:
```powershell
cd docker
docker-compose restart worker
```

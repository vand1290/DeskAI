# 🔧 Ollama Connection - Diagnostic & Fix Guide

## 🎯 What's the Problem?

Your DocuBrain can't connect to Ollama at `http://localhost:11434`.

Common causes:
1. ❌ Ollama not installed
2. ❌ Ollama app not running
3. ❌ Ollama process crashed
4. ❌ Wrong port (not 11434)
5. ❌ Firewall blocking connection
6. ❌ Ollama misconfigured

---

## 🔍 Step 1: Check if Ollama is Running

### **Check Process**
```powershell
# See if Ollama process exists
Get-Process -Name "*ollama*" -ErrorAction SilentlyContinue

# Should see something like:
# Handles  NPM(K)    PM(K)      WS(K) CPU(s)     Id  SI ProcessName
# ------- ------    -----      ----- ------     --  -- -----------
#   xxxxx      xxx   xxx,xxx   xxx,xxx   x.xx yyyyy  x ollama
```

**If NOTHING appears**: Ollama is not running → Start it!

### **Start Ollama**
```powershell
# Option 1: Click the Ollama app icon (searches for "Ollama" in Start Menu)

# Option 2: Run from command line
"C:\Users\%USERNAME%\AppData\Local\Programs\Ollama\ollama.exe" serve

# Wait for startup message: "Listening on..."
```

---

## 🌐 Step 2: Check Connection to Ollama

### **Test Connection**
```powershell
# Try to reach Ollama API
curl http://localhost:11434/api/tags

# Should return something like:
# {"models":[{"name":"phi3:mini","modified_at":"2025-11-08T..."}]}

# If you get error: "Connection refused" → Ollama not listening
```

### **Check What Port Ollama Is On**
```powershell
# List all services listening on ports
netstat -ano | findstr ":11434"

# Should show something listening on 11434
# If nothing shows: Ollama is not on port 11434
```

### **Find What Port Ollama Is Actually On**
```powershell
# See all connections by Ollama process
Get-NetTCPConnection | Where-Object {$_.OwningProcess -eq (Get-Process -Name ollama).Id}

# Look for LocalPort - that's where Ollama is listening
# Should be 11434, but could be different
```

---

## 📋 Step 3: Verify Ollama Is Properly Installed

### **Check Installation Path**
```powershell
# Ollama usually installs to:
Test-Path "C:\Users\$env:USERNAME\AppData\Local\Programs\Ollama"

# Should return: True
# If False: Ollama not installed in standard location
```

### **Check for Models**
```powershell
# After starting Ollama, check if models are installed
curl http://localhost:11434/api/tags

# Look for models in response like:
# "models": [
#   {"name": "phi3:mini"},
#   {"name": "mistral"}
# ]

# If empty: No models installed - need to pull one
```

---

## 📥 Step 4: Install a Model (If Needed)

### **Pull a Small Model**
```powershell
# After starting Ollama, pull a model
ollama pull phi3:mini

# This downloads the model (one-time, takes 2-5 minutes)
# Wait for completion before using DocuBrain
```

### **Verify Model Downloaded**
```powershell
# Check if model is now available
curl http://localhost:11434/api/tags

# Should now include phi3:mini in the response
```

---

## 🐛 Step 5: Troubleshoot Common Issues

### **Issue: "Connection refused" or "No connection"**
```
Cause: Ollama not running
Fix: 
  1. Start Ollama app (search in Start Menu)
  2. Wait 5 seconds for startup
  3. Test: curl http://localhost:11434/api/tags
  4. Try DocuBrain again
```

### **Issue: Port 11434 is in use by something else**
```
Cause: Another process using the port
Fix:
  1. Find what's using it: netstat -ano | findstr ":11434"
  2. Kill the process: taskkill /PID <PID> /F
  3. Start Ollama on that port
  4. Or: Configure Ollama to use different port
```

### **Issue: Ollama crashes on startup**
```
Cause: Memory issues or GPU problems
Fix:
  1. Close memory-heavy apps (browsers, etc)
  2. Restart Windows
  3. Start Ollama again
  4. Check system logs for errors
```

### **Issue: "models" list is empty**
```
Cause: No models installed
Fix:
  1. Pull a model: ollama pull phi3:mini
  2. Wait for download to complete
  3. Verify: curl http://localhost:11434/api/tags
  4. Try DocuBrain again
```

### **Issue: Firewall blocking connection**
```
Cause: Windows Firewall blocking port 11434
Fix:
  1. Open Windows Defender Firewall → Advanced Settings
  2. Inbound Rules → New Rule
  3. Port → Specific port 11434 → Allow
  4. Or: Temporarily disable firewall (not recommended)
```

---

## ✅ Complete Diagnostic Checklist

Run through these in order:

```
[ ] Ollama installed? (AppData\Local\Programs\Ollama)
    └─ If no: Download from ollama.ai and install

[ ] Ollama process running? (Get-Process -Name "*ollama*")
    └─ If no: Start Ollama app or run ollama.exe serve

[ ] Listening on port 11434? (netstat -ano | findstr ":11434")
    └─ If no: Check what port it's on or restart Ollama

[ ] API responding? (curl http://localhost:11434/api/tags)
    └─ If no: Ollama has an issue, restart

[ ] Models installed? (curl returns "models" list)
    └─ If no: Pull a model - ollama pull phi3:mini

[ ] Model download complete? (Check /api/tags shows models)
    └─ If no: Wait for download to finish

[ ] No firewall block? (Can reach localhost:11434 from cmd)
    └─ If blocked: Configure firewall to allow port 11434

[ ] DocuBrain connects? (Try chat feature)
    └─ If works: Problem solved! ✅
```

---

## 🛠️ Advanced Troubleshooting

### **Check Ollama Logs**
```powershell
# Ollama logs are typically in:
Get-Content "$env:APPDATA\ollama\logs.txt" -Tail 50

# Look for error messages about:
# - GPU/CUDA issues
# - Memory problems
# - Port binding failures
```

### **Reset Ollama Configuration**
```powershell
# Stop Ollama
taskkill /IM ollama.exe /F

# Delete configuration (warning: deletes settings)
Remove-Item "$env:APPDATA\ollama" -Recurse

# Restart Ollama
# It will rebuild configuration from scratch
```

### **Check System Resources**
```powershell
# See available memory
Get-WmiObject -Class Win32_ComputerSystem | Select-Object TotalPhysicalMemory

# See current memory usage
Get-Process | Measure-Object -Property WorkingSet -Sum

# If low memory: Close other apps before using Ollama
```

---

## 🎯 Quick Fix Flowchart

```
Can't connect to Ollama?
        ↓
Is Ollama installed?
    ├─ No → Install from ollama.ai
    └─ Yes → Continue
        ↓
Is Ollama running?
    ├─ No → Start Ollama app
    └─ Yes → Continue
        ↓
Can you reach http://localhost:11434?
    ├─ No → Check firewall or port
    └─ Yes → Continue
        ↓
Are models installed?
    ├─ No → ollama pull phi3:mini
    └─ Yes → Continue
        ↓
✅ Problem should be fixed!
```

---

## 📱 DocuBrain Troubleshooting

### **From DocuBrain's Perspective**

**Error: "503 - Ollama request failed"**
```
Meaning: Router can't reach Ollama
Fix:
  1. Check Ollama is running (Step 1)
  2. Check connection works (Step 2)
  3. Restart DocuBrain
```

**Error: "No connection adapters found"**
```
Meaning: Router has wrong Ollama URL
Status: Should NOT happen (hardcoded to localhost)
Fix:
  1. Rebuild router: python -m PyInstaller Router.spec
  2. Restart DocuBrain
```

**Error: "Empty model list"**
```
Meaning: Ollama has no models installed
Fix:
  1. Start Ollama
  2. Pull model: ollama pull phi3:mini
  3. Restart DocuBrain
```

---

## 🔐 Environment Variables (Advanced)

### **Current Setup (Should NOT need to change)**
```powershell
# Router hardcoded to:
OLLAMA_HOST = "http://localhost:11434"

# Desktop app auto-starts router
# Router auto-connects to Ollama

# NO environment variables needed!
```

### **If You Need to Override (Not Recommended)**
```powershell
# Set environment variable (will NOT override hardcoded value)
[Environment]::SetEnvironmentVariable("OLLAMA_HOST", "http://127.0.0.1:11434", "User")

# Restart for changes to take effect
```

---

## 📝 Testing Script

Create a file `test_ollama_connection.ps1`:

```powershell
Write-Host "=== Ollama Connection Test ===" -ForegroundColor Cyan
Write-Host ""

# 1. Check process
Write-Host "1. Checking if Ollama is running..."
$process = Get-Process -Name "*ollama*" -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "   ✅ Found Ollama process: $($process.Name)" -ForegroundColor Green
} else {
    Write-Host "   ❌ Ollama not running!" -ForegroundColor Red
    Write-Host "   → Start Ollama and try again" -ForegroundColor Yellow
    exit 1
}

# 2. Check port
Write-Host ""
Write-Host "2. Checking port 11434..."
$connection = Get-NetTCPConnection -LocalPort 11434 -ErrorAction SilentlyContinue
if ($connection) {
    Write-Host "   ✅ Port 11434 is listening" -ForegroundColor Green
} else {
    Write-Host "   ❌ Port 11434 not listening!" -ForegroundColor Red
    exit 1
}

# 3. Test API
Write-Host ""
Write-Host "3. Testing Ollama API..."
try {
    $response = Invoke-RestMethod http://localhost:11434/api/tags -TimeoutSec 5
    Write-Host "   ✅ API responding" -ForegroundColor Green
    
    $models = $response.models
    if ($models.Count -gt 0) {
        Write-Host "   ✅ Models installed: $($models | Select-Object -ExpandProperty name -join ', ')" -ForegroundColor Green
    } else {
        Write-Host "   ❌ No models installed!" -ForegroundColor Red
        Write-Host "   → Run: ollama pull phi3:mini" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ API not responding: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "=== All tests passed! ===" -ForegroundColor Green
Write-Host "DocuBrain should be able to connect to Ollama."
```

**Run it**:
```powershell
powershell -ExecutionPolicy Bypass -File test_ollama_connection.ps1
```

---

## 🚀 Final Checklist

Before trying DocuBrain again:

- [ ] Ollama installed
- [ ] Ollama process running
- [ ] Port 11434 listening
- [ ] API responding to curl
- [ ] At least one model installed
- [ ] No firewall blocks port 11434
- [ ] System has enough memory

If all ✅: **DocuBrain will work!**

---

## 📞 Still Having Issues?

1. **Save diagnostic output**:
   ```powershell
   Get-Process *ollama*
   netstat -ano | findstr ":11434"
   curl http://localhost:11434/api/tags
   ```

2. **Check Ollama logs**:
   ```powershell
   Get-Content "$env:APPDATA\ollama\logs.txt" -Tail 100
   ```

3. **Restart completely**:
   - Stop DocuBrain
   - Stop Ollama
   - Restart computer
   - Start Ollama
   - Start DocuBrain

4. **Reinstall if needed**:
   - Uninstall Ollama
   - Restart
   - Download fresh from ollama.ai
   - Install and configure

---

## ✅ Summary

**Ollama Connection Steps**:
1. Install Ollama (ollama.ai)
2. Start Ollama app
3. Pull a model (`ollama pull phi3:mini`)
4. Verify connection (`curl http://localhost:11434/api/tags`)
5. Launch DocuBrain
6. Done! ✅

**Most Common Fix**: Start Ollama! 🎊

---

**DocuBrain v1.0 | Ollama Connection Guide**
**November 8, 2025**

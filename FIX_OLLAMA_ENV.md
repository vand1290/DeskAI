# CRITICAL FIX REQUIRED

## Problem
Your Windows system has an environment variable `OLLAMA_HOST` set to `0.0.0.0:11434` which is **INCORRECT**.
This causes the router to fail when trying to connect to Ollama.

## Solution

### Step 1: Fix the Environment Variable

1. Press `Win + R` and type: `sysdm.cpl` then press Enter
2. Click the "Advanced" tab
3. Click "Environment Variables..." button
4. Look for `OLLAMA_HOST` in **BOTH** sections:
   - User variables for [Your Username]
   - System variables

5. **Either:**
   - **DELETE** the variable completely (RECOMMENDED), OR
   - **CHANGE** it to: `http://localhost:11434`

6. Click OK on all dialogs
7. **RESTART** all open PowerShell/CMD windows

### Step 2: Verify the Fix

Open a NEW PowerShell window and run:
```powershell
$env:OLLAMA_HOST
```

It should show **nothing** (blank) OR `http://localhost:11434`

If it still shows `0.0.0.0:11434`, you need to restart your computer for the change to take effect.

### Step 3: Test the Router

After fixing the environment variable:

```powershell
cd C:\Users\ACESFG167279MF\Desktop\DocBrain\docbrain-starter\router\dist
.\start_router.bat
```

Then in another window:
```powershell
curl http://localhost:8000/models
```

This should now return a list of Ollama models!

---

## Why This Happened

`0.0.0.0` is a **bind address** used when STARTING a server (means "listen on all interfaces").
It is NOT a valid **connect address** for clients.

Clients must connect to:
- `localhost` or `127.0.0.1` (local machine)
- or a specific IP like `192.168.1.100`

The router is a CLIENT connecting TO Ollama, so it needs `localhost`, not `0.0.0.0`.

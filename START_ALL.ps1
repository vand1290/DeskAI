# Start everything with proper error handling
$ErrorActionPreference = "SilentlyContinue"

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  STARTING DOCUBRAIN SYSTEM            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Step 1: Kill any existing processes
Write-Host "[1/5] Cleaning up existing processes..." -ForegroundColor Yellow
taskkill /F /IM ollama.exe /T 2>$null | Out-Null
taskkill /F /IM "ollama app.exe" /T 2>$null | Out-Null
Get-Process ollama, DocuBrain, DocuBrainRouter -ErrorAction SilentlyContinue | Stop-Process -Force 2>$null

# Step 2: Wait for cleanup
Write-Host "[2/5] Waiting for system cleanup (8 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Step 3: Start Ollama
Write-Host "[3/5] Starting Ollama service..." -ForegroundColor Yellow
$ollama_path = "$env:LocalAppData\Programs\Ollama\ollama.exe"

if (-not (Test-Path $ollama_path)) {
    Write-Host "ERROR: Ollama not found at $ollama_path" -ForegroundColor Red
    Write-Host "Please install Ollama from https://ollama.ai" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Start Ollama minimized
$process = Start-Process -FilePath $ollama_path -ArgumentList "serve" -PassThru -WindowStyle Minimized -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "✓ Ollama started (PID: $($process.Id))" -ForegroundColor Green
} else {
    Write-Host "ERROR: Failed to start Ollama" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Step 4: Wait for Ollama to initialize
Write-Host "[4/5] Waiting for Ollama to initialize (20 seconds)..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Test if Ollama is responding
$maxAttempts = 5
$attempt = 0
$connected = $false

Write-Host "[5/5] Testing Ollama connection..." -ForegroundColor Yellow
while ($attempt -lt $maxAttempts -and -not $connected) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:11434/api/tags" -TimeoutSec 3 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Ollama is responding on port 11434" -ForegroundColor Green
            $connected = $true
        }
    }
    catch {
        $attempt++
        if ($attempt -lt $maxAttempts) {
            Write-Host "  Attempting connection... ($attempt/$maxAttempts)" -ForegroundColor DarkYellow
            Start-Sleep -Seconds 2
        }
    }
}

if (-not $connected) {
    Write-Host "`n⚠ WARNING: Ollama is not responding" -ForegroundColor Red
    Write-Host "This might be a temporary issue. DocuBrain may still work." -ForegroundColor Yellow
    Write-Host "Press Enter to continue anyway, or press Ctrl+C to stop." -ForegroundColor Yellow
    Read-Host
}

# Launch DocuBrain
Write-Host "`n✓ Starting DocuBrain application..." -ForegroundColor Green
$docubrain_path = "$PSScriptRoot\desktop-app\build\DocuBrain\DocuBrain.exe"

if (-not (Test-Path $docubrain_path)) {
    Write-Host "ERROR: DocuBrain not found at $docubrain_path" -ForegroundColor Red
    Write-Host "Make sure DocuBrain has been built." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Start-Process -FilePath $docubrain_path -WorkingDirectory "$PSScriptRoot\desktop-app\build\DocuBrain" -ErrorAction SilentlyContinue

Write-Host "`n╔════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ SYSTEM STARTED SUCCESSFULLY        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Ollama Status: $(if ($connected) {'✓ Running'} else {'⚠ Not responding (may reconnect)'})" -ForegroundColor Cyan
Write-Host "DocuBrain: Launching..." -ForegroundColor Cyan
Write-Host "`nYou can close this window. Both services will continue running." -ForegroundColor Gray

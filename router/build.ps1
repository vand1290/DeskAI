# Build DocuBrain Router as .exe using PyInstaller

Write-Host "🔧 Building DocuBrain Router..." -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

# Ensure venv is active (optional)
if (-not (Test-Path ..\.venv\Scripts\python.exe)) {
  Write-Host "⚠️  .venv not found at repo root. Ensure PyInstaller and deps are installed." -ForegroundColor Yellow
}

# Clean
if (Test-Path "build") { Remove-Item -Recurse -Force "build" }
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "__pycache__") { Remove-Item -Recurse -Force "__pycache__" }

# Build
pyinstaller --clean --noconfirm Router.spec

if (Test-Path "dist\DocuBrainRouter.exe") {
  Write-Host "✅ Router build complete: $scriptDir\dist\DocuBrainRouter.exe" -ForegroundColor Green
} else {
  Write-Host "❌ Router build failed." -ForegroundColor Red
}

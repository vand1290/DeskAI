# Run DocuBrain Desktop App

Write-Host "🚀 Starting DocuBrain Desktop Application..." -ForegroundColor Cyan

# Check if virtual environment exists
if (Test-Path "..\\.venv\\Scripts\\Activate.ps1") {
    Write-Host "✅ Activating virtual environment..." -ForegroundColor Green
    & ..\\.venv\\Scripts\\Activate.ps1
} else {
    Write-Host "⚠️  No virtual environment found. Using system Python..." -ForegroundColor Yellow
}

# Check if dependencies are installed
Write-Host "📦 Checking dependencies..." -ForegroundColor Cyan
pip show customtkinter > $null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "📥 Installing dependencies..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Run the application
Write-Host "🎨 Launching DocuBrain..." -ForegroundColor Green
Write-Host ""
python main.py

# Keep window open if there was an error
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Application exited with errors" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

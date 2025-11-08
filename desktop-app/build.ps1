# Build DocuBrain Desktop App as .exe

Write-Host "🎁 Building DocuBrain Executable..." -ForegroundColor Cyan
Write-Host ""

# Navigate to desktop-app directory
$appDir = "c:\Users\ACESFG167279MF\Desktop\DocBrain\docbrain-starter\desktop-app"
Set-Location $appDir

# Activate virtual environment
Write-Host "✅ Activating virtual environment..." -ForegroundColor Green
& "..\\.venv\\Scripts\\Activate.ps1"

# Clean previous builds
Write-Host "🧹 Cleaning previous builds..." -ForegroundColor Yellow
if (Test-Path "build") { Remove-Item -Recurse -Force "build" }
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "__pycache__") { Remove-Item -Recurse -Force "__pycache__" }

# Build with PyInstaller
Write-Host ""
Write-Host "🔨 Building executable with PyInstaller..." -ForegroundColor Cyan
Write-Host "This may take 2-3 minutes..." -ForegroundColor Yellow
Write-Host ""

pyinstaller --clean --noconfirm DocuBrain.spec

# Check if build succeeded
if (Test-Path "dist\\DocuBrain.exe") {
    Write-Host ""
    Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📦 Executable created at:" -ForegroundColor Cyan
    Write-Host "   $appDir\\dist\\DocuBrain.exe" -ForegroundColor White
    Write-Host ""
    
    # Get file size
    $size = [math]::Round((Get-Item "dist\\DocuBrain.exe").Length / 1MB, 2)
    Write-Host "📊 File size: $size MB" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "🚀 To run the app:" -ForegroundColor Cyan
    Write-Host "   1. Navigate to: $appDir\\dist\\" -ForegroundColor White
    Write-Host "   2. Double-click: DocuBrain.exe" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 You can copy DocuBrain.exe anywhere and run it!" -ForegroundColor Green
    Write-Host "   No Python or dependencies needed!" -ForegroundColor Green
    Write-Host ""
    
    # Ask if user wants to open the dist folder
    $open = Read-Host "Open dist folder now? (Y/N)"
    if ($open -eq "Y" -or $open -eq "y") {
        explorer "dist"
    }
    
} else {
    Write-Host ""
    Write-Host "❌ BUILD FAILED!" -ForegroundColor Red
    Write-Host "Check the output above for errors" -ForegroundColor Red
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

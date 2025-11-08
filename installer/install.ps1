# DocuBrain Installer for Windows
# This script installs DocuBrain (desktop app) and Router service to Program Files
# Requires: Administrator privileges

param(
    [string]$InstallDir = "$env:ProgramFiles\DocuBrain"
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DocuBrain Installer for Windows" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: This script requires Administrator privileges!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Installation directory: $InstallDir" -ForegroundColor Gray
Write-Host ""

# Create installation directory
Write-Host "Creating installation directory..." -ForegroundColor Yellow
if (!(Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    Write-Host "  [CREATED] $InstallDir" -ForegroundColor Green
} else {
    Write-Host "  [EXISTS] $InstallDir" -ForegroundColor Gray
}

# Get paths to EXE files
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$SourceDir = Join-Path (Split-Path -Parent $ScriptDir) "desktop-app\dist"
$RouterSourceDir = Join-Path (Split-Path -Parent $ScriptDir) "router\dist"

$DocuBrainExe = Join-Path $SourceDir "DocuBrain.exe"
$RouterExe = Join-Path $RouterSourceDir "DocuBrainRouter.exe"
$RouterBat = Join-Path $RouterSourceDir "start_router.bat"

# Verify source files
Write-Host ""
Write-Host "Verifying source files..." -ForegroundColor Yellow
if (!(Test-Path $DocuBrainExe)) {
    Write-Host "ERROR: DocuBrain.exe not found at $DocuBrainExe" -ForegroundColor Red
    Write-Host "Make sure you've built the EXE first!" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "  [OK] DocuBrain.exe" -ForegroundColor Green

if (!(Test-Path $RouterExe)) {
    Write-Host "ERROR: DocuBrainRouter.exe not found at $RouterExe" -ForegroundColor Red
    Write-Host "Make sure you've built the Router EXE first!" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "  [OK] DocuBrainRouter.exe" -ForegroundColor Green

# Copy executable files
Write-Host ""
Write-Host "Installing files..." -ForegroundColor Yellow
Copy-Item -Path $DocuBrainExe -Destination $InstallDir -Force
Write-Host "  [INSTALLED] DocuBrain.exe" -ForegroundColor Green

Copy-Item -Path $RouterExe -Destination $InstallDir -Force
Write-Host "  [INSTALLED] DocuBrainRouter.exe" -ForegroundColor Green

# Create or copy router startup script
$DestBat = Join-Path $InstallDir "start_router.bat"
if (Test-Path $RouterBat) {
    Copy-Item -Path $RouterBat -Destination $DestBat -Force
} else {
    @"
@echo off
cd /d "%~dp0"
start "" /B DocuBrainRouter.exe --host 0.0.0.0 --port 8000
"@ | Out-File -FilePath $DestBat -Encoding ASCII -Force
}
Write-Host "  [INSTALLED] start_router.bat" -ForegroundColor Green

# Create shortcuts
Write-Host ""
Write-Host "Creating shortcuts..." -ForegroundColor Yellow

$DesktopPath = [Environment]::GetFolderPath("Desktop")
$StartMenuPath = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\DocuBrain"
$Shell = New-Object -ComObject WScript.Shell

# Create Start Menu directory
New-Item -ItemType Directory -Path $StartMenuPath -Force -ErrorAction SilentlyContinue | Out-Null

# Create Desktop shortcut for DocuBrain
$Shortcut = $Shell.CreateShortcut("$DesktopPath\DocuBrain.lnk")
$Shortcut.TargetPath = Join-Path $InstallDir "DocuBrain.exe"
$Shortcut.WorkingDirectory = $InstallDir
$Shortcut.Description = "DocuBrain - Document Intelligence Platform"
$Shortcut.IconLocation = (Join-Path $InstallDir "DocuBrain.exe") + ",0"
$Shortcut.Save()
Write-Host "  [CREATED] Desktop\DocuBrain.lnk" -ForegroundColor Green

# Create Start Menu shortcut for DocuBrain
$Shortcut = $Shell.CreateShortcut("$StartMenuPath\DocuBrain.lnk")
$Shortcut.TargetPath = Join-Path $InstallDir "DocuBrain.exe"
$Shortcut.WorkingDirectory = $InstallDir
$Shortcut.Description = "DocuBrain - Document Intelligence Platform"
$Shortcut.IconLocation = (Join-Path $InstallDir "DocuBrain.exe") + ",0"
$Shortcut.Save()
Write-Host "  [CREATED] Start Menu\DocuBrain.lnk" -ForegroundColor Green

# Create shortcut for Router service
$Shortcut = $Shell.CreateShortcut("$StartMenuPath\Start Router.lnk")
$Shortcut.TargetPath = $DestBat
$Shortcut.WorkingDirectory = $InstallDir
$Shortcut.Description = "Start DocuBrain Router Service (Ollama Bridge)"
$Shortcut.IconLocation = (Join-Path $InstallDir "DocuBrainRouter.exe") + ",0"
$Shortcut.WindowStyle = 7  # Minimized
$Shortcut.Save()
Write-Host "  [CREATED] Start Menu\Start Router.lnk" -ForegroundColor Green

# Create README
$ReadmeFile = Join-Path $InstallDir "README_FIRST.txt"
@"
=====================================
  DocuBrain Installation Complete
=====================================

QUICK START:

1. Launch DocuBrain from Desktop or Start Menu

2. Make sure Ollama is running on your system
   - If not installed, download from: https://ollama.ai
   - Start Ollama and pull a model (e.g., phi3:mini)

3. The router service connects to Ollama automatically

IMPORTANT NOTES:

- DocuBrain connects to Ollama at: http://localhost:11434
- Router service runs on: http://localhost:8000
- Both run locally on your machine

TROUBLESHOOTING:

If DocuBrain can't connect to Ollama:
  1. Check that Ollama is running
  2. Run "Start Router.lnk" from Start Menu to manually start the router service
  3. Try again

To uninstall:
  - Use Windows Add/Remove Programs
  - Or delete: $InstallDir

For more info: https://github.com/your-repo/docbrain
"@ | Out-File -FilePath $ReadmeFile -Encoding UTF8 -Force
Write-Host "  [CREATED] README_FIRST.txt" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Installed to: $InstallDir" -ForegroundColor White
Write-Host ""
Write-Host "READY TO USE - NO OTHER STEPS NEEDED!" -ForegroundColor Green
Write-Host ""
Write-Host "Just click 'DocuBrain' on your Desktop!" -ForegroundColor Yellow
Write-Host ""
Write-Host "How it works:" -ForegroundColor Cyan
Write-Host "  ✓ DocuBrain will auto-start router service" -ForegroundColor White
Write-Host "  ✓ Router auto-connects to Ollama (localhost:11434)" -ForegroundColor White
Write-Host "  ✓ If Ollama not running, it will show error" -ForegroundColor White
Write-Host "  ✓ Install Ollama separately from: https://ollama.ai" -ForegroundColor Gray
Write-Host ""

Write-Host "Shortcuts created:" -ForegroundColor Cyan
Write-Host "  ✓ Desktop: DocuBrain (main app)" -ForegroundColor White
Write-Host "  ✓ Start Menu: DocuBrain, Start Router" -ForegroundColor White
Write-Host ""

Read-Host "Press Enter to finish"

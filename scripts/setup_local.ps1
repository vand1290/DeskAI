# PowerShell setup script to create a virtualenv and install UI + Desktop requirements
# Usage: run this from the repository root as: .\scripts\setup_local.ps1

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
Set-Location $repoRoot

Write-Host "Repository root: $repoRoot"

# Create virtualenv
if (-Not (Test-Path -Path ".venv")) {
    Write-Host "Creating virtual environment .venv..."
    python -m venv .venv
} else {
    Write-Host ".venv already exists. Skipping venv creation."
}

# Upgrade pip and install requirements for UI and Desktop app
Write-Host "Upgrading pip and installing requirements (this may take a while)..."
.\.venv\Scripts\python.exe -m pip install --upgrade pip

# Install Streamlit UI requirements
if (Test-Path "ui\requirements.txt") {
    .\.venv\Scripts\python.exe -m pip install -r ui\requirements.txt
}

# Install Desktop app requirements (customtkinter, etc.)
if (Test-Path "desktop-app\requirements.txt") {
    .\.venv\Scripts\python.exe -m pip install -r desktop-app\requirements.txt
}

Write-Host "Setup complete. To run the Streamlit UI: .\.venv\Scripts\python.exe -m streamlit run ui\app.py"
Write-Host "To run the desktop app: .\.venv\Scripts\python.exe desktop-app\main.py"

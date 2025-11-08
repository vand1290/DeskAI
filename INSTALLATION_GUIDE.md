# DocuBrain for Windows - Installation & User Guide

## Overview

DocuBrain is an intelligent document processing platform that runs completely on your Windows PC. It includes:

- **DocuBrain.exe** - Main desktop application with GUI
- **DocuBrainRouter.exe** - Service that bridges to Ollama (local AI models)

Both applications are standalone Windows executables - **no Python installation required!**

---

## System Requirements

- **Windows 10 or Windows 11** (64-bit)
- **Ollama** - For AI model inference (download from https://ollama.ai)
- **4GB+ RAM** recommended
- **2GB disk space** for the application

---

## Installation

### Method 1: Using the Installer (Recommended)

1. **Download** or extract DocuBrain installer files
2. **Right-click** `Install.ps1` and select "Run with PowerShell"
   - Alternatively: Open PowerShell as Administrator and run:
     ```powershell
     powershell -ExecutionPolicy Bypass -File Install.ps1
     ```
3. **Follow the prompts** - installer will:
   - Create `C:\Program Files\DocuBrain`
   - Copy DocuBrain.exe and DocuBrainRouter.exe
   - Create Desktop and Start Menu shortcuts

### Method 2: Manual Installation

1. Create folder: `C:\Program Files\DocuBrain`
2. Copy files to this folder:
   - `DocuBrain.exe`
   - `DocuBrainRouter.exe`
   - `start_router.bat`
3. Create desktop shortcut pointing to `DocuBrain.exe`

---

## Setup

### Step 1: Install Ollama

1. Download Ollama from https://ollama.ai
2. Run the installer and complete setup
3. Open Command Prompt or PowerShell and run:
   ```
   ollama pull phi3:mini
   ```
   (or your preferred model - see [Ollama Models](https://ollama.ai/library))

### Step 2: Verify Ollama is Running

The Ollama application should be running. To verify:

```
curl http://localhost:11434/api/tags
```

If you see a JSON response with a list of models, Ollama is ready!

### Step 3: Start DocuBrain

1. **Double-click** the DocuBrain shortcut on your Desktop
2. **Or** search for "DocuBrain" in the Start Menu and click it

The application will:
- Start the Router service (DocuBrainRouter.exe) automatically
- Connect to Ollama on your local machine
- Open the DocuBrain user interface

---

## First Use

### In DocuBrain:

1. **Documents Tab**
   - Click "Browse Folder" to select a folder containing documents
   - Or "Import Files" to add individual documents
   - Supported formats: PDF, DOCX, PPTX, XLSX, TXT

2. **Chat Tab**
   - Ask questions about your documents
   - The AI will analyze and respond based on your document content

3. **Analytics Tab**
   - View statistics about your documents and queries

---

## Troubleshooting

### "App can't run on your PC" Error

This usually means:
- Wrong Windows version (needs 64-bit Windows 10/11)
- Missing Visual C++ runtime libraries

**Solution:**
- Download Visual C++ Redistributable: https://learn.microsoft.com/en-US/cpp/windows/latest-supported-vc-redist
- Install and restart Windows

### Connection to Ollama Failed

**Check if Ollama is running:**
```
curl http://localhost:11434/api/health
```

Should return: `{"status":"success"}`

**If not running:**
- Restart the Ollama application
- Or manually start the Router: Double-click `start_router.bat` in installation folder

### Router doesn't start automatically

**Manual Start:**
1. Navigate to `C:\Program Files\DocuBrain`
2. Double-click `start_router.bat`
3. A command window should appear briefly

---

## Uninstallation

1. Open **Control Panel** → **Programs and Features**
2. Find **DocuBrain** in the list
3. Click **Uninstall**

Or manually:
1. Delete the `C:\Program Files\DocuBrain` folder
2. Delete the desktop shortcut
3. Delete the Start Menu folder

---

## Performance Tips

- **Smaller models are faster**: Use `tinyllama:1.1b` for speed, `phi3:mini` for quality
- **GPU acceleration**: If your PC has NVIDIA GPU, install CUDA for faster inference
- **Batch operations**: Process multiple documents at once for better performance

---

## Advanced: Custom Configuration

### Change Ollama Host

Edit the Router configuration (if needed):
```
set OLLAMA_HOST=http://your-custom-host:11434
```

### Use Different AI Models

In Ollama, pull additional models:
```
ollama pull llama2
ollama pull mistral
ollama pull neural-chat
```

Then select in DocuBrain's Settings.

---

## Support & Documentation

- **GitHub**: [Link to your repo]
- **Issues**: Report bugs and feature requests on GitHub
- **Documentation**: See `README.md` in the installation folder

---

## License

DocuBrain is released under [Your License]. See LICENSE file for details.

---

**Enjoy intelligent document processing on your Windows PC!** 🚀

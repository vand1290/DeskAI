# DocuBrain Starter (Offline, Local-Only)

This starter packs an **all–open-source** stack to run local LLMs, organize documents (OCR), and expose a simple UI — packaged to install on Windows with one click.

## What's inside
- **docker-compose.yml** – Orchestrates services (Ollama, UI, Router, Worker, Postgres+pgvector, MinIO, Caddy).
- **Auto hardware check** – Picks 3 models out of a pool of 6 based on VRAM/RAM/disk.
- **Worker** – Python watcher: OCR (PaddleOCR), PDF text extraction (PyMuPDF), routing/organizing to folders.
- **Router** – Tiny FastAPI service that chooses the best model per request and exposes `/route`.
- **Installer** – PowerShell scripts to import images, run hardware check, and start the stack.
- **Config templates** – `.env`, `models.json`.

## Key Features
- **Hardware Detection** - Automatically detects CPU, RAM, GPU, and storage
- **Adaptive Model Selection** - Chooses optimal models (2B-7B) based on hardware
- **Ollama Integration** - Downloads and manages LLMs automatically
- **Document Sorting/Cataloging** - Intelligent document organization system
- **Neural Network Brain Logo** - Professional branding
- **Blob Storage Integration** - Handles large document collections
- **Powerful UI** - Modern interface with advanced functionality

## Quick start (Windows 11)
1. Install **Docker Desktop** and ensure WSL2 is enabled.
2. Run `docubrain.exe` to start the application. (Included here as a placeholder - build from `docbrain.py` via PyInstaller for production.)
3. Open **https://localhost/** → login (username: docbrain, password: docbrain).

> GPU is optional. If not detected, the installer selects lighter models and performance will be lower (CPU-only).

## Default services/ports
- UI: proxied behind **Caddy** on `https://localhost/` (self-signed TLS, Basic Auth).
- Ollama API: available internally at `http://ollama:11434`.
- Postgres: internal.
- MinIO: internal (use the worker only).

## Model Selection Based on Hardware
DocuBrain automatically selects the best models for your system (see `installer/hardware_check.py`).
Running the detector now stores the chosen tier, ordered model list, and a hardware snapshot in `config/models.json` so the router and UI can react immediately without re-probing the machine.

## One-click Windows setup
To perform an elevated install and launch all services automatically, run:
```powershell
python installer\setup_launcher.py
```
Run from an elevated shell (or the launcher will prompt for elevation). Python 3.11 and Docker Desktop must already be installed and Docker Desktop running.

You can package it as `setup.exe` with PyInstaller:
```powershell
pip install pyinstaller
pyinstaller --onefile --noconsole installer\setup_launcher.py --name setup
```
Place the resulting executable back in `installer\` and double-click it (runs as Administrator). The launcher copies the project to `%ProgramFiles%\DocuBrain`, runs the hardware detector, and brings up the Docker stack.

## Packaging
To build `docubrain.exe` locally:
```bash
pip install pyinstaller pillow
pyinstaller --onefile --windowed --icon=assets/logo.png docbrain.py
```

---

**License**: MIT (for this starter). Each dependency has its own license.

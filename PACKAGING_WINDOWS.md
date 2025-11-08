DocuBrain Windows Packaging Plan

Goal
- Ship a Windows-first product as .exe files. Over time, expand to macOS/Linux with analogous bundles.

What we package
1) DocuBrain.exe (Desktop app)
   - Based on `desktop-app/main.py` (CustomTkinter UI)
   - Uses local SQLite database at `%USERPROFILE%\DocuBrain\docubrain.db`
   - Stores documents and extracted content on the local filesystem (no MinIO required)
   - Talks to the model Router (DocuBrainRouter.exe) if available; otherwise it can talk directly to Ollama on `http://localhost:11434`

2) DocuBrainRouter.exe (Model Router)
   - Based on `router/router.py` (FastAPI + Uvicorn)
   - Exposes HTTP on `http://localhost:8000`
   - Reads model recommendations from `config/models.json` (mounted next to the exe or in `%PROGRAMDATA%\DocuBrain\config`)
   - Forwards generation to Ollama (`OLLAMA_HOST` env, default `http://localhost:11434`)

Why this split?
- Keeps the desktop UI lean.
- Router can be upgraded independently (and optionally run as a background process or Windows service).

Build prerequisites
- Use Python 3.11 (recommended) for broad wheel availability on Windows.
- Install PyInstaller in your build environment.

Build steps
1) Desktop app (from `docbrain-starter/desktop-app`):
   - `pyinstaller --clean --noconfirm DocuBrain.spec`
   - Output: `desktop-app/dist/DocuBrain.exe`

2) Router (from `docbrain-starter/router`):
   - `pyinstaller --clean --noconfirm Router.spec`
   - Output: `router/dist/DocuBrainRouter.exe`

Runtime
- Place both EXEs in the same folder (optional but recommended)
- Create a `.env` or set env vars for overrides:
  - `ROUTER_URL=http://localhost:8000`
  - `OLLAMA_URL=http://localhost:11434` (if desktop app talks directly)
  - `OLLAMA_HOST=http://localhost:11434` (for the router)

Installer (next)
- Use the existing `installer/` project to create a Windows installer that:
  - Copies `DocuBrain.exe` and `DocuBrainRouter.exe` into `C:\Program Files\DocuBrain\`
  - Copies `config\models.json` to `%PROGRAMDATA%\DocuBrain\config\`
  - Creates Start Menu shortcuts
  - Optionally registers Router as a startup task or Windows Service

Notes
- The Docker stack remains useful for power users and server mode.
- The `worker/` heavy OCR pipeline is not part of the initial EXE packaging due to large ML dependencies. The desktop app already performs lightweight text extraction (PDF, DOCX, PPTX, XLSX, CSV, TXT). We can revisit packaging advanced OCR/embedding as a separate optional EXE later.

DocBrain Starter - Quick local run instructions

This repository contains several components:
- `desktop-app/` - Native desktop app (CustomTkinter + heavy deps)
- `ui/` - Streamlit web UI
- `worker/` - Background worker that monitors a folder, extracts text and uploads to MinIO/Postgres
- `router/` - Router/service that coordinates AI models (optional)

Quick steps to get a minimal local environment (Windows / PowerShell):

1) Copy `.env.sample` to `.env` and fill values (especially `DATABASE_URL`). For quick local testing you can set:
   DATABASE_URL=sqlite:///./data.db

2) Create a Python virtual environment and install UI + Desktop dependencies. From repository root (recommended):

   # Run the included setup script (PowerShell)
   .\scripts\setup_local.ps1

   # Or manual commands:
   python -m venv .venv
   .\.venv\Scripts\python.exe -m pip install --upgrade pip
   .\.venv\Scripts\python.exe -m pip install -r ui\requirements.txt
   .\.venv\Scripts\python.exe -m pip install -r desktop-app\requirements.txt

3) Start required services (recommended using Docker Compose):
   - The `docker/` folder contains docker-compose and helper files to start Postgres, MinIO and the router.

   From the `docker/` directory run (requires Docker Desktop):
     docker compose up -d

   Wait for Postgres and MinIO to be ready.

4) Run the Streamlit UI (lightweight):
   .\.venv\Scripts\python.exe -m streamlit run ui\app.py

5) Run the Desktop App (heavy GUI):
   .\.venv\Scripts\python.exe desktop-app\main.py

Notes and troubleshooting:
- Worker requires heavy ML deps (PaddleOCR, PyMuPDF, sentence-transformers, torch). These may require GPU toolkits or take a long time to install. Consider running worker inside Docker using the provided `docker/` tooling.
- If you prefer a minimal experience, set `DATABASE_URL` to an sqlite file and run only the Streamlit UI. The UI may still expect a Postgres schema; for full functionality you should run Postgres.
- If any module import fails, run the appropriate `pip install` command shown above and re-run the failing script.

If you want, I can:
- Attempt to install and run a minimal smoke-test here (will install packages into the project's venv).
- Create a lightweight fallback so the Streamlit UI can run with sqlite without Postgres (requires small code edits).
- Attempt to containerize and run the worker via Docker Compose.

Tell me which of these you'd like me to do next and I will proceed.

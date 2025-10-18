# DeskAI Roadmap

This file tracks planned features, deferred ideas, and architecture notes for DeskAI.  
**Current Release:** v1.0 MVP (Offline Windows .exe, 5 core tools, professional UI)

---

## 🟢 MVP (v1.0) — Current Focus

- 5 core secretary tools: Summarize, Organize, Extract, Compose, Search
- Modern UI (6 components, keyboard-first, high-contrast)
- 100% offline, secure, deterministic flows
- Auto-run as signed Windows .exe (Tauri)
- Data privacy: local storage, encryption, no telemetry

---

## 📌 Pinned Roadmap & Future Features

> The following features are planned for future versions (v1.1+):

- GPU/DirectML builds, model hot-swap
- STT/TTS (whisper.cpp, Coqui-TTS)
- Advanced organizer DSL & plugin SDK
- PII redaction & advanced privacy onboarding
- Portable mode polish, update import system
- HTR improvements, reranker, citation mapping
- Comprehensive metrics, golden set, and more
- Recovery key wizard, user onboarding enhancements
- Advanced error handling & support bundle export

---

## 🧩 Architecture Structure (Reference)

<details>
<summary>Click to expand: DeskAI v1.0 Architecture Structure</summary>

```markdown
# DeskAI v1.0 Architecture — High-Level Structure

1. **Goals & Non‑Goals**  
   - Offline, Windows desktop, personal secretary; no cloud/collab.

2. **System Overview**  
   - UI Shell (Tauri, React)  
   - Orchestrator Core (Rust meta-agent)  
   - Tool Plugins (LLM-backed, 5 main tools)  
   - Job Manager (queue/logs)  
   - Local Models (llama.cpp etc)  
   - Data Layer (SQLite+FAISS)  
   - File I/O, OCR/PDF Stack, Indexers/Parsers

3. **Tech Stack**  
   - Tauri, React, Rust, Tailwind, shadcn/ui, Framer Motion  
   - llama.cpp, whisper.cpp (optional), Tesseract, PaddleOCR, pdfium, FAISS, SQLite, libsodium

4. **Meta-Agent Orchestrator**  
   - Planner-Executor, tool-use graph, YAML plans, JSONL trace, guardrails  
   - Tool ABI: Rust trait interface

5. **Secretary Tools**  
   - Summarize & Brief  
   - Organize & Classify  
   - Extract & Tables  
   - Compose & Edit  
   - Search & Recall

6. **Data Layer & Indexing**  
   - %APPDATA% storage layout  
   - SQLite schema: documents, pages, chunks, citations, tags, jobs  
   - Indexers: file watcher, pipeline for ingest/OCR/embed

7. **Models & Routing**  
   - Baseline and lite LLMs  
   - Heuristic router, hot-swap, context/RAG

8. **OCR & PDF Stack**  
   - Tesseract/PaddleOCR/TrOCR  
   - pdfium/camelot/pdfplumber  
   - Per-page quality, word boxes, table extraction

9. **UI Architecture (6 Components)**  
   - Command Bar  
   - Workspace  
   - Jobs & Logs  
   - Organizer  
   - Template Studio  
   - Settings & Models

10. **Security & Privacy**  
    - No-network mode  
    - Encryption at rest  
    - Model integrity, PII redaction

11. **Job Manager & Reliability**  
    - Persistent queue, logs, backpressure, support bundle

12. **Packaging & Installer Plan**  
    - CPU/CUDA/DirectML profiles  
    - MSI/NSIS installer, portable mode, code signing

13. **Testing & Metrics**  
    - Golden set, performance, determinism, VM install test

14. **Templates & Prompting**  
    - System prompts, doc templates, citation mapping

15. **Error Handling & UX Safeguards**  
    - Clear errors, retry, guardrails for hallucination

16. **Bill of Materials (OSS)**  
    - List of all core open-source libraries and tools

17. **Roadmap**  
    - MVP, v1.0, v1.1 milestones

18. **Appendix**
    - ASCII flow, DSL rules, security notes

```
</details>

---

## 🚀 How to Contribute

- See open issues for tasks and feature requests.
- Suggest improvements or new integrations by opening an issue or PR.
- Add new ideas here for future consideration.

---

_Last updated: 2025-10-16_
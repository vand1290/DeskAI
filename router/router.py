import json
import os
import threading
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import requests
from fastapi import FastAPI, HTTPException

app = FastAPI()

#  ============================================================================
# CRITICAL: For Windows standalone EXE - HARDCODE Ollama connection
# Do NOT read from environment variable (often misconfigured as 0.0.0.0:11434)
# NOTE: Port 11434 is blocked by Windows. Using 12345 instead.
# ==========================================================================
OLLAMA_HOST = "http://localhost:12345"  # HARDCODED - do not change

# Verify it's correct format
assert OLLAMA_HOST.startswith("http://") or OLLAMA_HOST.startswith("https://"), \
    f"OLLAMA_HOST must have http(s):// prefix, got: {OLLAMA_HOST}"
assert "0.0.0.0" not in OLLAMA_HOST, \
    f"OLLAMA_HOST must use localhost, not 0.0.0.0: {OLLAMA_HOST}"
assert "localhost" in OLLAMA_HOST or "127.0.0.1" in OLLAMA_HOST, \
    f"OLLAMA_HOST must use localhost or 127.0.0.1: {OLLAMA_HOST}"

# Debug output
print("[ROUTER] OLLAMA_HOST is HARDCODED to: " + OLLAMA_HOST)
print("[ROUTER] Will connect to Ollama at: " + OLLAMA_HOST + "/api/...")

MODEL_CONFIG_PATH = Path(os.getenv("MODEL_CONFIG_PATH", "./config/models.json"))
REQUEST_TIMEOUT = float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "120"))
FALLBACK_MODELS = ["tinyllama:1.1b", "phi3:mini", "stablelm2:1.6b"]

_config_lock = threading.Lock()
_cached_config: Dict[str, Any] = {"data": None, "mtime": None}


def _load_model_config(force_reload: bool = False) -> Dict[str, Any]:
    """Load and cache the shared model configuration."""
    with _config_lock:
        try:
            stat = MODEL_CONFIG_PATH.stat()
        except FileNotFoundError:
            # Nothing has been generated yet; return a sensible default
            return {
                "models": FALLBACK_MODELS,
                "tier": "D",
                "system_info": {},
                "generated_at_utc": None,
            }

        cached_mtime = _cached_config.get("mtime")
        if force_reload or cached_mtime != stat.st_mtime:
            with MODEL_CONFIG_PATH.open("r", encoding="utf-8") as fh:
                _cached_config["data"] = json.load(fh)
            _cached_config["mtime"] = stat.st_mtime

        return _cached_config["data"]


def _select_model(models: Optional[List[str]]) -> str:
    if models:
        return models[0]
    return FALLBACK_MODELS[0]


@app.get("/route")
def route_request(prompt: str):
    config = _load_model_config()
    model = _select_model(config.get("models"))

    try:
        # Use literal string to avoid any environment variable interference
        url = "http://localhost:11434/api/generate"
        response = requests.post(
            url,
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=REQUEST_TIMEOUT,
        )
    except requests.RequestException as exc:
        raise HTTPException(status_code=503, detail=f"Ollama request failed: {exc}") from exc

    if response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Ollama returned {response.status_code}: {response.text}",
        )

    return response.json()


@app.get("/health")
def health_check():
    config = _load_model_config()
    return {
        "status": "healthy",
        "tier": config.get("tier", "D"),
        "resources": config.get("system_info", {}),
        "generated_at_utc": config.get("generated_at_utc"),
        "active_model": _select_model(config.get("models")),
        "timestamp_utc": datetime.utcnow().isoformat(timespec="seconds"),
    }


@app.get("/models")
def get_models():
    try:
        # Use literal string instead of variable to avoid any environment variable interference
        url = "http://localhost:11434/api/tags"
        response = requests.get(url, timeout=REQUEST_TIMEOUT)
    except requests.RequestException as exc:
        raise HTTPException(status_code=503, detail=f"Ollama tags request failed: {exc}") from exc

    if response.status_code == 200:
        return response.json()

    raise HTTPException(status_code=response.status_code, detail=response.text)


@app.get("/recommended-models")
def get_recommended_models():
    config = _load_model_config()
    return {
        "tier": config.get("tier", "D"),
        "models": config.get("models", FALLBACK_MODELS),
        "system_info": config.get("system_info", {}),
        "generated_at_utc": config.get("generated_at_utc"),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

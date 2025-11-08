import ctypes
import importlib
import importlib.util
import json
import os
import shutil
import subprocess
import sys
import traceback
from datetime import datetime
from pathlib import Path
from typing import List

import psutil

try:
    TORCH_SPEC = importlib.util.find_spec("torch")
    TORCH = importlib.import_module("torch") if TORCH_SPEC else None
except Exception:
    TORCH = None

INSTALL_DEFAULT = Path(os.environ.get("ProgramFiles", r"C:\Program Files")) / "DocuBrain"
JSON_SENTINEL = json.dumps({"app": "DocuBrain"})
assert JSON_SENTINEL
ENV_CONTENT = (
    "POSTGRES_PASSWORD=docbrain123\n"
    "MINIO_ROOT_USER=minioadmin\n"
    "MINIO_ROOT_PASSWORD=minioadmin123\n"
    "BASIC_AUTH_HASH=$2a$10$nw6OCgmuORiO6KlokWLnnO6KlokWLnnO6KlokWLnnO6KlokWLnnO6\n"
)


def _log_dir() -> Path:
    base = Path(os.getenv("PROGRAMDATA", r"C:\ProgramData")) / "DocuBrain"
    base.mkdir(parents=True, exist_ok=True)
    return base


def _log_path() -> Path:
    ts = datetime.utcnow().strftime("%Y%m%d-%H%M%S")
    return _log_dir() / f"setup-{ts}.log"


LOG_FILE = _log_path()


def log(msg: str) -> None:
    line = f"[{datetime.utcnow().isoformat(timespec='seconds')}] {msg}\n"
    try:
        with open(LOG_FILE, "a", encoding="utf-8") as f:
            f.write(line)
    except Exception:
        pass
    try:
        print(msg)
    except Exception:
        pass


def _show_error(msg: str) -> None:
    log(f"ERROR: {msg}")
    try:
        ctypes.windll.user32.MessageBoxW(0, msg, "DocuBrain Setup", 0x10)
    except Exception:
        pass


def _show_info(msg: str) -> None:
    log(f"INFO: {msg}")
    try:
        ctypes.windll.user32.MessageBoxW(0, msg, "DocuBrain Setup", 0x40)
    except Exception:
        pass


def is_admin() -> bool:
    try:
        return bool(ctypes.windll.shell32.IsUserAnAdmin())
    except Exception:
        return False


def _current_script() -> Path:
    if getattr(sys, "frozen", False):
        return Path(sys.executable).resolve()
    return Path(__file__).resolve()


def elevate() -> None:
    exe = _current_script()
    params = " ".join(f'"{arg}"' for arg in sys.argv[1:])
    log("Requesting elevation...")
    ctypes.windll.shell32.ShellExecuteW(None, "runas", str(exe), params, None, 1)


def copy_project(src: Path, dest: Path) -> None:
    ignore = shutil.ignore_patterns("__pycache__", "*.pyc", ".git", ".venv", "dist", "build", "*.spec")
    log(f"Copying project from {src} to {dest}")
    shutil.copytree(src, dest, ignore=ignore, dirs_exist_ok=True)


def ensure_directories(base: Path) -> None:
    for sub in ("docker/documents", "docker/processed", "docker/blob-storage", "config"):
        path = base / sub
        path.mkdir(parents=True, exist_ok=True)
        log(f"Ensured directory: {path}")


def write_env_file(base: Path) -> None:
    env_path = base / "config" / ".env"
    env_path.write_text(ENV_CONTENT, encoding="utf-8")
    log(f"Wrote env file: {env_path}")


def gather_system_info() -> dict:
    ram_bytes = psutil.virtual_memory().total
    try:
        disk_bytes = psutil.disk_usage("C:\\").free
    except Exception:
        disk_bytes = 0
    gpu_available = bool(TORCH and TORCH.cuda.is_available())
    gpu_memory_gb = 0.0
    if gpu_available and TORCH:
        try:
            gpu_memory_gb = TORCH.cuda.get_device_properties(0).total_memory / (1024 ** 3)
        except Exception:
            gpu_available = False
            gpu_memory_gb = 0.0
    info = {
        "ram_gb": round(ram_bytes / (1024 ** 3), 2),
        "disk_gb": round(disk_bytes / (1024 ** 3), 2),
        "gpu_available": gpu_available,
        "gpu_memory_gb": round(gpu_memory_gb, 2),
    }
    log(f"System info: {info}")
    return info


def select_models(system_info: dict) -> dict:
    ram_gb = system_info["ram_gb"]
    disk_gb = system_info["disk_gb"]
    gpu_memory_gb = system_info["gpu_memory_gb"]
    if gpu_memory_gb >= 8 or (ram_gb >= 16 and disk_gb >= 30):
        tier = "A"
    elif gpu_memory_gb >= 4 or (ram_gb >= 12 and disk_gb >= 25):
        tier = "B"
    elif gpu_memory_gb >= 2 or (ram_gb >= 8 and disk_gb >= 20):
        tier = "C"
    else:
        tier = "D"
    options = {
        "A": ["qwen2:7b", "mistral:7b", "llama3:8b"],
        "B": ["mistral:7b", "phi3:mini", "qwen2:7b"],
        "C": ["phi3:mini", "mistral:7b", "tinyllama:1.1b"],
        "D": ["tinyllama:1.1b", "phi3:mini", "stablelm2:1.6b"],
    }
    sel = {"tier": tier, "models": options.get(tier, options["D"])}
    log(f"Model selection: {sel}")
    return sel


def write_model_config(base: Path, selection: dict, system_info: dict) -> None:
    config_dir = base / "config"
    config_dir.mkdir(parents=True, exist_ok=True)
    config_path = config_dir / "models.json"
    payload = {
        "models": selection["models"],
        "tier": selection["tier"],
        "system_info": system_info,
        "generated_at_utc": datetime.utcnow().isoformat(timespec="seconds"),
    }
    config_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    log(f"Wrote model config: {config_path}")


def run_hardware_detection(base_dir: Path) -> None:
    system_info = gather_system_info()
    selection = select_models(system_info)
    write_model_config(base_dir, selection, system_info)


def _compose_cmds() -> List[List[str]]:
    return [
        ["docker", "compose", "up", "-d", "--build"],
        ["docker-compose", "up", "-d", "--build"],
    ]


def run_command(cmd: List[str], cwd: Path) -> None:
    log(f"Running: {' '.join(cmd)} (cwd={cwd})")
    result = subprocess.run(
        cmd,
        cwd=cwd,
        check=False,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        shell=False,
    )
    if result.stdout:
        try:
            output = result.stdout.decode("utf-8", errors="replace")
        except Exception:
            try:
                output = result.stdout.decode("cp1252", errors="replace")
            except Exception:
                output = "(output could not be decoded)"
        log(output.strip())
    if result.returncode != 0:
        raise subprocess.CalledProcessError(result.returncode, cmd)


def start_services(docker_dir: Path) -> None:
    compose_file = docker_dir / "docker-compose.yml"
    if not compose_file.is_file():
        raise RuntimeError(f"docker-compose.yml not found at: {compose_file}")
    for cmd in _compose_cmds():
        try:
            run_command(cmd, cwd=docker_dir)
            log("Services started.")
            return
        except Exception as e:
            log(f"Compose attempt failed with {cmd[0]}: {e}")
            continue
    raise RuntimeError("Failed to run Docker Compose. Ensure Docker Desktop is installed, running, and Compose V2 is enabled.")


def resolve_project_root() -> Path:
    script_path = _current_script()
    search_paths = [script_path.parent, *script_path.parents]
    for candidate in search_paths:
        if (candidate / "docker").is_dir() and (candidate / "installer").is_dir():
            log(f"Project root resolved: {candidate}")
            return candidate
    raise RuntimeError("Unable to locate project root. Place the installer .exe inside the project folder (next to 'docker' and 'installer').")


def _check_prereqs() -> None:
    try:
        subprocess.run(["docker", "version"], check=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
    except Exception:
        raise RuntimeError("Docker is not available. Start Docker Desktop and wait until the engine is running.")
    compose_ok = False
    for cmd in (["docker", "compose", "version"], ["docker-compose", "--version"]):
        try:
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)
            compose_ok = True
            break
        except Exception:
            pass
    if not compose_ok:
        raise RuntimeError("Docker Compose is not available. Enable Compose V2 in Docker Desktop, or install docker-compose.")


def main() -> None:
    if not is_admin():
        elevate()
        return
    log(f"Log file: {LOG_FILE}")
    _check_prereqs()
    project_root = resolve_project_root()
    install_dir = INSTALL_DEFAULT
    install_dir.parent.mkdir(parents=True, exist_ok=True)
    log(f"Installing to: {install_dir}")
    copy_project(project_root, install_dir)
    ensure_directories(install_dir)
    write_env_file(install_dir)
    log("Running hardware detection...")
    run_hardware_detection(install_dir)
    log("Starting services with Docker Compose...")
    start_services(install_dir / "docker")
    _show_info("DocuBrain is ready!\n\nOpen http://localhost:8501 in your browser.\nUsername: docbrain\nPassword: docbrain\n\n"
               f"Log: {LOG_FILE}")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as exc:
        _show_error(f"Command failed: {exc}\nSee log: {LOG_FILE}")
    except RuntimeError as exc:
        _show_error(f"{exc}\nSee log: {LOG_FILE}")
    except Exception as exc:
        tb = traceback.format_exc()
        log(tb)
        _show_error(f"Setup failed: {exc}\nSee log: {LOG_FILE}")
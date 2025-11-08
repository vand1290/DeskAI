import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, Any

import importlib
import psutil

torch = None
spec = importlib.util.find_spec("torch")
if spec:
    torch = importlib.import_module("torch")  # type: ignore

def get_system_info() -> Dict[str, Any]:
    """Get detailed system information with graceful fallbacks."""
    ram_bytes = psutil.virtual_memory().total
    # Use the root of the current drive for disk usage so Windows paths behave
    disk_root = Path(os.path.abspath(os.sep))
    disk_bytes = psutil.disk_usage(disk_root).free

    gpu_available = bool(torch and torch.cuda.is_available())
    gpu_memory_gb = 0.0
    if gpu_available and torch:  # torch is optional
        try:
            gpu_memory_gb = torch.cuda.get_device_properties(0).total_memory / (1024 ** 3)
        except Exception:
            gpu_available = False
            gpu_memory_gb = 0.0

    return {
        "ram_gb": round(ram_bytes / (1024 ** 3), 2),
        "disk_gb": round(disk_bytes / (1024 ** 3), 2),
        "gpu_available": gpu_available,
        "gpu_memory_gb": round(gpu_memory_gb, 2),
    }

def select_models(system_info: Dict[str, Any]) -> Dict[str, Any]:
    """Select appropriate models based on system resources"""
    ram_gb = system_info["ram_gb"]
    disk_gb = system_info["disk_gb"]
    gpu_memory_gb = system_info["gpu_memory_gb"]
    
    # Determine tier based on resources
    if gpu_memory_gb >= 8 or (ram_gb >= 16 and disk_gb >= 30):
        tier = "A"  # High-end
    elif gpu_memory_gb >= 4 or (ram_gb >= 12 and disk_gb >= 25):
        tier = "B"  # Mid-high
    elif gpu_memory_gb >= 2 or (ram_gb >= 8 and disk_gb >= 20):
        tier = "C"  # Mid-range
    else:
        tier = "D"  # Low-end
    
    # Model recommendations based on tier
    model_recommendations = {
        "A": ["qwen2:7b", "mistral:7b", "llama3:8b"],
        "B": ["mistral:7b", "phi3:mini", "qwen2:7b"],
        "C": ["phi3:mini", "mistral:7b", "tinyllama:1.1b"],
        "D": ["tinyllama:1.1b", "phi3:mini", "stablelm2:1.6b"]
    }
    
    selection = {
        "tier": tier,
        "models": model_recommendations.get(tier, model_recommendations["D"])
    }

    return selection


def write_model_config(selection: Dict[str, Any], system_info: Dict[str, Any]) -> Path:
    """Persist model recommendations and hardware snapshot for other services."""
    config_dir = Path(__file__).resolve().parent.parent / "config"
    config_dir.mkdir(parents=True, exist_ok=True)
    config_path = config_dir / "models.json"

    payload = {
        "models": selection["models"],
        "tier": selection["tier"],
        "system_info": system_info,
        "generated_at_utc": datetime.utcnow().isoformat(timespec="seconds"),
    }

    with config_path.open("w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    return config_path

def main():
    print("DocBrain Hardware Detection")
    print("===========================")
    
    system_info = get_system_info()
    print(f"RAM: {system_info['ram_gb']:.2f} GB")
    print(f"Disk Space: {system_info['disk_gb']:.2f} GB")
    print(f"GPU Available: {system_info['gpu_available']}")
    if system_info['gpu_available']:
        print(f"GPU Memory: {system_info['gpu_memory_gb']:.2f} GB")
    
    model_selection = select_models(system_info)
    print(f"\nHardware Tier: {model_selection['tier']}")
    print("Recommended Models:")
    for model in model_selection['models']:
        print(f"  - {model}")
    
    config_path = write_model_config(model_selection, system_info)
    
    print(f"\nModel configuration saved to {config_path}")

if __name__ == "__main__":
    main()

import requests
import os

print("Testing Ollama connection...")
print(f"OLLAMA_HOST env var: {os.getenv('OLLAMA_HOST', 'NOT SET')}")

# Test direct connection
try:
    r = requests.get("http://localhost:11434/api/tags", timeout=10)
    print(f"✓ Direct Ollama: {r.status_code} - {len(r.json()['models'])} models")
except Exception as e:
    print(f"✗ Direct Ollama error: {e}")

# Test what router would use
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
if not OLLAMA_HOST.startswith(("http://", "https://")):
    OLLAMA_HOST = f"http://{OLLAMA_HOST}"

print(f"\nRouter would connect to: {OLLAMA_HOST}")
try:
    r = requests.get(f"{OLLAMA_HOST}/api/tags", timeout=10)
    print(f"✓ Router-style: {r.status_code}")
except Exception as e:
    print(f"✗ Router-style error: {e}")

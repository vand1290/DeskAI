import os
print(f"OLLAMA_HOST from environment: '{os.getenv('OLLAMA_HOST', 'NOT SET')}'")

# Simulate what router does
OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")
if not OLLAMA_HOST.startswith(("http://", "https://")):
    OLLAMA_HOST = f"http://{OLLAMA_HOST}"

print(f"After adding http://: '{OLLAMA_HOST}'")

# Fix 0.0.0.0
OLLAMA_HOST = OLLAMA_HOST.replace("://0.0.0.0:", "://localhost:").replace("://0.0.0.0/", "://localhost/")
if "0.0.0.0" in OLLAMA_HOST:
    OLLAMA_HOST = OLLAMA_HOST.replace("0.0.0.0", "localhost")

print(f"After localhost fix: '{OLLAMA_HOST}'")

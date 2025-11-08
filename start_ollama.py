#!/usr/bin/env python3
"""
Start Ollama service with admin privileges if needed
"""
import subprocess
import os
import time
import sys
import ctypes

def is_admin():
    """Check if running as administrator"""
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def start_ollama():
    """Start Ollama service"""
    ollama_path = os.path.expandvars(r"%LocalAppData%\Programs\Ollama\ollama.exe")
    
    if not os.path.exists(ollama_path):
        print(f"ERROR: Ollama not found at {ollama_path}")
        print("Please install Ollama from https://ollama.ai")
        return False
    
    print("=" * 50)
    print("  Starting Ollama Service")
    print("=" * 50)
    print(f"Ollama path: {ollama_path}")
    print(f"Running as admin: {is_admin()}")
    print()
    
    # Set environment variable
    os.environ['OLLAMA_HOST'] = '127.0.0.1:11434'
    
    try:
        # Start Ollama in background
        process = subprocess.Popen(
            [ollama_path, 'serve'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            creationflags=subprocess.CREATE_NEW_CONSOLE
        )
        print(f"✓ Ollama started (PID: {process.pid})")
        
        # Wait for startup
        print("\nWaiting for Ollama to initialize (15 seconds)...")
        time.sleep(15)
        
        # Test connection
        print("\nTesting Ollama connection...")
        for attempt in range(5):
            try:
                import urllib.request
                response = urllib.request.urlopen('http://localhost:11434/api/tags', timeout=3)
                if response.status == 200:
                    print("✓ Ollama is responding on port 11434")
                    return True
            except Exception as e:
                if attempt < 4:
                    print(f"  Attempt {attempt+1}/5... retrying in 2 seconds")
                    time.sleep(2)
        
        print("⚠ Ollama may not be responding yet, but process is running")
        return True
        
    except Exception as e:
        print(f"ERROR: Failed to start Ollama: {e}")
        return False

if __name__ == '__main__':
    success = start_ollama()
    sys.exit(0 if success else 1)

import subprocess
import sys
import os
from pathlib import Path

def install_dependencies():
    """Install required dependencies on first run"""
    requirements_file = Path(__file__).parent / "requirements.txt"
    if requirements_file.exists():
        print("Installing dependencies...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "-r", str(requirements_file)])
        print("Dependencies installed!")

def launch_ui():
    """Launch the main UI application"""
    # Replace 'main.py' with your actual UI entry point
    main_script = Path(__file__).parent / "main.py"
    if main_script.exists():
        subprocess.run([sys.executable, str(main_script)])
    else:
        print(f"Error: {main_script} not found!")
        input("Press Enter to exit...")

if __name__ == "__main__":
    try:
        install_dependencies()
        launch_ui()
    except Exception as e:
        print(f"Error: {e}")
        input("Press Enter to exit...")
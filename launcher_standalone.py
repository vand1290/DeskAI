import sys
import subprocess
import os
from pathlib import Path

# Add bundled site-packages to path
if getattr(sys, 'frozen', False):
    bundle_dir = Path(sys._MEIPASS)
else:
    bundle_dir = Path(__file__).parent

def check_node_installed():
    """Check if Node.js is installed"""
    try:
        result = subprocess.run(['node', '--version'], 
                              capture_output=True, 
                              text=True)
        print(f"Node.js {result.stdout.strip()} found")
        return True
    except FileNotFoundError:
        print("ERROR: Node.js not found. Please install Node.js from https://nodejs.org/")
        input("Press Enter to exit...")
        return False

def install_dependencies():
    """Install npm dependencies"""
    try:
        print("Installing dependencies...")
        subprocess.run(['npm', 'install'], check=True)
        print("Dependencies installed!")
    except subprocess.CalledProcessError as e:
        print(f"Error installing dependencies: {e}")
        input("Press Enter to exit...")
        sys.exit(1)

def launch_app():
    """Launch the Tauri desktop app"""
    try:
        print("Starting DeskAI...")
        # Run the Tauri app
        subprocess.run(['npm', 'run', 'tauri:dev'], check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error launching app: {e}")
        input("Press Enter to exit...")
        sys.exit(1)

def launch_ui():
    """Launch the main UI application"""
    # Import and run your main UI module
    try:
        # Replace with your actual main module
        from main import main  # or: import main; main.run()
        main()
    except ImportError as e:
        print(f"Error importing main module: {e}")
        input("Press Enter to exit...")
    except Exception as e:
        print(f"Error launching UI: {e}")
        input("Press Enter to exit...")

if __name__ == "__main__":
    if not check_node_installed():
        sys.exit(1)
    
    install_dependencies()
    launch_app()
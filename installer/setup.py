import os
import sys
import shutil
import subprocess
import json
from pathlib import Path
import logging

def setup_logging():
    log_dir = Path("C:/ProgramData/DocuBrain")
    log_dir.mkdir(parents=True, exist_ok=True)
    
    from datetime import datetime
    log_file = log_dir / f"setup-{datetime.now().strftime('%Y%m%d-%H%M%S')}.log"
    
    logging.basicConfig(
        level=logging.INFO,
        format='[%(asctime)s] %(message)s',
        datefmt='%Y-%m-%dT%H:%M:%S',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler()
        ]
    )
    logging.info(f"Log file: {log_file}")
    return log_file

def get_project_root():
    """Get the project root directory"""
    if getattr(sys, 'frozen', False):
        exe_dir = Path(sys.executable).parent
        possible_roots = [
            exe_dir.parent,
            Path.cwd(),
            exe_dir / "docbrain-starter",
        ]
        
        for root in possible_roots:
            if (root / "docker" / "docker-compose.yml").exists():
                return root
        
        raise FileNotFoundError("Could not find project root with docker-compose.yml")
    else:
        return Path(__file__).parent.parent

def detect_hardware():
    """Detect system hardware capabilities"""
    import psutil
    
    ram_gb = psutil.virtual_memory().total / (1024**3)
    disk_gb = psutil.disk_usage('/').free / (1024**3)
    
    gpu_available = False
    gpu_memory_gb = 0.0
    
    try:
        result = subprocess.run(['nvidia-smi', '--query-gpu=memory.total', '--format=csv,noheader,nounits'],
                              capture_output=True, text=True, timeout=5)
        if result.returncode == 0:
            gpu_available = True
            gpu_memory_gb = float(result.stdout.strip().split('\n')[0]) / 1024
    except:
        pass
    
    return {
        'ram_gb': round(ram_gb, 2),
        'disk_gb': round(disk_gb, 2),
        'gpu_available': gpu_available,
        'gpu_memory_gb': round(gpu_memory_gb, 2)
    }

def select_models(hardware):
    """Select appropriate models based on hardware"""
    ram_gb = hardware['ram_gb']
    gpu_available = hardware['gpu_available']
    
    if gpu_available and ram_gb >= 32:
        tier = 'A'
        models = ['llama3:70b', 'mixtral:8x7b', 'codellama:34b']
    elif ram_gb >= 16:
        tier = 'B'
        models = ['mistral:7b', 'phi3:mini', 'qwen2:7b']
    else:
        tier = 'C'
        models = ['tinyllama:1.1b', 'phi3:mini']
    
    return {'tier': tier, 'models': models}

def run_installer():
    log_file = setup_logging()
    
    try:
        project_root = get_project_root()
        logging.info(f"Project root resolved: {project_root}")
        
        install_dir = Path("C:/Program Files/DocuBrain")
        logging.info(f"Installing to: {install_dir}")
        
        # Create user-accessible data directory
        user_data_dir = Path.home() / "DocuBrain"
        watch_folder = user_data_dir / "watch"
        documents_folder = user_data_dir / "documents"
        processed_folder = user_data_dir / "processed"
        
        logging.info(f"Creating user data directory: {user_data_dir}")
        
        for folder in [watch_folder, documents_folder, processed_folder]:
            folder.mkdir(parents=True, exist_ok=True)
            logging.info(f"Created: {folder}")
        
        # Copy project files
        if install_dir.exists():
            shutil.rmtree(install_dir)
        
        logging.info(f"Copying project from {project_root} to {install_dir}")
        shutil.copytree(project_root, install_dir, 
                       ignore=shutil.ignore_patterns('__pycache__', '*.pyc', '.git', 'dist', 'build', '.venv'))
        
        # Update docker-compose.yml to use user folders
        compose_file = install_dir / "docker" / "docker-compose.yml"
        compose_content = compose_file.read_text()
        
        # Replace volume paths
        compose_content = compose_content.replace(
            'volumes:\n      - watch_folder:/app/watch\n      - documents_folder:/app/documents\n      - processed_folder:/app/processed',
            f'volumes:\n      - {str(watch_folder).replace(chr(92), "/")}:/app/watch\n      - {str(documents_folder).replace(chr(92), "/")}:/app/documents\n      - {str(processed_folder).replace(chr(92), "/")}:/app/processed'
        )
        
        # Remove named volumes if using bind mounts
        if 'watch_folder:' in compose_content:
            lines = compose_content.split('\n')
            filtered_lines = []
            skip_until_next_section = False
            for line in lines:
                if line.strip() in ['watch_folder:', 'documents_folder:', 'processed_folder:']:
                    skip_until_next_section = True
                    continue
                if skip_until_next_section and line and not line.startswith(' '):
                    skip_until_next_section = False
                if not skip_until_next_section:
                    filtered_lines.append(line)
            compose_content = '\n'.join(filtered_lines)
        
        compose_file.write_text(compose_content)
        logging.info("Updated docker-compose.yml with user-accessible paths")
        
        # Create config directory
        config_dir = install_dir / "config"
        config_dir.mkdir(parents=True, exist_ok=True)
        
        # Create .env file
        env_file = config_dir / ".env"
        env_content = """POSTGRES_PASSWORD=docbrain123
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin123
"""
        env_file.write_text(env_content)
        logging.info(f"Wrote env file: {env_file}")
        
        # Detect hardware and select models
        logging.info("Running hardware detection...")
        hardware = detect_hardware()
        logging.info(f"System info: {hardware}")
        
        model_config = select_models(hardware)
        logging.info(f"Model selection: {model_config}")
        
        config_file = config_dir / "models.json"
        config_file.write_text(json.dumps(model_config, indent=2))
        logging.info(f"Wrote model config: {config_file}")
        
        # Start Docker Compose
        docker_dir = install_dir / "docker"
        logging.info("Starting services with Docker Compose...")
        
        compose_commands = [
            ['docker', 'compose', 'up', '-d', '--build'],
            ['docker-compose', 'up', '-d', '--build']
        ]
        
        success = False
        for cmd in compose_commands:
            try:
                logging.info(f"Running: {' '.join(cmd)} (cwd={docker_dir})")
                result = subprocess.run(
                    cmd,
                    cwd=docker_dir,
                    capture_output=True,
                    text=True,
                    timeout=600
                )
                
                logging.info(result.stdout)
                if result.stderr:
                    logging.info(result.stderr)
                
                if result.returncode == 0:
                    success = True
                    break
                else:
                    logging.info(f"Compose attempt failed with {cmd[0]}: {result.stderr}")
            except Exception as e:
                logging.info(f"Compose attempt failed with {cmd[0]}: {e}")
                continue
        
        if not success:
            raise Exception("Failed to run Docker Compose. Ensure Docker Desktop is installed, running, and Compose V2 is enabled.")
        
        return {
            'success': True,
            'message': f'DocuBrain is ready!\n\nOpen http://localhost:8501 in your browser.\n\nWatch folder: {watch_folder}\nDrop files there for auto-import!',
            'log_file': str(log_file)
        }
        
    except Exception as e:
        logging.error(f"ERROR: {e}", exc_info=True)
        return {
            'success': False,
            'message': f'Installation failed: {e}\n\nSee log: {log_file}',
            'log_file': str(log_file)
        }

if __name__ == '__main__':
    result = run_installer()
    print(result['message'])
    sys.exit(0 if result['success'] else 1)
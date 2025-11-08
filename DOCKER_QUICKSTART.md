# DeskAI - Quick Start Guide

## ✅ System Status

- **Ollama**: Running in Docker on port 12345 ✓
- **PostgreSQL**: Running on port 5432 ✓
- **MinIO**: Running on port 9000 ✓
- **Router**: Running on port 8000 ✓
- **Worker**: Running ✓

## 🚀 Quick Start

### Start Everything (Docker)

```bash
cd docbrain-starter/docker
docker-compose up -d
```

All services will be running. Ollama is now fully functional!

### Test Ollama API

```powershell
Invoke-WebRequest -Uri "http://localhost:12345/api/tags"
```

Expected response:
```json
{"models":[]}
```

### Install a Model

```bash
docker exec docubrain-ollama ollama pull phi3:mini
```

Or pull any other model:
```bash
docker exec docubrain-ollama ollama pull mistral
docker exec docubrain-ollama ollama pull neural-chat
```

### Access Services

- **Router API**: http://localhost:8000
- **Ollama API**: http://localhost:12345
- **MinIO**: http://localhost:9001
- **PostgreSQL**: localhost:5432

## 🔧 Docker Commands

### Stop all services
```bash
cd docbrain-starter/docker
docker-compose down
```

### View logs
```bash
docker-compose logs -f ollama        # Ollama logs
docker-compose logs -f router        # Router logs
docker-compose logs -f worker        # Worker logs
```

### Restart a service
```bash
docker-compose restart ollama
```

## 📁 Important Directories

- `docbrain-starter/docker/` - Docker Compose configuration
- `docbrain-starter/router/` - FastAPI backend
- `docbrain-starter/desktop-app/` - Desktop UI
- `docbrain-starter/docker/documents/` - Uploaded documents
- `docbrain-starter/docker/processed/` - Processed documents

## ❓ Troubleshooting

### Port Already in Use
```bash
# Kill the process using port 11434/12345
netstat -ano | findstr "12345"
taskkill /PID <PID> /F
```

### Docker Won't Start
```bash
# Check Docker status
docker ps

# View error logs
docker logs docubrain-ollama
```

### Ollama Not Responding
```bash
# Restart Ollama container
docker-compose restart ollama

# Wait 10 seconds for it to initialize
Start-Sleep -Seconds 10

# Test connection
Invoke-WebRequest -Uri "http://localhost:12345/api/tags"
```

## 📝 Notes

- **Windows Socket Issue**: Port 11434 was blocked by Windows permissions. Solution: Docker container on port 12345.
- **Models**: Ollama starts with no models. Pull them with `ollama pull <model-name>`.
- **Performance**: First run may take a minute to initialize all services.

## ✅ Verification

All services are running when you see:
```
✔ Container docubrain-ollama   Running
✔ Container docker-router-1    Running
✔ Container docker-postgres-1  Healthy
✔ Container docker-minio-1     Healthy
✔ Container docker-worker-1    Running
```

---

**System fully operational with Docker!** 🎉

# 🔧 AI Chat Troubleshooting Guide

## Common Issues and Solutions

### ⏱️ "Request timed out" Error

**Problem**: First-time queries timeout while the model loads into memory.

**Solutions**:
1. **Wait and Retry**: The first query can take 30-120 seconds as Ollama loads the model into RAM/VRAM
2. **Pre-warm the model**: Run this in your terminal before using the chat:
   ```powershell
   ollama run llama3:latest "hello"
   ```
3. **Use a smaller model**: Try `qwen2.5:7b` instead of larger models like `gemma3:12b`
4. **Check available RAM**: Ensure you have at least 8GB of free RAM for 7B-8B models

### 🔌 "Cannot connect to Ollama" Error

**Problem**: Docker container can't reach your Ollama service.

**Solutions**:
1. **Verify Ollama is running**:
   ```powershell
   ollama list
   ```
   
2. **Test Ollama API**:
   ```powershell
   Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -Method Get
   ```

3. **Restart Ollama service**:
   ```powershell
   # On Windows, restart the Ollama service from Services or:
   Stop-Process -Name "ollama" -Force
   # Then start Ollama again from Start Menu
   ```

4. **Check Docker host networking**:
   - Ensure `extra_hosts` is configured in docker-compose.yml
   - Verify with: `docker exec docker-worker-1 ping host.docker.internal`

### 📦 "Model not found" Error

**Problem**: Selected model isn't installed in Ollama.

**Solutions**:
1. **Pull the model**:
   ```powershell
   ollama pull llama3:latest
   ollama pull gemma3:12b
   ollama pull qwen2.5:7b
   ```

2. **List available models**:
   ```powershell
   ollama list
   ```

3. **Use an installed model**: Select a model from the dropdown that you already have

### 🐌 Slow Responses

**Problem**: AI responses are very slow.

**Solutions**:
1. **Use GPU acceleration**: Ensure Ollama is using your GPU
   - Check: `ollama ps` while generating
   - Install latest GPU drivers

2. **Switch to smaller models**:
   - `qwen2.5:7b` - Fast, good quality
   - `llama3:latest` - 8B model, balanced
   - Avoid `gemma3:12b` or larger if speed is critical

3. **Close other applications**: Free up RAM/VRAM

4. **Reduce response length**: The model is set to max 500 tokens

### 📄 "No documents available" Message

**Problem**: AI says it has no documents to reference.

**Solutions**:
1. **Upload documents first**: Go to "Upload Documents" tab and add files
2. **Wait for processing**: Give the system a moment to process uploads
3. **Check document status**: Verify files appear in "Document Library"

### 🔴 Container Keeps Restarting

**Problem**: Docker worker container won't stay up.

**Check logs**:
```powershell
docker-compose logs worker
```

**Common causes**:
1. **Port conflict**: Another app using port 8501
2. **Database connection**: PostgreSQL not ready
3. **Syntax errors**: Check recent code changes

**Solution**:
```powershell
docker-compose down
docker-compose up -d
```

### 💾 Out of Memory Errors

**Problem**: System runs out of RAM when loading models.

**Solutions**:
1. **Use quantized models**: Q4 variants use less memory
2. **Close other applications**: Free up system RAM
3. **Use smaller models**: 
   - 7B models: ~4-6GB RAM
   - 12B models: ~8-12GB RAM
   - 20B models: ~16-20GB RAM

4. **Check model size**:
   ```powershell
   ollama list
   ```

### 🌐 Network/Firewall Issues

**Problem**: Docker can't connect to host Ollama.

**Solutions**:
1. **Disable firewall temporarily** to test
2. **Allow Docker in firewall**: Add exception for Docker Desktop
3. **Check Docker settings**: 
   - Docker Desktop → Settings → Resources → WSL Integration
   - Enable "Expose daemon on tcp://localhost:2375"

### 🔄 Fresh Start

If all else fails, reset everything:

```powershell
# Stop and remove everything
docker-compose down -v

# Restart Ollama
# Close Ollama from system tray and restart it

# Rebuild and start
docker-compose up -d --build

# Check logs
docker-compose logs -f worker
```

## Performance Tips

### Best Model Choices by Use Case:

- **Speed**: `qwen2.5:7b` or `llama3:latest`
- **Quality**: `gemma3:12b` or `deepseek-r1:8b`
- **Balance**: `llama3:latest`
- **Technical docs**: `qwen2.5-coder:7b`
- **Reasoning**: `deepseek-r1:8b`

### Optimize Ollama:

1. **GPU Settings** (if you have NVIDIA GPU):
   - Ensure CUDA is installed
   - Ollama automatically uses GPU

2. **Model Settings** in app.py:
   ```python
   "options": {
       "temperature": 0.7,  # Lower = more focused
       "num_predict": 500   # Fewer tokens = faster
   }
   ```

## Testing Connection

### Quick Test Script:

```powershell
# Test Ollama from command line
ollama run llama3:latest "Say hello in one sentence"

# Test from PowerShell
$body = @{
    model = "llama3:latest"
    prompt = "Hello"
    stream = $false
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:11434/api/generate" -Method Post -Body $body -ContentType "application/json"
```

## Getting Help

1. **Check Ollama logs**: Look in Ollama app settings
2. **Docker logs**: `docker-compose logs worker`
3. **System resources**: Task Manager → Performance tab
4. **Ollama status**: `ollama ps` while generating

## Contact & Support

- Ollama Docs: https://ollama.ai/docs
- Docker Docs: https://docs.docker.com
- Streamlit Docs: https://docs.streamlit.io

---

**Remember**: First query always takes longer! Be patient. ⏳

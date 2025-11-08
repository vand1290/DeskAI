# 🐌 Slow AI Performance - Solutions & Optimization

## Current Status
Your Ollama AI is working but **VERY SLOW** - taking 5+ minutes per response.

## Why So Slow?

### Performance Test Results:
- **llama3:latest** took **5 minutes 23 seconds** to generate 212 tokens
- Rate: **10.18 tokens/second** (very slow!)
- Typical rate should be: **50-100+ tokens/second**

### Likely Causes:
1. ❌ **Running on CPU only** (no GPU acceleration)
2. ❌ **Limited RAM** (model constantly swapping to disk)
3. ❌ **Model too large for your system**
4. ❌ **Background processes consuming resources**

## ✅ What I Fixed:

1. **Extended Timeout**: 120s → 600s (10 minutes)
2. **Reduced Output**: 500 → 150 tokens (faster responses)
3. **Better UI Warnings**: Users know to wait 3-5 minutes
4. **Reordered Models**: Faster models first
5. **Network Fixed**: Container can now reach Ollama

## 🚀 How to Speed It Up:

### Option 1: Use Smaller Models (Recommended)
Try these faster models:

```powershell
# Install tiny, fast models
ollama pull tinyllama      # 1.1B parameters - VERY FAST
ollama pull phi3:mini      # 3.8B parameters - Fast
ollama pull qwen2:1.5b     # 1.5B parameters - Lightning fast
```

Then select them in the UI dropdown.

### Option 2: Get GPU Acceleration

#### If you have NVIDIA GPU:
1. **Check if you have a compatible GPU**:
   ```powershell
   nvidia-smi
   ```

2. **Install CUDA Toolkit** (if not installed)
   - Download from: https://developer.nvidia.com/cuda-downloads

3. **Reinstall Ollama** to enable GPU:
   ```powershell
   # Ollama will automatically use GPU if CUDA is available
   ollama pull llama3:latest
   ```

4. **Verify GPU usage**:
   ```powershell
   ollama run llama3:latest "test"
   # Watch nvidia-smi in another window - should show GPU usage
   ```

#### If you have AMD GPU:
- ROCm support is limited on Windows
- Better to use CPU-optimized smaller models

### Option 3: Increase System Resources

1. **Close unnecessary applications**
2. **Increase RAM** if possible (minimum 16GB recommended for 7B models)
3. **Use SSD** instead of HDD for better model loading

### Option 4: Use Quantized Models

Quantized models are smaller and faster:

```powershell
# Q4 quantization - good balance
ollama pull llama3:8b-q4_0

# Q2 quantization - very fast but lower quality
ollama pull llama3:8b-q2_K
```

## 📊 Model Size Guide:

| Model | Size | Speed | Quality | RAM Needed |
|-------|------|-------|---------|------------|
| tinyllama | 1.1B | ⚡⚡⚡⚡⚡ | ⭐⭐ | 2GB |
| phi3:mini | 3.8B | ⚡⚡⚡⚡ | ⭐⭐⭐ | 4GB |
| qwen2.5:7b-q4 | 7B | ⚡⚡⚡ | ⭐⭐⭐⭐ | 6GB |
| llama3:latest | 8B | ⚡⚡ | ⭐⭐⭐⭐ | 8GB |
| gemma3:12b | 12B | ⚡ | ⭐⭐⭐⭐⭐ | 12GB |

## 🎯 Recommended Action:

### For Your System (Slow Performance):

1. **Install TinyLlama** (very fast):
   ```powershell
   ollama pull tinyllama
   ```

2. **Restart DocuBrain**:
   ```powershell
   cd docker
   docker-compose restart worker
   ```

3. **Update model list** in UI to include tinyllama

4. **Test with simple question**: "hello"
   - Should respond in 10-30 seconds instead of 5 minutes!

### Alternative: Use OpenAI API Instead

If local AI is too slow, consider using OpenAI API:

1. Get API key from: https://platform.openai.com/
2. Modify app.py to use OpenAI instead of Ollama
3. Much faster but costs money ($0.002 per 1K tokens)

## 🔍 Diagnose Your System:

```powershell
# Check RAM
Get-ComputerInfo | Select-Object CsTotalPhysicalMemory

# Check GPU
nvidia-smi  # For NVIDIA
# or
wmic path win32_VideoController get name  # For any GPU

# Check Ollama model list
ollama list

# Test model speed
Measure-Command { ollama run tinyllama "test" }
```

## ✅ Current Settings:

- **Timeout**: 600 seconds (10 minutes)
- **Max tokens**: 150 (reduced for speed)
- **Default model**: qwen2.5:7b (reordered to top)
- **Network**: Fixed to 192.168.1.78
- **Warning**: Users notified about 3-5 min wait time

## 🎨 Try These Fast Models:

```powershell
# Best balance of speed and quality
ollama pull qwen2.5:1.5b    # VERY FAST
ollama pull phi3:mini        # Fast and smart
ollama pull tinyllama        # Fastest but basic

# After pulling, restart and select in UI!
```

## 📈 Expected Performance After Optimization:

| Current (llama3) | After (tinyllama) |
|------------------|-------------------|
| 5 minutes | 10-30 seconds |
| 10 tokens/sec | 50-150 tokens/sec |
| 😫 | 😊 |

---

**Bottom Line**: Your system is running Ollama on CPU without GPU acceleration. Use smaller models or get GPU acceleration for better performance!

**Quick Fix**: `ollama pull tinyllama` and use that model! 🚀

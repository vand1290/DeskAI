# 🤖 Ollama AI Chat Integration

DocuBrain now includes AI chat functionality powered by your local Ollama installation!

## ✅ Setup Complete

Your DocuBrain application is now configured to use Ollama for AI-powered document chat.

## 🎯 Available Models

You have the following models available:
- **llama3.2** (Recommended - Fast & Accurate)
- **llama3.1** (More powerful)
- **mistral** (Great for technical documents)
- **phi3** (Lightweight & fast)
- Plus many more you have installed!

## 🚀 How to Use

1. **Access DocuBrain**: Open http://localhost:8501
2. **Login**: Use `admin` / `admin`
3. **Upload Documents**: Go to "Upload Documents" tab
4. **Chat**: Navigate to "AI Chat" tab
5. **Select Model**: Choose your preferred AI model from the dropdown
6. **Ask Questions**: Type questions about your uploaded documents!

## 💡 Example Questions

- "Summarize the main points from my documents"
- "What are the key findings in the uploaded reports?"
- "Can you explain [specific topic] from the documents?"
- "Compare the data across my uploaded files"

## 🔧 How It Works

1. **Document Upload**: Your documents are stored in MinIO object storage
2. **Context Retrieval**: When you ask a question, DocuBrain retrieves relevant document excerpts
3. **AI Processing**: Ollama processes your question with the document context
4. **Response**: You get an AI-generated answer based on your documents

## 📝 Current Models Detected on Your System

- granite3.1-dense:8b
- ALIENTELLIGENCE/ai2ndbrain:latest
- aya-expanse:latest
- gemma3:12b
- qwen2.5-coder:7b
- qwen2.5:7b
- llama3:latest
- deepseek-r1:8b
- gpt-oss:20b
- And more!

## ⚙️ Configuration

The application connects to Ollama at: `http://host.docker.internal:11434`

To change the model, you can:
1. Use the dropdown in the UI
2. Or set the `OLLAMA_MODEL` environment variable in docker-compose.yml

## 🐛 Troubleshooting

### "Cannot connect to Ollama"
- Ensure Ollama is running: `ollama list`
- Check if Ollama service is accessible: `curl http://localhost:11434/api/tags`

### "Model not found"
- Pull the model: `ollama pull llama3.2`
- Or use a model you already have installed

### Slow responses
- Try a smaller model like `phi3`
- Ensure your GPU drivers are up to date (if using GPU)

## 🎨 Features

- ✅ Local AI - No cloud dependencies
- ✅ Privacy-first - Your data stays on your machine
- ✅ Multiple model support
- ✅ Document context awareness
- ✅ Chat history tracking
- ✅ Real-time responses

## 📊 Performance Tips

1. **Use appropriate models**: Larger models (20B+) are slower but more accurate
2. **Keep documents concise**: The AI works best with focused content
3. **GPU acceleration**: Ollama automatically uses your GPU if available
4. **Model selection**: Start with `llama3.2` for best balance

## 🔄 Updating Models

To add new models:
```bash
ollama pull llama3.2
ollama pull mistral
ollama pull phi3
```

---

**Enjoy chatting with your documents! 🧠**

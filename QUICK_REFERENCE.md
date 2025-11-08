# Quick Reference: LLM System & Tools

## Import Statements

```python
# For model management
from llm_manager import LLMModelManager

# For ready-to-use tools
from llm_manager import (
    create_summary_tool,
    create_search_tool,
    create_classification_tool,
    create_extraction_tool
)

# For UI (if extending DocuBrain)
from llm_model_selector_ui import LLMModelSelector
```

---

## Basic Usage

### Initialize
```python
llm = LLMModelManager()
```

### Get Available Models
```python
models = llm.get_available_models()
# Returns list of {name, profile, modified}
```

### Query with Default Model
```python
response = llm.query_model("Your prompt here")
```

### Query with Specific Model
```python
response = llm.query_model(
    "Your prompt",
    model="phi3:mini"
)
```

### Query for Specific Task
---

## Configuration Methods

### Set Primary Model
```python
llm.set_primary_model("phi3:mini")
```

### Set Task-Specific Model
```python
llm.set_model_for_task("summary", "phi3:mini")
llm.set_model_for_task("search", "mistral")
llm.set_model_for_task("chat", "llama3")
```

### Get Model for Task
```python
model = llm.get_model_for_task("summary")
```

### Get Model Info
```python
info = llm.get_model_info("phi3:mini")
# Returns: {name, size, speed, quality, use_cases}
```

### Download New Model
```python
llm.pull_model("neural-chat")
```

---

## Model Profiles (Built-in)

### phi3:mini
- **Size**: 2.0 GB
- **Speed**: Very Fast ⚡⚡⚡
- **Quality**: Good ⭐⭐⭐
- **Use Cases**: Quick answers, Summaries, Tools

### mistral
- **Size**: 4.1 GB
- **Speed**: Fast ⚡⚡
- **Quality**: Good ⭐⭐⭐⭐
- **Use Cases**: Search, Classification, Q&A

### neural-chat
- **Size**: 4.1 GB
- **Speed**: Medium ⚡⚡
- **Quality**: Excellent ⭐⭐⭐⭐
- **Use Cases**: Conversational, Friendly responses

### llama3
- **Size**: 4.7 GB
- **Speed**: Medium ⚡⚡
- **Quality**: Very Good ⭐⭐⭐⭐
- **Use Cases**: Chat, Analysis, Writing

### dolphin-mixtral
- **Size**: 26 GB
- **Speed**: Slow 🐢
- **Quality**: Excellent ⭐⭐⭐⭐⭐
- **Use Cases**: Complex tasks, Coding, Deep analysis

---

## Common Patterns

### Pattern 1: Batch Processing
```python
llm = LLMModelManager()
results = []

for document in documents:
    result = llm.query_model(
        f"Process: {document}",
        task="summary"
    )
    results.append(result)
```

### Pattern 2: Multi-Stage Processing
```python
# Stage 1: Quick analysis
quick = llm.query_model(prompt, task="summary")

# Stage 2: Deep analysis
deep = llm.query_model(prompt, task="chat")

# Stage 3: Search
search = llm.query_model(prompt, task="search")
```

### Pattern 3: With Error Handling
```python
try:
    response = llm.query_model(prompt)
    if "error" in response.lower():
        response = "Processing failed"
except Exception as e:
    response = f"Error: {e}"
```

---

## File Locations

```
Project Root/
├── desktop-app/
│   ├── llm_manager.py          # Core LLM system
│   ├── llm_model_selector_ui.py # UI component
│   └── main.py                 # Updated with LLM integration
├── REPACKAGE_SUMMARY.md        # Overview of changes
├── LLM_MODEL_GUIDE.md          # User guide
└── TOOLS_DEVELOPMENT_GUIDE.md  # Developer guide

Configuration:
%USERPROFILE%\DocuBrain\llm_config.json
```

---

## Debugging Tips

### Check Available Models
```python
llm = LLMModelManager()
models = llm.get_available_models()
for m in models:
    print(f"- {m['name']} ({m['profile']['size']})")
```

### Test Connection
```python
llm = LLMModelManager()
try:
    models = llm.get_available_models()
    if models:
        print("✓ Ollama connected")
    else:
        print("✗ No models available")
except Exception as e:
    print(f"✗ Connection error: {e}")
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "No models available" | Start Ollama service first |
| Slow responses | Switch to phi3:mini for testing |
| Model not found | Download with `llm.pull_model()` |
| Connection error | Check Ollama is running on port 11434 |
| High memory usage | Use lighter models (phi3:mini) |

---

## Task Names

Use these as the `task` parameter:
- `"chat"` - General conversation
- `"summary"` - Text summarization
- `"search"` - Document search

---

**Version**: 2.0.0 (LLM System)
**Last Updated**: November 8, 2025
**Framework**: Python 3.11+ with CustomTkinter + Ollama

Both outputs in `dist/` folders.

---

## 📦 Distribution

Ready to ship:
1. Test INSTALL.bat on clean Windows machine ✓
2. Package files into ZIP
3. Upload to distribution channel
4. Share with users
5. Users run INSTALL.bat
6. Done!

---

## 🆘 Need Help?

1. **Quick questions**: See START_HERE.md
2. **Setup help**: See INSTALLATION_GUIDE.md
3. **Technical details**: See BUILD_SUMMARY.md
4. **Testing**: See DEPLOYMENT_CHECKLIST.md
5. **Full story**: See FINAL_STATUS_REPORT.md

---

## 🎯 Status

```
┌─────────────────────────────────────┐
│  ✅ APPLICATION COMPLETE            │
│  ✅ INSTALLER READY                 │
│  ✅ DOCUMENTATION COMPLETE          │
│  ✅ TESTED & VERIFIED               │
│  ✅ READY FOR DISTRIBUTION          │
└─────────────────────────────────────┘
```

---

## 🚀 Ready!

**Everything is built, tested, and ready to use.**

Pick one:
- **Run now**: Double-click DocuBrain.exe
- **Install**: Right-click INSTALL.bat → Admin
- **Share**: ZIP and send to users

**That's it! 🎉**

---

**Version 1.0 | November 8, 2025 | Windows 64-bit**

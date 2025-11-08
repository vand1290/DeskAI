# 🤖 DocuBrain AI Models Guide

## Quick Start

**Refresh your browser** at http://localhost:8501 and go to the **AI Chat** section.

## Model Selection Guide

### ⚡ FAST Models (Recommended for Development)

#### 1. **TinyLlama** - Lightning Fast ⚡⚡⚡
- **Response Time**: 2-5 seconds
- **Size**: 637 MB
- **Best For**: 
  - Quick testing
  - Simple questions
  - Basic document queries
  - Fast prototyping
- **Example**: "What is this document about?"

#### 2. **Phi-3 Mini** - Best Balance ⚡⚡
- **Response Time**: 10-20 seconds
- **Size**: 2.2 GB (3.8B parameters)
- **Best For**:
  - Document analysis
  - Q&A with reasoning
  - Summaries
  - Good quality + speed balance
- **Example**: "Summarize the key points in these documents"

#### 3. **Llama 3.2 3B** - Strong & Fast ⚡⚡
- **Response Time**: 8-15 seconds
- **Size**: 2.0 GB (3B parameters)
- **Best For**:
  - Complex document understanding
  - Multi-step reasoning
  - Better quality than TinyLlama
- **Example**: "Compare the information across these documents"

---

### 📄 QUALITY Models (1-2 minutes)

#### 4. **Qwen 2.5 7B**
- **Response Time**: 60-90 seconds
- **Size**: 4.7 GB (7B parameters)
- **Best For**:
  - Multilingual documents
  - High-quality analysis
  - Detailed explanations
- **Example**: "Analyze this Italian commercial document in detail"

#### 5. **DeepSeek R1 8B**
- **Response Time**: 90-120 seconds
- **Size**: 5.2 GB (8B parameters)
- **Best For**:
  - Advanced reasoning
  - Mathematical content
  - Code in documents
- **Example**: "Explain the financial calculations in this spreadsheet"

---

### 🔥 POWERFUL Models (3-5 minutes)

#### 6. **Llama 3 8B**
- **Response Time**: 3-5 minutes
- **Size**: 4.7 GB (8B parameters)
- **Best For**:
  - High-quality responses
  - Complex tasks
  - Production use
- **Example**: "Write a detailed analysis report"

#### 7. **Granite 3.1 Dense 8B**
- **Response Time**: 3-5 minutes
- **Size**: 5.0 GB (8B parameters)
- **Best For**:
  - Enterprise documents
  - Business analysis
  - Professional content
- **Example**: "Create executive summary from these reports"

#### 8. **Aya Expanse**
- **Response Time**: 3-5 minutes
- **Size**: 5.1 GB
- **Best For**:
  - Multilingual content
  - Global documents
  - Translation tasks
- **Example**: "Translate and summarize these multilingual documents"

#### 9. **Gemma 3 12B** - Highest Quality 🏆
- **Response Time**: 5-7 minutes
- **Size**: 8.1 GB (12B parameters)
- **Best For**:
  - Maximum quality
  - Critical analysis
  - When time isn't an issue
- **Example**: "Provide comprehensive analysis with citations"

---

## Performance Test Results

**Actual Speed Test** (October 20, 2025):

```
TinyLlama:      1.95 seconds ⚡⚡⚡ (165x faster than Llama3)
Phi-3 Mini:     ~15 seconds  ⚡⚡  (estimate)
Llama 3.2 3B:   ~12 seconds  ⚡⚡  (estimate)
Qwen 2.5 7B:    ~90 seconds  📄   (estimate)
Llama 3 8B:     5 min 23 sec 🔥   (tested)
```

---

## Recommendation by Use Case

### 🚀 Daily Development & Testing
→ Use **TinyLlama** or **Phi-3 Mini**

### 📊 Document Analysis (Quality Matters)
→ Use **Llama 3.2 3B** or **Qwen 2.5 7B**

### 💼 Production/Client Demos
→ Use **Llama 3 8B** or **Granite 3.1 8B**

### 🌍 Multilingual Content
→ Use **Aya Expanse** or **Qwen 2.5 7B**

### 🏆 Maximum Quality (Patience Required)
→ Use **Gemma 3 12B**

---

## How to Switch Models

1. **Open**: http://localhost:8501
2. **Login**: admin / admin
3. **Navigate to**: "💬 AI Chat" section
4. **Select model** from dropdown (top-right)
5. **Ask your question**
6. **Wait** (see timing above)

---

## Tips for Best Performance

### ✅ DO:
- Start with **TinyLlama** for testing
- Upgrade to **Phi-3** when you need better quality
- Use **Llama 3.2 3B** for important queries
- Keep questions focused and specific
- Wait the full time - don't refresh!

### ❌ DON'T:
- Start with Gemma 3 12B for simple tests
- Refresh the page while waiting
- Ask multiple questions at once
- Expect instant responses from large models

---

## Speed vs Quality Chart

```
TinyLlama     [====                    ] 20% Quality | ⚡⚡⚡ Speed
Phi-3 Mini    [=========               ] 45% Quality | ⚡⚡  Speed
Llama3.2 3B   [===========             ] 55% Quality | ⚡⚡  Speed
Qwen 2.5 7B   [==============          ] 70% Quality | ⚡   Speed
DeepSeek R1   [===============         ] 75% Quality | ⚡   Speed
Llama 3 8B    [==================      ] 90% Quality | 🐌  Slow
Granite 8B    [==================      ] 90% Quality | 🐌  Slow
Aya Expanse   [==================      ] 90% Quality | 🐌  Slow
Gemma 3 12B   [=======================] 100% Quality | 🐢  Very Slow
```

---

## Current Setup

- **Default Model**: TinyLlama (fastest)
- **Timeout**: 600 seconds (10 minutes)
- **Max Response**: 150 tokens
- **Context**: Up to 5 documents × 2000 characters each
- **Ollama**: http://192.168.1.78:11434

---

## Need Help?

See also:
- `PERFORMANCE_GUIDE.md` - Optimization tips
- `OLLAMA_SETUP.md` - Ollama configuration
- `AI_CHAT_TROUBLESHOOTING.md` - Common issues

---

**Pro Tip**: Use TinyLlama for quick iteration, then switch to Phi-3 or Llama 3.2 3B when you're ready for production testing! 🚀

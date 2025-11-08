# LLM Model Selection System - User Guide

## Overview

DocuBrain now supports multiple LLM models for different tasks. You can:
- ✅ Select different models for different purposes
- ✅ Download additional lightweight models
- ✅ Optimize performance vs quality based on your needs
- ✅ Use fast models for tools and summaries
- ✅ Use powerful models for complex analysis

## Available Models

### Recommended Lightweight Models (Fast & Efficient)

**Phi 3 Mini (2.0 GB)** 🚀
- Speed: ⚡⚡⚡ Very Fast
- Quality: ⭐⭐⭐ Good
- Best for: Summaries, quick answers, simple tools
- Use case: Creating helper tools, classifications

**Neural Chat (4.1 GB)** 💬
- Speed: ⚡⚡ Medium
- Quality: ⭐⭐⭐⭐ Excellent
- Best for: Conversational responses, friendly answers
- Use case: General chat and Q&A

**Mistral (4.1 GB)** 🎯
- Speed: ⚡⚡ Medium
- Quality: ⭐⭐⭐⭐ Good
- Best for: Search, classification, structured data
- Use case: Document search and categorization

### Standard Models

**Llama 3 (4.7 GB)** 🦙
- Speed: ⚡⚡ Medium
- Quality: ⭐⭐⭐⭐ Very Good
- Best for: General analysis, writing, chat
- Use case: Primary model (currently installed)

### Advanced Models (For Complex Tasks)

**Dolphin Mixtral (26 GB)** 🐬
- Speed: 🐢 Slower
- Quality: ⭐⭐⭐⭐⭐ Excellent
- Best for: Complex analysis, coding, reasoning
- Use case: Advanced document analysis, code generation

## Using the Model Selection Panel

### 1. In the DocuBrain UI

When you launch DocuBrain, the Model Selection panel appears in the sidebar:

1. **Primary Model** - Main model used by default
2. **Task-Specific Models** - Optimize individual tasks:
   - **Chat**: Select your preferred chat model
   - **Summary**: Use a fast model for summaries
   - **Search**: Use optimized model for document search

### 2. Change Your Primary Model

1. Click the dropdown next to "Primary Model"
2. Select a model from the list
3. View the model details that appear below
4. Changes are saved automatically

### 3. Optimize Models by Task

For each task, you can select a different model:

```
Example Configuration:
├─ Chat Model: llama3 (good for conversation)
├─ Summary Model: phi3:mini (fast)
└─ Search Model: mistral (good for queries)
```

This way, quick operations use lightweight models and complex tasks use powerful ones.

### 4. Download Additional Models

1. Click "⬇️ Download New Model"
2. Enter the model name (e.g., `phi3:mini`)
3. Click "Start Download"
4. Wait for the download to complete (5-30 minutes depending on model size)
5. The new model will be available immediately

## Recommended Combinations

### For Maximum Speed (Light Usage)
```
Chat: phi3:mini
Summary: phi3:mini
Search: mistral
Primary: phi3:mini
Result: Fast responses, uses ~2 GB RAM
```

### Balanced (Default)
```
Chat: llama3
Summary: phi3:mini
Search: mistral
Primary: llama3
Result: Good quality, optimized speed, uses ~6 GB RAM
```

### Maximum Quality (Advanced Analysis)
```
Chat: dolphin-mixtral
Summary: llama3
Search: mistral
Primary: dolphin-mixtral
Result: Excellent responses, slower, needs ~30 GB VRAM
```

## Creating Tools with LLM Models

### Example 1: Quick Summary Tool

```python
from llm_manager import LLMModelManager, create_summary_tool

llm = LLMModelManager()
text = "Your long document..."
summary = create_summary_tool(llm, text)
print(summary)  # Uses fast phi3:mini model
```

### Example 2: Document Classification Tool

```python
from llm_manager import LLMModelManager, create_classification_tool

llm = LLMModelManager()
text = "The sales increased 30% this quarter..."
categories = ["Finance", "HR", "Marketing", "Technical"]
classification = create_classification_tool(llm, text, categories)
print(classification)  # Classifies the document
```

### Example 3: Information Extraction Tool

```python
from llm_manager import LLMModelManager, create_extraction_tool

llm = LLMModelManager()
document = "Invoice #INV-001 from Company ABC on 2025-01-01..."
fields = ["invoice_number", "company", "date"]
extracted = create_extraction_tool(llm, document, fields)
print(extracted)  # Returns dict with extracted fields
```

### Example 4: Custom Tool Using Streaming

```python
from llm_manager import LLMModelManager

llm = LLMModelManager()

# For long responses, use streaming
for chunk in llm.query_model_streaming(
    "List 10 ways to improve productivity",
    task="chat"
):
    print(chunk, end="", flush=True)  # Prints as it generates
```

## Configuration File

Model preferences are saved in:
```
~\AppData\Roaming\DocuBrain\llm_config.json
```

Example configuration:
```json
{
  "primary_model": "llama3",
  "chat_model": "llama3",
  "summary_model": "phi3:mini",
  "search_model": "mistral",
  "available_models": [
    "llama3",
    "phi3:mini",
    "mistral",
    "neural-chat"
  ],
  "model_profiles": { ... }
}
```

You can edit this directly to change configurations.

## Troubleshooting

### "Model not found" Error
- Make sure Ollama is running
- Download the model with the Download button
- Check model name spelling

### Slow Responses
- Switch to a faster model (phi3:mini)
- Use task-specific models for quick operations
- Reduce response length with custom prompts

### High Memory Usage
- Use lighter models (phi3:mini instead of dolphin-mixtral)
- Close other applications
- Reduce model size in configuration

### Downloaded Model Won't Appear
1. Click the 🔄 refresh button
2. Wait 5 seconds for list to update
3. If still not showing, check Ollama is running

## Best Practices

✅ **DO:**
- Use phi3:mini for quick tools and summaries
- Use llama3 for main chat functionality
- Use task-specific models for optimization
- Download models one at a time
- Close the app before downloading large models

❌ **DON'T:**
- Run multiple large models simultaneously (high RAM)
- Download and use dolphin-mixtral unless you have 30+ GB VRAM
- Switch models constantly (causes delays)
- Use models while they're being downloaded

## Advanced Features

### Model Pooling by Use Case

List all models suitable for a specific use case:
```python
llm = LLMModelManager()
models = llm.list_models_by_use_case("Chat")
print(models)  # ['llama3', 'neural-chat', 'dolphin-mixtral']
```

### Batch Configuration

Set multiple task models at once:
```python
llm = LLMModelManager()
llm.set_model_for_task("summary", "phi3:mini")
llm.set_model_for_task("search", "mistral")
llm.set_primary_model("llama3")
```

### Reset to Defaults

Reset all model settings to default:
```python
llm = LLMModelManager()
llm.reset_config()
# Now using defaults: llama3 primary, phi3:mini for summary, etc.
```

## Integration with Tools You're Building

You can use the LLM Manager in your custom tools:

```python
# In your tool's __init__.py
from llm_manager import LLMModelManager

class MyCustomTool:
    def __init__(self):
        self.llm = LLMModelManager()
    
    def process(self, data):
        # Use the primary model
        response = self.llm.query_model(f"Process: {data}")
        
        # Or use task-specific model
        summary = self.llm.query_model(
            f"Summarize: {data}",
            task="summary"  # Uses fast phi3:mini
        )
        
        return response
```

## Next Steps

1. Launch DocuBrain
2. Open the Model Selection panel
3. Try downloading a lightweight model (phi3:mini)
4. Switch between models and test performance
5. Create your first tool using the LLM Manager

For more help, see:
- SETUP_COMPLETE.md - Initial setup guide
- START_NOW.md - Quick start guide
- OLLAMA_FIX_GUIDE.md - Troubleshooting

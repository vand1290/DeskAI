# Building Custom Tools for DocuBrain

This guide shows you how to create custom tools using DocuBrain's LLM system. You can build lightweight tools that help users achieve more with documents.

## Quick Overview

DocuBrain now has a flexible LLM management system that lets you:
- ✅ Create custom tools for specific tasks
- ✅ Use lightweight models for speed (phi3:mini)
- ✅ Use powerful models for complex analysis
- ✅ Dynamically switch between models
- ✅ Build your own AI-powered features

## Tool Architecture

```
Your Custom Tool
    ↓
LLM Manager (llm_manager.py)
    ↓
Ollama Service (localhost:11434)
    ↓
Model (llama3, phi3:mini, etc.)
```

## Built-in Tools

DocuBrain comes with 4 ready-to-use tool templates:

### 1. Summary Tool (Fast)

**Purpose**: Create concise summaries of documents or text

```python
from llm_manager import create_summary_tool, LLMModelManager

# Initialize
llm = LLMModelManager()

# Create summary
text = "Long document text here..."
summary = create_summary_tool(llm, text)
print(summary)
```

**Best Model**: phi3:mini (2 GB, very fast)

**Example Use Cases**:
- Summarize meeting notes
- Extract key points from documents
- Generate executive summaries

---

### 2. Search Tool (Smart)

**Purpose**: Search through multiple documents and find relevant information

```python
from llm_manager import create_search_tool, LLMModelManager

llm = LLMModelManager()

# Search documents
documents = [
    "Document 1 content...",
    "Document 2 content...",
    "Document 3 content..."
]

results = create_search_tool(llm, "Find information about X", documents)
print(results)
```

**Best Model**: mistral (4.1 GB, good for search)

**Example Use Cases**:
- Find contracts mentioning specific terms
- Search for all documents about a topic
- Extract relevant sections from multiple files

---

### 3. Classification Tool (Categorizer)

**Purpose**: Automatically categorize and label documents

```python
from llm_manager import create_classification_tool, LLMModelManager

llm = LLMModelManager()

# Classify a document
text = "Invoice #INV-001 dated 2025-01-15..."
categories = ["Finance", "HR", "Marketing", "Technical", "Legal"]

classification = create_classification_tool(llm, text, categories)
print(classification)  # Output: "Finance"
```

**Best Model**: mistral (good for classification)

**Example Use Cases**:
- Auto-tag incoming documents
- Route documents to correct department
- Organize by content type

---

### 4. Extraction Tool (Data Extractor)

**Purpose**: Extract structured data from unstructured text

```python
from llm_manager import create_extraction_tool, LLMModelManager

llm = LLMModelManager()

# Extract fields from a document
document = """
Invoice #INV-001
Date: 2025-01-15
From: Company ABC
Amount: $5,000
Description: Consulting services
"""

fields = ["invoice_number", "date", "company", "amount", "description"]
extracted = create_extraction_tool(llm, document, fields)

# Result:
# {
#   "invoice_number": "INV-001",
#   "date": "2025-01-15",
#   "company": "Company ABC",
#   "amount": "$5,000",
#   "description": "Consulting services"
# }

print(extracted)
```

**Best Model**: phi3:mini (lightweight but effective)

**Example Use Cases**:
- Extract invoice details
- Pull contact information
- Parse structured data from documents
- Collect metadata automatically

---

## Creating Your Own Tool

### Template: Basic Custom Tool

```python
from llm_manager import LLMModelManager

class MyCustomTool:
    """A custom tool that uses LLM for processing"""
    
    def __init__(self, task_name: str = "chat"):
        """Initialize tool with LLM manager"""
        self.llm = LLMModelManager()
        self.task_name = task_name
    
    def process(self, input_data: str) -> str:
        """
        Process input using the LLM
        
        Args:
            input_data: Text to process
            
        Returns:
            Processed result
        """
        prompt = f"Process this: {input_data}"
        
        # Use task-specific model (automatically selected)
        response = self.llm.query_model(
            prompt,
            task=self.task_name
        )
        
        return response

# Usage
tool = MyCustomTool(task_name="chat")
result = tool.process("Your input here")
print(result)
```

---

## Advanced Tool: Document Analysis Tool

```python
from llm_manager import LLMModelManager
from typing import Dict, List

class DocumentAnalyzer:
    """Advanced tool that analyzes documents in multiple ways"""
    
    def __init__(self):
        self.llm = LLMModelManager()
    
    def analyze(self, document: str) -> Dict[str, str]:
        """
        Perform multi-stage analysis on a document
        
        Returns: Dict with summary, category, key_points, etc.
        """
        results = {}
        
        # Stage 1: Quick summary (fast model)
        results['summary'] = self.llm.query_model(
            f"Summarize: {document[:500]}...",
            task="summary"
        )
        
        # Stage 2: Extract key points (search model)
        results['key_points'] = self.llm.query_model(
            f"List the 5 most important points: {document[:500]}...",
            task="search"
        )
        
        # Stage 3: Sentiment/tone (primary model)
        results['tone'] = self.llm.query_model(
            f"Describe the tone (formal/casual/technical): {document[:500]}...",
            task="chat"
        )
        
        return results

# Usage
analyzer = DocumentAnalyzer()
analysis = analyzer.analyze("Your document text...")
print(analysis)
```

---

## Advanced Tool: Batch Processing

```python
from llm_manager import LLMModelManager
from pathlib import Path
import json

class BatchProcessor:
    """Process multiple documents efficiently"""
    
    def __init__(self, batch_size: int = 5):
        self.llm = LLMModelManager()
        self.batch_size = batch_size
    
    def process_files(self, folder_path: str, operation: str) -> List[Dict]:
        """
        Process multiple files with the same operation
        
        Args:
            folder_path: Path to folder with documents
            operation: "summarize", "classify", or "extract"
        """
        results = []
        files = list(Path(folder_path).glob("*.txt"))
        
        for i, file_path in enumerate(files):
            content = file_path.read_text()
            
            if operation == "summarize":
                result = self.llm.query_model(
                    f"Summarize: {content[:1000]}",
                    task="summary"
                )
            elif operation == "classify":
                result = self.llm.query_model(
                    f"Classify document: {content[:1000]}",
                    task="search"
                )
            elif operation == "extract":
                result = self.llm.query_model(
                    f"Extract key data: {content[:1000]}",
                    task="summary"
                )
            
            results.append({
                'filename': file_path.name,
                'result': result
            })
            
            # Progress indicator
            if (i + 1) % self.batch_size == 0:
                print(f"Processed {i + 1}/{len(files)} files")
        
        return results

# Usage
processor = BatchProcessor()
results = processor.process_files("C:/Documents", "summarize")

# Save results
with open("results.json", "w") as f:
    json.dump(results, f, indent=2)
```

---

## Streaming Responses for Long Operations

For operations that take longer, use streaming to show progress:

```python
from llm_manager import LLMModelManager

def stream_analysis(text: str):
    """Stream analysis as it's generated"""
    llm = LLMModelManager()
    
    prompt = f"Analyze this text deeply: {text}"
    
    print("AI Analysis:")
    for chunk in llm.query_model_streaming(prompt, task="chat"):
        print(chunk, end="", flush=True)
    print()

# Usage
stream_analysis("Your long document...")
```

---

## Integrating Tools into DocuBrain UI

### Add Tool Button to Sidebar

```python
# In main.py, add to navigation buttons:

tool_buttons = [
    ("📋", "Summarize Doc", self.tool_summarize, self.colors['accent_purple'], 9),
    ("🏷️", "Classify Doc", self.tool_classify, self.colors['accent_cyan'], 10),
    ("📊", "Analyze Doc", self.tool_analyze, self.colors['accent_blue'], 11),
]

for icon, text, command, color, row in tool_buttons:
    btn_frame = ctk.CTkFrame(self.sidebar, fg_color="transparent")
    btn_frame.grid(row=row, column=0, padx=20, pady=8, sticky="ew")
    
    btn = ctk.CTkButton(
        btn_frame,
        text=f"{icon}  {text}",
        command=command,
        height=40,
        fg_color=self.colors['bg_card'],
        hover_color=color
    )
    btn.pack(fill="x")

# Add tool methods:
def tool_summarize(self):
    """Summarize selected document"""
    selected_doc = self.selected_document
    if not selected_doc:
        messagebox.showwarning("Select Document", "Please select a document first")
        return
    
    # Read document content
    doc_content = self.db.get_document_content(selected_doc['id'])
    
    # Summarize
    from llm_manager import create_summary_tool
    summary = create_summary_tool(self.llm_manager, doc_content)
    
    # Show result
    messagebox.showinfo("Summary", summary)
```

---

## Performance Tips

### Model Selection by Speed

| Model | Speed | Quality | Best For |
|-------|-------|---------|----------|
| phi3:mini | ⚡⚡⚡ | ⭐⭐⭐ | Quick summaries, classifications |
| neural-chat | ⚡⚡ | ⭐⭐⭐⭐ | Chat, conversational |
| mistral | ⚡⚡ | ⭐⭐⭐⭐ | Search, extraction |
| llama3 | ⚡⚡ | ⭐⭐⭐⭐ | Analysis, complex tasks |
| dolphin-mixtral | 🐢 | ⭐⭐⭐⭐⭐ | Complex reasoning |

### Optimization Strategies

1. **Use Fast Models for Batch Operations**
```python
# Good: Use phi3:mini for quick operations on many files
results = []
for file in files:
    result = llm.query_model(
        prompt,
        model="phi3:mini"  # Explicit fast model
    )
    results.append(result)
```

2. **Cache Results**
```python
# Don't re-process the same document
cache = {}

def process_document(doc_id, content):
    if doc_id in cache:
        return cache[doc_id]
    
    result = llm.query_model(f"Process: {content}")
    cache[doc_id] = result
    return result
```

3. **Use Task-Specific Models**
```python
# Let the system choose the right model
response = llm.query_model(
    prompt,
    task="summary"  # Uses phi3:mini automatically
)
```

---

## Example: Complete Email Classifier Tool

```python
from llm_manager import LLMModelManager
from typing import List, Dict

class EmailClassifier:
    """Classify emails by priority, category, and sentiment"""
    
    CATEGORIES = ["Urgent", "Important", "Info", "Spam"]
    
    def __init__(self):
        self.llm = LLMModelManager()
    
    def classify_email(self, subject: str, body: str) -> Dict[str, str]:
        """Classify an email"""
        
        email_text = f"Subject: {subject}\n\nBody: {body}"
        
        # Classify priority
        priority = self.llm.query_model(
            f"Is this email Urgent, Important, Info, or Spam?\nEmail: {email_text[:500]}",
            task="summary"
        ).strip().split()[0]
        
        # Extract action items
        actions = self.llm.query_model(
            f"What action should be taken? {email_text[:500]}",
            task="summary"
        )
        
        # Determine response time
        response_time = self.llm.query_model(
            f"How urgent is response? Now, Today, This week, or Later?\n{email_text[:500]}",
            task="summary"
        ).strip().split()[0]
        
        return {
            'priority': priority,
            'actions': actions,
            'response_time': response_time
        }

# Usage
classifier = EmailClassifier()
result = classifier.classify_email(
    subject="Urgent: Budget Review Meeting",
    body="Please review Q4 budget by EOD today..."
)
print(result)
# Output:
# {
#   'priority': 'Urgent',
#   'actions': 'Review budget and prepare feedback',
#   'response_time': 'Now'
# }
```

---

## Resources

- **LLM Manager Module**: `desktop-app/llm_manager.py`
- **UI Selector**: `desktop-app/llm_model_selector_ui.py`
- **Configuration**: `~\AppData\Roaming\DocuBrain\llm_config.json`

## Next Steps

1. **Start Simple**: Use the built-in tools first (summary, search, classification)
2. **Try Streaming**: Implement streaming for long operations
3. **Build Custom**: Create your first custom tool
4. **Integrate UI**: Add buttons to DocuBrain interface
5. **Optimize**: Measure performance and choose right models

## Support

For issues:
- Check OLLAMA_FIX_GUIDE.md - Ollama troubleshooting
- Check LLM_MODEL_GUIDE.md - Model selection help
- Review example tools in this guide

# 📚 Document Management Models for DocuBrain

## Overview

We've added **2 specialized models** optimized for document processing and management:

---

## 1. 📄 **Granite3.2-Vision** (2B Parameters)

### Purpose
Visual document understanding and content extraction

### Key Features
✅ **Table Extraction** - Automatically extracts data from tables  
✅ **Chart Understanding** - Reads and interprets charts and graphs  
✅ **Diagram Analysis** - Processes technical diagrams  
✅ **Infographic Recognition** - Understands visual infographics  
✅ **Lightweight** - Only 2B parameters = fast inference  
✅ **Accurate OCR** - Superior to traditional OCR for complex layouts  

### Use Cases
- **Invoice Processing** - Extract tables and key information
- **Contract Analysis** - Read key clauses from scanned documents
- **Report Summarization** - Understand diagrams and charts
- **Form Processing** - Extract structured data from forms
- **Visual Document QA** - Answer questions about document layout

### Model Size
- **2B parameters** = ~1.2 GB disk space
- **Fast inference** = real-time processing
- **Low memory** = runs on CPU or basic GPUs

### Example Commands
```bash
# Pull the model
docker exec docubrain-ollama ollama pull granite3.2-vision

# Use with API
curl http://localhost:12345/api/generate \
  -d '{
    "model": "granite3.2-vision",
    "prompt": "Extract the table from this invoice image",
    "images": ["base64_encoded_image"]
  }'
```

---

## 2. 🔍 **LLaMA 3-ChatQA** (8B Parameters)

### Purpose
Document question answering and retrieval-augmented generation

### Key Features
✅ **Document QA** - Answer specific questions about documents  
✅ **RAG Ready** - Designed for retrieval-augmented generation  
✅ **Context Aware** - Understands document context  
✅ **Multi-turn** - Handles follow-up questions  
✅ **Accurate** - 8B parameters for high accuracy  
✅ **Long Context** - Handles large documents  

### Use Cases
- **Document Search** - "Find information about pricing policies"
- **FAQ Generation** - Auto-generate FAQs from documents
- **Document Summarization** - Generate intelligent summaries
- **Key Info Extraction** - Extract specific information
- **Multi-document QA** - Answer questions across multiple documents
- **Knowledge Retrieval** - RAG-based document intelligence

### Model Size
- **8B parameters** = ~5-6 GB disk space
- **Balanced performance** = good accuracy and speed
- **Recommended** = for production use

### Example Commands
```bash
# Pull the model
docker exec docubrain-ollama ollama pull llama3-chatqa:8b

# Use with API
curl http://localhost:12345/api/generate \
  -d '{
    "model": "llama3-chatqa:8b",
    "prompt": "Based on the document, what is the contract duration?",
    "context": "document_text_here"
  }'
```

---

## 📊 Model Comparison

| Feature | Granite3.2-Vision | LLaMA 3-ChatQA |
|---------|-------------------|----------------|
| **Best For** | Visual/Images | Text/Questions |
| **Parameters** | 2B | 8B |
| **Size** | ~1.2 GB | ~5-6 GB |
| **Speed** | Very Fast | Fast |
| **Memory** | Low | Medium |
| **Tables/Diagrams** | ⭐⭐⭐ | ⭐ |
| **Text QA** | ⭐ | ⭐⭐⭐ |
| **RAG Support** | ⭐ | ⭐⭐⭐ |
| **Accuracy** | High (Visual) | High (Text) |

---

## 🚀 Your Complete Model Stack

### Now Available in DocuBrain

1. **phi3:mini** (3.8B)
   - General purpose / lightweight
   - Good for basic tasks

2. **granite3.2-vision** (2B) ← NEW
   - Document visual understanding
   - Table/chart extraction

3. **llama3-chatqa:8b** (8B) ← NEW
   - Document Q&A / RAG
   - Intelligent retrieval

### Download Status
```bash
# Check all installed models
docker exec docubrain-ollama ollama list
```

---

## 💡 Recommended Workflows

### Workflow 1: Complete Document Analysis
```
1. Upload document (PDF/Image)
2. Use granite3.2-vision to extract visual content (tables, charts)
3. Use llama3-chatqa to answer questions about the document
4. Generate summary and key insights
```

### Workflow 2: Form Processing
```
1. Scan form/invoice
2. Use granite3.2-vision to extract table data
3. Validate extracted data with llama3-chatqa
4. Store in database
```

### Workflow 3: Smart Document Search
```
1. Index multiple documents with llama3-chatqa
2. User asks question
3. RAG retrieves relevant sections
4. LLaMA generates answer
```

---

## 🔧 API Integration Examples

### Using Granite for Image Analysis
```python
import requests
import base64

# Read image
with open("document.png", "rb") as f:
    image_data = base64.b64encode(f.read()).decode()

# Send to Ollama
response = requests.post("http://localhost:12345/api/generate", json={
    "model": "granite3.2-vision",
    "prompt": "Extract all tables and their data from this document",
    "images": [image_data],
    "stream": False
})

print(response.json()["response"])
```

### Using LLaMA for Document QA
```python
import requests

# Document text (from extraction or upload)
doc_text = """
Contract Duration: 24 months
Start Date: January 1, 2025
End Date: December 31, 2026
Renewal: Automatic annual renewal
"""

response = requests.post("http://localhost:12345/api/generate", json={
    "model": "llama3-chatqa:8b",
    "prompt": "How long is the contract and when does it end?",
    "context": doc_text,
    "stream": False
})

print(response.json()["response"])
```

---

## 📋 Model Download Progress

**Granite3.2-Vision**: Downloading (~1.5 GB)
**LLaMA 3-ChatQA 8B**: Downloading (~4.7 GB)

Total disk space needed: ~6.7 GB (including existing models)

**Estimated time**: 10-15 minutes on typical internet connection

---

## ✅ What's Next

1. **Wait for models to download** - Both are downloading now
2. **Test with sample documents** - Use the API examples above
3. **Integrate into DocuBrain UI** - Add model selection dropdown
4. **Build workflows** - Create document processing pipelines
5. **Monitor performance** - Track response times and accuracy

---

## 📚 Resources

- **Ollama Library**: https://ollama.com/library
- **Model Cards**:
  - Granite3.2-Vision: https://ollama.com/library/granite3.2-vision
  - LLaMA 3-ChatQA: https://ollama.com/library/llama3-chatqa
- **Documentation**: https://docs.ollama.com/

---

**Status**: Models downloading | ETA: 10-15 minutes ✅

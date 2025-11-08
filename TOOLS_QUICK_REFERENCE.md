# 🛠️ Tool Examples - Quick Reference Card

## 4 Production-Ready Tools with Complete Code

---

## 1. 📋 Document Summarizer

**What it does**: Automatically summarize long documents  
**Speed**: 2-3 seconds per document  
**Model**: phi3:mini (fast)  

### Quick Usage
```python
from document_tools import DocumentSummarizer

summarizer = DocumentSummarizer(detail_level="medium")
result = summarizer.summarize("Your long document...")
print(result['summary'])
print(result['key_points'])
```

### Batch Process
```python
documents = {
    "report1.txt": "content...",
    "report2.txt": "content...",
}
summarizer = DocumentSummarizer()
summaries = summarizer.summarize_batch(documents)
summarizer.export_summaries(summaries)
```

### Features
- ✅ Brief, Medium, or Detailed summaries
- ✅ Extract key points
- ✅ Batch processing
- ✅ Export to JSON
- ✅ File-based input

---

## 2. 📜 Contract Analyzer

**What it does**: Extract and analyze contracts  
**Speed**: 10-15 seconds per contract  
**Models**: phi3:mini + mistral

### Quick Usage
```python
from document_tools import ContractAnalyzer

analyzer = ContractAnalyzer()
report = analyzer.generate_summary_report(contract_text)

print(f"Key Parties: {report['key_info'].get('parties')}")
print(f"Risks: {report['identified_risks']}")
print(f"Terms: {report['key_terms']}")
```

### Extract Info
```python
info = analyzer.extract_contract_info(contract_text)
# Returns: parties, dates, payment_terms, etc.
```

### Check Compliance
```python
rules = ["Non-compete", "Confidentiality", "Liability Cap"]
compliance = analyzer.check_compliance(contract_text, rules)
```

### Features
- ✅ Extract key information
- ✅ Identify risks
- ✅ Summarize key terms
- ✅ Compliance checking
- ✅ Generate reports

---

## 3. 🔄 Smart Document Router

**What it does**: Auto-classify and route documents  
**Speed**: 3-5 seconds per document  
**Model**: mistral (smart classification)

### Quick Usage
```python
from document_tools import SmartDocumentRouter

router = SmartDocumentRouter()
result = router.route_document(doc_text, "document.txt")

print(f"Category: {result['category']}")
print(f"Send to: {result['routing_to']}")
print(f"Action: {result['action']}")
```

### Batch Route
```python
documents = {
    "doc1.txt": "Employee agreement...",
    "doc2.txt": "System documentation...",
    "doc3.txt": "Marketing proposal...",
}
results = router.batch_route_documents(documents)

# Generate report
report = router.generate_routing_report(results)
print(f"Auto-routed: {report['auto_routed']}")
print(f"Needs review: {report['requires_review']}")
```

### Categories
- Finance (invoices, receipts, budgets)
- HR (employees, payroll, benefits)
- Legal (contracts, compliance)
- Technical (code, systems, architecture)
- Marketing (campaigns, branding)
- Operations (processes, logistics)

### Features
- ✅ Automatic classification
- ✅ 6 predefined categories
- ✅ Confidence scoring
- ✅ Batch processing
- ✅ Custom routing destinations

---

## 4. 📊 Data Extractor

**What it does**: Extract structured data from documents  
**Speed**: 3-5 seconds per document  
**Model**: phi3:mini (accurate)

### Quick Usage
```python
from document_tools import DataExtractor

extractor = DataExtractor()

# Extract invoice data
invoice_data = extractor.extract_invoice_data(invoice_text)
# Returns: invoice_number, date, vendor, amount, etc.

# Extract custom fields
custom_fields = ["name", "email", "phone"]
data = extractor.extract_data(doc_text, custom_fields)
```

### Batch Extract
```python
documents = {
    "invoice1.txt": "content...",
    "invoice2.txt": "content...",
}

# Extract and export to CSV
results = extractor.batch_extract(documents, 
                                 extractor.profiles['invoice'])
extractor.export_to_csv(results, "invoices.csv")
```

### Predefined Profiles
- `invoice` - Extract: invoice_number, date, vendor, amount, items, due_date
- `application` - Extract: name, email, phone, position, experience, education
- `survey` - Extract: respondent_id, answers, date, satisfaction_score
- `contract` - Extract: parties, effective_date, term_length, payment_terms
- `form` - Extract: field_names, field_values, completion_date, signature

### Features
- ✅ Invoice extraction
- ✅ Application extraction
- ✅ Survey extraction
- ✅ Contract extraction
- ✅ Form extraction
- ✅ Custom field extraction
- ✅ Export to CSV
- ✅ Export to JSON
- ✅ Batch processing

---

## 🎯 Which Tool to Use When

| Situation | Tool | Speed | Cost |
|-----------|------|-------|------|
| Long report needs summary | Summarizer | ⚡⚡⚡ | Low |
| Legal document review | Contract Analyzer | ⚡⚡ | Med |
| Incoming document | Router | ⚡⚡ | Low |
| Pull data from form | Extractor | ⚡⚡⚡ | Low |
| Multiple documents | Batch tools | ⚡⚡ | Low |

---

## 📦 Integration into DocuBrain

Add tool buttons to sidebar (already shown in COMPLETE_TOOL_EXAMPLES.md):

```python
# Tools appear in sidebar with buttons:
📋 Summarize Doc
📜 Analyze Contract
🔄 Route Document
📊 Extract Data
```

Each button:
- Gets selected document
- Runs the tool
- Shows results in popup

---

## 💻 Installation

1. Save tool code to `desktop-app/document_tools.py`
2. Import in `main.py`:
   ```python
   from document_tools import (
       DocumentSummarizer,
       ContractAnalyzer,
       SmartDocumentRouter,
       DataExtractor
   )
   ```
3. Add tool buttons to sidebar (template in COMPLETE_TOOL_EXAMPLES.md)
4. Implement tool methods (provided)

---

## 🚀 Performance Notes

### Model Selection
- **phi3:mini** (2 GB): Summarizer, Extractor - FASTEST
- **mistral** (4.1 GB): Router, Search - BALANCED

### Processing Times
- Single document: 2-15 seconds
- Batch of 100 docs: 5-30 minutes
- Batch of 1000 docs: 1-5 hours

### Resource Usage
- Memory: ~2-4 GB during processing
- Disk: ~500 MB for results
- Network: None (runs locally)

---

## 📊 Output Examples

### Summarizer Output
```json
{
  "title": "Q4_Report.pdf",
  "summary": "The Q4 report shows 25% revenue growth...",
  "key_points": [
    "Revenue increased $2M",
    "Customer retention at 95%",
    "Cost reduction initiatives saved $500K"
  ]
}
```

### Contract Analyzer Output
```json
{
  "key_info": {
    "parties": "Company A and Company B",
    "effective_date": "2025-01-01",
    "payment_terms": "Net 30"
  },
  "identified_risks": [
    "Unlimited liability clause",
    "No termination for convenience"
  ]
}
```

### Router Output
```json
{
  "filename": "Employee_Agreement.pdf",
  "category": "HR",
  "routing_to": "hr@company.com",
  "confidence": 0.95,
  "action": "ROUTE"
}
```

### Extractor Output
```json
{
  "source_file": "invoice.txt",
  "data": {
    "invoice_number": "INV-001",
    "date": "2025-01-15",
    "vendor": "ABC Corp",
    "total_amount": "$5,000"
  }
}
```

---

## 🎓 Learning Order

1. **Start with**: Summarizer (simplest, fastest)
2. **Then try**: Data Extractor (predefined fields)
3. **Next level**: Document Router (classification)
4. **Advanced**: Contract Analyzer (complex analysis)

---

## 📝 Customization Ideas

### Summarizer
- Change detail levels
- Add topic-specific prompts
- Extract different key points
- Custom summary lengths

### Contract Analyzer
- Add new extraction fields
- Custom compliance rules
- Risk scoring
- Alert thresholds

### Document Router
- Add more categories
- Custom routing destinations
- Create email notifications
- Add confidence thresholds

### Data Extractor
- Create custom profiles
- Add data validation
- Generate reports
- Create database entries

---

## 🆘 Troubleshooting

**"Model not found"**
→ Start Ollama service first, then download model

**"Slow responses"**
→ Use phi3:mini for faster processing
→ Switch from llama3 to phi3:mini in config

**"Memory usage high"**
→ Close other applications
→ Use lighter models
→ Process fewer documents at once

**"Extraction not working"**
→ Check document has the data you're extracting
→ Adjust field names
→ Use profile instead of custom fields

---

## 📚 Documentation

Full details in: **COMPLETE_TOOL_EXAMPLES.md**

- Complete source code for each tool
- Every method documented
- Usage examples for each
- Integration instructions
- Customization guide

---

## ✅ You Now Have

✨ **4 Production-Ready Tools**
✨ **With Complete Source Code**
✨ **Ready to Integrate**
✨ **Ready to Customize**

**Start with the Summarizer, then build from there!** 🚀

---

**Quick Links:**
- Full code: COMPLETE_TOOL_EXAMPLES.md
- LLM System: TOOLS_DEVELOPMENT_GUIDE.md
- API Reference: QUICK_REFERENCE.md
- Model Selection: LLM_MODEL_GUIDE.md

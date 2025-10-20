# DeskAI Examples

This document provides practical examples of using DeskAI's Scan-to-Search feature.

## Starting the Application

```bash
# Terminal 1: Start the backend server
npm start

# Terminal 2 (optional): Serve the frontend
cd frontend/src
python3 -m http.server 8080
# or
npx serve
```

## API Examples

### 1. Health Check

```bash
curl http://localhost:3001/api/health
```

**Response:**
```json
{
  "status": "ok",
  "service": "DeskAI Scan-to-Search",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Upload a Scanned Document

```bash
curl -X POST http://localhost:3001/api/scan/upload \
  -F "file=@/path/to/scan.jpg"
```

**Response:**
```json
{
  "success": true,
  "documentId": "550e8400-e29b-41d4-a716-446655440000",
  "fileName": "scan.jpg",
  "extractedText": "INVOICE\nDate: January 15, 2024\nTotal: $2,700.00",
  "confidence": 95.5,
  "metadata": {
    "wordCount": 85,
    "lineCount": 22
  }
}
```

### 3. Search Documents

#### Search Everything
```bash
curl "http://localhost:3001/api/search?q=invoice&type=all&limit=10"
```

#### Search by Date
```bash
curl "http://localhost:3001/api/search?q=2024-01-15&type=date"
```

#### Search by Name
```bash
curl "http://localhost:3001/api/search?q=John+Smith&type=name"
```

#### Search by Number
```bash
curl "http://localhost:3001/api/search?q=2700&type=number"
```

**Response:**
```json
{
  "query": "invoice",
  "type": "all",
  "count": 2,
  "results": [
    {
      "documentId": "doc-id-1",
      "score": 5.0,
      "data": {
        "text": "INVOICE\nInvoice #: INV-2024-001...",
        "fileName": "invoice-2024.jpg"
      }
    }
  ]
}
```

### 4. Get All Documents

```bash
curl http://localhost:3001/api/documents
```

**Response:**
```json
{
  "count": 3,
  "documents": [
    {
      "id": "doc-id-1",
      "file_name": "invoice-2024.jpg",
      "file_type": "image/jpeg",
      "extracted_text": "...",
      "created_at": "2024-01-15T10:30:00.000Z",
      "metadata": {
        "confidence": 95.5,
        "wordCount": 85
      }
    }
  ]
}
```

### 5. Get Specific Document

```bash
curl http://localhost:3001/api/documents/DOC_ID
```

**Response:**
```json
{
  "id": "doc-id-1",
  "file_name": "invoice-2024.jpg",
  "file_type": "image/jpeg",
  "extracted_text": "Full text here...",
  "metadata": {},
  "created_at": "2024-01-15T10:30:00.000Z",
  "linkedDocuments": [
    {
      "id": "doc-id-2",
      "file_name": "related.jpg",
      "reason": "Shares date: 2024-01-15"
    }
  ],
  "tags": ["invoice", "important"]
}
```

### 6. Get Related Document Suggestions

```bash
curl http://localhost:3001/api/documents/DOC_ID/suggestions
```

**Response:**
```json
{
  "documentId": "doc-id-1",
  "suggestions": [
    {
      "documentId": "doc-id-2",
      "reason": "Shares date: 2024-01-15",
      "data": {
        "fileName": "related.jpg"
      }
    }
  ]
}
```

### 7. Add Tags to Document

```bash
curl -X POST http://localhost:3001/api/documents/DOC_ID/tags \
  -H "Content-Type: application/json" \
  -d '{"tags": ["invoice", "important", "2024"]}'
```

**Response:**
```json
{
  "documentId": "doc-id-1",
  "tags": ["invoice", "important", "2024"]
}
```

### 8. Search by Tag

```bash
curl http://localhost:3001/api/tags/invoice/documents
```

**Response:**
```json
{
  "tag": "invoice",
  "count": 2,
  "documents": [...]
}
```

### 9. Delete Document

```bash
curl -X DELETE http://localhost:3001/api/documents/DOC_ID
```

**Response:**
```json
{
  "success": true,
  "message": "Document deleted successfully"
}
```

## Frontend Usage Examples

### Upload Workflow

1. **Open the application** in your browser at `http://localhost:8080/index.html`

2. **Upload a document**:
   - Click "Choose File" or drag and drop an image
   - Supported formats: JPG, PNG, GIF, BMP, TIFF
   - Max size: 10MB

3. **View results**:
   - Extracted text preview
   - OCR confidence score
   - Number of words/lines extracted

### Search Workflow

1. **Enter search query** in the search box

2. **Select search type**:
   - All: Search everything
   - Text: Search in document content
   - Dates: Find specific dates
   - Numbers: Find amounts/totals
   - Names: Find capitalized names

3. **Press Enter or click Search**

4. **Click on any result** to view full details

### Document Details View

When you click on a document, you'll see:
- Full extracted text
- File information and metadata
- Linked/related documents
- Suggested documents
- Tags (if any)

## Use Cases

### Use Case 1: Invoice Processing

**Scenario**: Upload monthly invoices and find them by date or amount.

```bash
# Upload invoices
curl -X POST http://localhost:3001/api/scan/upload -F "file=@invoice-jan.jpg"
curl -X POST http://localhost:3001/api/scan/upload -F "file=@invoice-feb.jpg"

# Search by amount
curl "http://localhost:3001/api/search?q=2700&type=number"

# Search by date
curl "http://localhost:3001/api/search?q=January+2024&type=date"
```

### Use Case 2: Contract Management

**Scenario**: Store contracts and find by company name or person.

```bash
# Upload contract
curl -X POST http://localhost:3001/api/scan/upload -F "file=@contract-acme.jpg"

# Search by company
curl "http://localhost:3001/api/search?q=Acme+Corporation&type=text"

# Add tags
curl -X POST http://localhost:3001/api/documents/DOC_ID/tags \
  -H "Content-Type: application/json" \
  -d '{"tags": ["contract", "acme", "active"]}'
```

### Use Case 3: Receipt Organization

**Scenario**: Scan receipts and search by vendor or amount.

```bash
# Upload receipts
curl -X POST http://localhost:3001/api/scan/upload -F "file=@receipt1.jpg"
curl -X POST http://localhost:3001/api/scan/upload -F "file=@receipt2.jpg"

# Search by vendor
curl "http://localhost:3001/api/search?q=Office+Depot&type=text"

# Search by amount
curl "http://localhost:3001/api/search?q=91.52&type=number"
```

### Use Case 4: Meeting Notes

**Scenario**: Scan handwritten meeting notes and find by attendee or date.

```bash
# Upload notes
curl -X POST http://localhost:3001/api/scan/upload -F "file=@notes-jan15.jpg"

# Search by attendee
curl "http://localhost:3001/api/search?q=John+Smith&type=name"

# Get related documents (finds notes from same meeting series)
curl http://localhost:3001/api/documents/DOC_ID/suggestions
```

## Integration Examples

### Node.js Integration

```javascript
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

const API_BASE = 'http://localhost:3001/api';

// Upload a document
async function uploadDocument(filePath) {
  const formData = new FormData();
  formData.append('file', fs.createReadStream(filePath));
  
  const response = await fetch(`${API_BASE}/scan/upload`, {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}

// Search documents
async function searchDocuments(query, type = 'all') {
  const response = await fetch(
    `${API_BASE}/search?q=${encodeURIComponent(query)}&type=${type}`
  );
  return await response.json();
}

// Use it
const result = await uploadDocument('./invoice.jpg');
console.log('Uploaded:', result.documentId);

const searchResults = await searchDocuments('invoice');
console.log('Found:', searchResults.count, 'documents');
```

### Python Integration

```python
import requests

API_BASE = 'http://localhost:3001/api'

# Upload a document
def upload_document(file_path):
    with open(file_path, 'rb') as f:
        files = {'file': f}
        response = requests.post(f'{API_BASE}/scan/upload', files=files)
        return response.json()

# Search documents
def search_documents(query, search_type='all'):
    params = {'q': query, 'type': search_type}
    response = requests.get(f'{API_BASE}/search', params=params)
    return response.json()

# Use it
result = upload_document('./invoice.jpg')
print(f"Uploaded: {result['documentId']}")

search_results = search_documents('invoice')
print(f"Found: {search_results['count']} documents")
```

### Shell Script Integration

```bash
#!/bin/bash

API_BASE="http://localhost:3001/api"

# Upload all JPG files in a directory
for file in /path/to/scans/*.jpg; do
    echo "Uploading: $file"
    curl -X POST "$API_BASE/scan/upload" -F "file=@$file"
    echo ""
done

# Search and save results
curl "$API_BASE/search?q=invoice" | jq . > search_results.json
echo "Search results saved to search_results.json"
```

## Testing Examples

### Run Unit Tests

```bash
npm test
```

### Test OCR Processing

Due to network restrictions in sandboxed environments, OCR requires downloading language data files. For testing:

1. Run tests in an environment with internet access
2. Or pre-download language data
3. The tests will verify search and data linking functionality

### Manual Testing

```bash
# 1. Start server
npm start

# 2. Test health endpoint
curl http://localhost:3001/api/health

# 3. Test with sample image
curl -X POST http://localhost:3001/api/scan/upload \
  -F "file=@/path/to/test-image.jpg"

# 4. Test search
curl "http://localhost:3001/api/search?q=test"
```

## Troubleshooting Examples

### Issue: OCR not working

```bash
# Check if Tesseract.js can download language files
# May need internet access on first run
curl https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng/4.0.0_best_int/eng.traineddata.gz
```

### Issue: Database locked

```bash
# Check if database file is accessible
ls -la data/deskai.db

# Remove and recreate if corrupted
rm data/deskai.db
npm start
```

### Issue: Port already in use

```bash
# Find process using port 3001
lsof -i :3001

# Or use different port
PORT=3002 npm start
```

## Performance Tips

1. **Image Optimization**: Resize images to 1920x1080 or smaller before upload
2. **Batch Processing**: Upload multiple documents then search once
3. **Database Backup**: Regularly backup `data/deskai.db` and `uploads/`
4. **Indexing**: Documents are indexed automatically on upload

## Security Examples

### Secure Deployment

```bash
# Use environment variables
export DB_PATH=/secure/location/deskai.db
export UPLOAD_DIR=/secure/uploads

# Run with restricted permissions
chmod 700 data/
chmod 600 data/deskai.db
```

### HTTPS Configuration

```javascript
// For production, use HTTPS
import https from 'https';
import fs from 'fs';

const options = {
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
};

https.createServer(options, app).listen(3001);
```

## Additional Resources

- [Full Documentation](SCAN_TO_SEARCH.md)
- [User Guide](USER_GUIDE.md)
- [GitHub Repository](https://github.com/vand1290/DeskAI)

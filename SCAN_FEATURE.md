# Scan-to-Search Feature Guide

## Overview

The Scan-to-Search feature allows you to upload scanned documents or images and instantly search for key information within them. All processing is done **100% offline** using Tesseract.js for OCR.

## Features

### 1. OCR Text Extraction
- Upload images in JPG, PNG, or other common formats
- Automatic text extraction using Tesseract.js
- No internet connection required

### 2. Smart Metadata Extraction
The system automatically extracts and categorizes:
- **Names**: Capitalized names (e.g., "John Smith", "Mary Johnson")
- **Dates**: Various formats (01/15/2024, January 15, 2024, 2024-01-15)
- **Amounts**: Currency values ($1,234.56, €500.00, £99.99)
- **Keywords**: Frequently occurring significant words

### 3. Powerful Search
- Search across all scanned documents
- Find information by name, date, amount, or any text
- Results ranked by relevance
- Context snippets for each match

### 4. Intelligent Linking
- Automatically suggests related conversations based on content overlap
- One-click linking between scans and conversations
- Bidirectional references (scans ↔ conversations)

## Usage

### Uploading a Scan

1. Navigate to "Upload Scan" in the navigation bar
2. Drag and drop an image or click to browse
3. Wait for OCR processing (may take a few moments)
4. Review extracted information
5. Link to suggested conversations if relevant

### Searching Scans

1. Navigate to "Search Scans" in the navigation bar
2. Enter search terms in the search bar
3. View results with highlighted matches
4. Click on a result to see full details
5. Browse all scans in the sidebar

### Managing Scans

- **View Details**: Click on any scan to see full extracted text and metadata
- **Delete**: Click the × button to remove a scan
- **Link**: Connect scans to conversations for better organization

## API Endpoints

### Process Scan
```typescript
POST /api/scan/upload
Body: FormData with 'file' field
Response: {
  scan: ScanDocument,
  suggestedConversations: ConversationSummary[]
}
```

### List Scans
```typescript
GET /api/scans
Response: {
  scans: ScanDocument[]
}
```

### Get Scan
```typescript
GET /api/scans/:scanId
Response: {
  scan: ScanDocument
}
```

### Search Scans
```typescript
GET /api/scans/search?query=searchTerm
Response: {
  results: ScanSearchResult[]
}
```

### Delete Scan
```typescript
DELETE /api/scans/:scanId
Response: {
  deleted: boolean
}
```

### Link Scan to Conversation
```typescript
POST /api/scan/link
Body: {
  scanId: string,
  conversationId: string
}
Response: {
  linked: boolean
}
```

## Privacy & Security

- ✅ **100% Offline**: All OCR processing happens locally using Tesseract.js
- ✅ **No Cloud Storage**: Scans stored in `out/scans/` directory
- ✅ **Local Database**: Metadata stored in `out/scans.json`
- ✅ **User Control**: Delete or export scans anytime
- ✅ **No Tracking**: No telemetry or external API calls

## Data Storage

### Scan Files
Physical files are stored in: `out/scans/`
- Format: `{scanId}_{originalFilename}`
- Example: `1234567890-abc123_invoice.jpg`

### Scan Metadata
Metadata is stored in: `out/scans.json`
```json
{
  "id": "1234567890-abc123",
  "filename": "invoice.jpg",
  "extractedText": "Invoice\nFrom: John Smith...",
  "metadata": {
    "names": ["John Smith", "ABC Company"],
    "dates": ["01/15/2024", "January 30, 2024"],
    "totals": ["$1,234.56", "$500.00"],
    "keywords": ["invoice", "payment", "services"]
  },
  "uploadedAt": 1234567890000,
  "filePath": "out/scans/1234567890-abc123_invoice.jpg",
  "linkedConversations": ["conv-id-1"]
}
```

## Performance Notes

- OCR processing time depends on image size and complexity
- Typical processing time: 3-10 seconds per page
- Larger images may take longer
- Progress indicator shown during processing
- Recommended image resolution: 300 DPI for best results

## Limitations

- OCR accuracy depends on image quality
- Handwritten text may not be recognized accurately
- Very low resolution images may yield poor results
- Complex layouts may affect metadata extraction
- Maximum recommended file size: 10MB

## Tips for Best Results

1. **Use High Quality Images**: 300 DPI or higher
2. **Good Lighting**: Ensure scans are well-lit and clear
3. **Straight Alignment**: Keep documents straight when scanning
4. **High Contrast**: Black text on white background works best
5. **Clean Images**: Remove shadows and artifacts when possible

## Examples

### Example 1: Invoice Processing
```typescript
// Upload an invoice
const formData = new FormData();
formData.append('file', invoiceFile);

const response = await fetch('/api/scan/upload', {
  method: 'POST',
  body: formData
});

const { scan, suggestedConversations } = await response.json();
console.log('Extracted totals:', scan.metadata.totals);
console.log('Related conversations:', suggestedConversations);
```

### Example 2: Searching by Date
```typescript
// Search for scans from January 2024
const response = await fetch('/api/scans/search?query=January 2024');
const { results } = await response.json();

results.forEach(result => {
  console.log(`Found in ${result.filename}:`);
  result.matches.forEach(match => {
    console.log(`  ${match.type}: ${match.value}`);
  });
});
```

### Example 3: Linking to Conversation
```typescript
// Link a scan to a conversation
const response = await fetch('/api/scan/link', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    scanId: 'scan-123',
    conversationId: 'conv-456'
  })
});

const { linked } = await response.json();
console.log('Linked:', linked);
```

## Troubleshooting

### OCR Not Working
- Check that Tesseract.js is properly installed
- Verify image format is supported
- Ensure sufficient memory available

### Poor Text Recognition
- Improve image quality
- Increase scan resolution
- Adjust contrast and brightness
- Use cleaner source documents

### Slow Processing
- Reduce image size
- Use lower resolution for testing
- Check system resources
- Consider processing in batches

## Future Enhancements

Potential improvements:
- Multi-page document support
- PDF support with page-by-page OCR
- Advanced metadata extraction (addresses, phone numbers, emails)
- Batch processing for multiple files
- Custom metadata fields
- OCR language selection
- Text correction suggestions

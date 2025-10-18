# DeskAI
Your professional helpdesk with intelligent scan-to-search capabilities

## Features

✨ **Scan-to-Search**: Upload scanned documents and instantly search for key information
🔍 **Smart Search**: Find names, dates, totals, and keywords with advanced search algorithms
🔗 **Auto-Linking**: Automatically link related documents based on content
🏷️ **Tagging System**: Organize documents with custom tags
🔒 **Privacy First**: All processing happens offline - your data never leaves your device
⚡ **Fast OCR**: Powered by Tesseract.js for accurate text extraction

## Quick Start

### Installation

1. Clone the repository:
```bash
# Install dependencies
npm install

# Start the backend server
npm start
```

The server will run on `http://localhost:3001`

### Using the Frontend

Open `frontend/src/index.html` in your browser, or serve it locally:

```bash
npx serve frontend/src
```

### Upload Your First Scan

1. Click "Choose File" or drag & drop an image
2. Wait for OCR processing to complete
3. Search through extracted text immediately
4. View related documents automatically

## Documentation

- [Complete Scan-to-Search Documentation](docs/SCAN_TO_SEARCH.md)
- API Reference (see docs/SCAN_TO_SEARCH.md)
- Architecture Overview (see docs/SCAN_TO_SEARCH.md)

## Testing

```bash
npm test
```

## Technology Stack

- **Backend**: Node.js, Express
- **OCR**: Tesseract.js (offline processing)
- **Database**: SQLite3
- **Search**: Custom search engine with NLP features
- **Frontend**: Vanilla HTML/CSS/JavaScript

## License

ISC

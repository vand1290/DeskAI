# DeskAI User Guide

## Getting Started

Welcome to DeskAI's Scan-to-Search feature! This guide will help you get started with uploading, searching, and managing your scanned documents.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [First Time Setup](#first-time-setup)
3. [Uploading Documents](#uploading-documents)
4. [Searching Documents](#searching-documents)
5. [Managing Documents](#managing-documents)
6. [Tips for Best Results](#tips-for-best-results)
7. [Troubleshooting](#troubleshooting)

## System Requirements

- **Browser**: Modern web browser (Chrome, Firefox, Safari, Edge)
- **Node.js**: Version 18 or higher
- **Storage**: At least 100MB free space for application and documents
- **Memory**: 2GB RAM minimum (4GB recommended)

## First Time Setup

### 1. Install the Application

```bash
# Navigate to the DeskAI directory
cd DeskAI

# Install dependencies
npm install

# Start the server
npm start
```

### 2. Access the Frontend

- Open `frontend/src/index.html` in your browser
- Or use a local server: `npx serve frontend/src`
- The application will be available at `http://localhost:3000` (or the port shown)

### 3. Verify Installation

- You should see the DeskAI interface with:
  - Upload section
  - Search bar
  - Recent documents section

## Uploading Documents

### Supported File Types

- JPEG/JPG images
- PNG images
- GIF images
- BMP images
- TIFF images
- PDF files (coming soon)

### Upload Methods

#### Method 1: Drag and Drop

1. Drag your scanned document from your file explorer
2. Drop it in the upload area (highlighted in blue)
3. Wait for processing to complete

#### Method 2: File Browser

1. Click "Choose File" button
2. Select your document from the file browser
3. Click "Open"
4. Wait for processing to complete

### What Happens During Upload

1. **Upload**: File is uploaded to the server (usually instant for local setup)
2. **OCR Processing**: Text is extracted from the image (2-5 seconds)
3. **Indexing**: Document is indexed for searching (instant)
4. **Auto-Linking**: Related documents are identified (instant)

### Upload Results

After successful upload, you'll see:
- ✅ Success message
- File name
- OCR confidence score (higher is better, 90%+ is excellent)
- Number of words extracted
- Preview of extracted text

## Searching Documents

### Basic Search

1. Type your search query in the search box
2. Press Enter or click the Search button
3. View results sorted by relevance

### Search Types

Use the dropdown to select specific search types:

#### All (Default)
Searches across all fields - best for general queries

**Example**: "John Smith invoice"

#### Text
Searches within the full document text

**Example**: "terms and conditions"

#### Dates
Specifically searches for dates

**Example**: "2024-01-15" or "January 15, 2024"

#### Numbers
Searches for numbers and amounts

**Example**: "1234.56" or "$1,000"

#### Names
Searches for capitalized names

**Example**: "John Smith" or "Acme Corporation"

### Understanding Search Results

Each result shows:
- 📄 Document icon and name
- Relevance score (higher = better match)
- Text preview (first 150 characters)

Click any result to view full document details.

### Search Tips

- **Be specific**: "invoice 2024" is better than just "invoice"
- **Use multiple terms**: Combine keywords for better results
- **Try different types**: If text search fails, try searching by date or number
- **Partial matches work**: "John" will find "John Smith"

## Managing Documents

### Viewing Document Details

1. Click on any document in search results or recent documents list
2. A modal will open showing:
   - Full extracted text
   - File information (type, size, confidence)
   - Linked documents
   - Suggested related documents
   - Tags (if any)

### Linked Documents

Documents are automatically linked when they share:
- Same dates
- Similar numbers/amounts
- Common names
- Related keywords

Click on any linked document to view its details.

### Suggested Documents

The system automatically suggests related documents based on:
- Content similarity
- Shared entities (dates, names, numbers)
- Common topics

### Deleting Documents

1. Open document details
2. Click "Delete Document" button
3. Confirm deletion
4. Document and its file will be permanently removed

⚠️ **Warning**: Deletion is permanent and cannot be undone!

### Organizing with Tags (API Only)

While not yet available in the UI, you can add tags via the API:

```bash
curl -X POST http://localhost:3001/api/documents/DOC_ID/tags \
  -H "Content-Type: application/json" \
  -d '{"tags": ["invoice", "important", "2024"]}'
```

## Tips for Best Results

### Image Quality

For best OCR results:

✅ **Good**:
- High resolution (300 DPI or higher)
- Good contrast between text and background
- Horizontal text orientation
- Clear, sharp images
- Good lighting (for photos)

❌ **Avoid**:
- Low resolution images
- Blurry or out-of-focus scans
- Rotated text
- Poor contrast
- Heavy compression artifacts

### Document Preparation

Before scanning:
- Remove staples and paper clips
- Flatten creases and folds
- Clean any smudges or marks
- Ensure document is properly aligned

### Batch Processing

For multiple documents:
1. Upload and name them systematically
2. Use consistent file naming (e.g., "invoice-2024-01-15.jpg")
3. Add tags to related documents
4. Let auto-linking do its magic

### Search Strategy

1. **Start broad**: Begin with general keywords
2. **Refine**: Use search type filters to narrow results
3. **Explore links**: Check suggested documents for related information
4. **Try variations**: "Jan 15" vs "January 15" vs "2024-01-15"

## Troubleshooting

### OCR Returns Gibberish

**Problem**: Extracted text is mostly incorrect

**Solutions**:
- Check image quality and resolution
- Ensure text is horizontal
- Try rescanning at higher quality
- Verify image is not corrupted

### No Search Results Found

**Problem**: Search returns zero results

**Solutions**:
- Check spelling in search query
- Try different search types
- Use partial words (search "inv" instead of "invoice")
- Verify document was successfully uploaded and indexed
- Check recent documents to confirm upload

### Slow OCR Processing

**Problem**: Processing takes longer than 10 seconds

**Solutions**:
- Reduce image size (resize to 1920x1080 or smaller)
- Compress image quality slightly
- Close other running applications
- Check system resources (RAM, CPU)
- Restart the server

### Upload Fails

**Problem**: File upload errors or times out

**Solutions**:
- Check file size (must be under 10MB)
- Verify file type is supported
- Check network connection (if using remote server)
- Restart the server
- Check server logs for errors

### Database Locked

**Problem**: "Database is locked" error

**Solutions**:
- Close any other connections to the database
- Restart the application
- Check file permissions on `data/` directory
- Delete `data/deskai.db` to start fresh (⚠️ deletes all data)

### Frontend Not Connecting

**Problem**: "Failed to fetch" errors in browser

**Solutions**:
- Verify backend server is running (`npm start`)
- Check server is on correct port (3001)
- Verify API_BASE_URL in `frontend/src/app.js`
- Check browser console for CORS errors
- Try accessing API directly: `http://localhost:3001/api/health`

## Privacy and Security

### Data Privacy

- All processing happens locally on your machine
- No data is sent to external servers
- No internet connection required (after installation)
- Your documents never leave your computer

### Data Storage

- **Documents**: Stored in `./uploads/` directory
- **Database**: Stored in `./data/deskai.db`
- **Extracted Text**: Stored in database, encrypted at rest (OS level)

### Backup Recommendations

Regularly backup:
1. `./uploads/` - Your uploaded files
2. `./data/deskai.db` - Your database

```bash
# Simple backup command
cp -r uploads/ uploads-backup/
cp data/deskai.db data/deskai-backup.db
```

## Advanced Features

### API Access

All features are accessible via REST API:

```bash
# Upload a document
curl -X POST http://localhost:3001/api/scan/upload \
  -F "file=@document.jpg"

# Search
curl "http://localhost:3001/api/search?q=invoice&type=text"

# Get document details
curl http://localhost:3001/api/documents/DOC_ID
```

See [API Documentation](SCAN_TO_SEARCH.md#api-reference) for full reference.

### Custom Integration

DeskAI can be integrated with other tools:
- Use the REST API from other applications
- Import/export via database
- Extend with custom scripts

## Getting Help

### Resources

- [Full Documentation](SCAN_TO_SEARCH.md)
- [API Reference](SCAN_TO_SEARCH.md#api-reference)
- [GitHub Issues](https://github.com/vand1290/DeskAI/issues)

### Reporting Issues

When reporting issues, include:
1. Error message (exact text)
2. Steps to reproduce
3. Browser/Node.js version
4. Sample image (if relevant)
5. Server logs

### Community

- GitHub Discussions: Ask questions and share tips
- Issues: Report bugs and request features
- Pull Requests: Contribute improvements

## Next Steps

Now that you're familiar with the basics:

1. **Upload your documents**: Start building your searchable archive
2. **Experiment with search**: Try different search types and queries
3. **Explore links**: Discover related documents automatically
4. **Customize**: Extend the system to fit your needs

Happy scanning! 📄🔍

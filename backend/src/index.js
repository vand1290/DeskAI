import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import OCRProcessor from './ocr/ocrProcessor.js';
import SearchEngine from './search/searchEngine.js';
import DataLinker from './dataLinker/dataLinker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const uploadDir = path.join(__dirname, '../../uploads');
await fs.mkdir(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|bmp|tiff/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Initialize services
const ocrProcessor = new OCRProcessor();
const searchEngine = new SearchEngine();
const dataLinker = new DataLinker();

// Initialize data linker (lightweight, doesn't need network)
await dataLinker.initialize();

// Note: OCR processor initializes lazily when first needed
// This avoids network requests at startup
console.log('DeskAI services initialized (OCR will initialize on first use)');

// Routes

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'DeskAI Scan-to-Search',
    timestamp: new Date().toISOString()
  });
});

/**
 * Upload and process a scan
 */
app.post('/api/scan/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const documentId = uuidv4();
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;

    // Process with OCR
    console.log(`Processing scan: ${fileName}`);
    const ocrResult = await ocrProcessor.processImage(filePath);

    // Store in database
    await dataLinker.addDocument({
      id: documentId,
      filePath,
      fileName,
      fileType,
      extractedText: ocrResult.text,
      metadata: {
        confidence: ocrResult.confidence,
        wordCount: ocrResult.words.length,
        lineCount: ocrResult.lines.length
      }
    });

    // Index for searching
    searchEngine.indexDocument(documentId, {
      text: ocrResult.text,
      fileName,
      fileType,
      ...ocrResult
    });

    // Auto-link with related documents
    await dataLinker.autoLinkDocuments(documentId, searchEngine);

    res.json({
      success: true,
      documentId,
      fileName,
      extractedText: ocrResult.text,
      confidence: ocrResult.confidence,
      metadata: {
        wordCount: ocrResult.words.length,
        lineCount: ocrResult.lines.length
      }
    });
  } catch (error) {
    console.error('Error processing scan:', error);
    res.status(500).json({
      error: 'Failed to process scan',
      message: error.message
    });
  }
});

/**
 * Search for documents
 */
app.get('/api/search', async (req, res) => {
  try {
    const { q: query, type = 'all', limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const results = searchEngine.search(query, {
      type,
      limit: parseInt(limit)
    });

    res.json({
      query,
      type,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message
    });
  }
});

/**
 * Get a specific document
 */
app.get('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const document = await dataLinker.getDocument(id);

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Get linked documents
    const linkedDocuments = await dataLinker.getLinkedDocuments(id);
    
    // Get tags
    const tags = await dataLinker.getTags(id);

    res.json({
      ...document,
      linkedDocuments,
      tags
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({
      error: 'Failed to fetch document',
      message: error.message
    });
  }
});

/**
 * Get all documents
 */
app.get('/api/documents', async (req, res) => {
  try {
    const documents = await dataLinker.getAllDocuments();
    res.json({
      count: documents.length,
      documents
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      error: 'Failed to fetch documents',
      message: error.message
    });
  }
});

/**
 * Get suggestions for related documents
 */
app.get('/api/documents/:id/suggestions', async (req, res) => {
  try {
    const { id } = req.params;
    const suggestions = searchEngine.getSuggestions(id);
    
    res.json({
      documentId: id,
      suggestions
    });
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({
      error: 'Failed to get suggestions',
      message: error.message
    });
  }
});

/**
 * Add tags to a document
 */
app.post('/api/documents/:id/tags', async (req, res) => {
  try {
    const { id } = req.params;
    const { tags } = req.body;

    if (!tags || !Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags array is required' });
    }

    await dataLinker.addTags(id, tags);
    const allTags = await dataLinker.getTags(id);

    res.json({
      documentId: id,
      tags: allTags
    });
  } catch (error) {
    console.error('Error adding tags:', error);
    res.status(500).json({
      error: 'Failed to add tags',
      message: error.message
    });
  }
});

/**
 * Search by tag
 */
app.get('/api/tags/:tag/documents', async (req, res) => {
  try {
    const { tag } = req.params;
    const documents = await dataLinker.searchByTag(tag);

    res.json({
      tag,
      count: documents.length,
      documents
    });
  } catch (error) {
    console.error('Error searching by tag:', error);
    res.status(500).json({
      error: 'Failed to search by tag',
      message: error.message
    });
  }
});

/**
 * Delete a document
 */
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get document info first
    const document = await dataLinker.getDocument(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete from database
    await dataLinker.deleteDocument(id);
    
    // Remove from search index
    searchEngine.removeDocument(id);
    
    // Delete file
    try {
      await fs.unlink(document.file_path);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      error: 'Failed to delete document',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await ocrProcessor.terminate();
  await dataLinker.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await ocrProcessor.terminate();
  await dataLinker.close();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`DeskAI server running on http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  POST /api/scan/upload - Upload and process a scan');
  console.log('  GET  /api/search?q=query - Search documents');
  console.log('  GET  /api/documents - Get all documents');
  console.log('  GET  /api/documents/:id - Get specific document');
  console.log('  GET  /api/documents/:id/suggestions - Get related documents');
});

export default app;

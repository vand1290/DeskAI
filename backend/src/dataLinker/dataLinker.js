import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';

/**
 * Data Linker for managing relationships between scanned documents
 * and other files in the system
 */
class DataLinker {
  constructor(dbPath = './data/deskai.db') {
    this.dbPath = dbPath;
    this.db = null;
  }

  /**
   * Initialize the database
   */
  async initialize() {
    // Ensure data directory exists
    const dbDir = path.dirname(this.dbPath);
    try {
      await fs.mkdir(dbDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          console.error('Failed to open database:', err);
          reject(err);
        } else {
          console.log('Database connected');
          this.createTables()
            .then(resolve)
            .catch(reject);
        }
      });
    });
  }

  /**
   * Create database tables
   */
  async createTables() {
    const run = promisify(this.db.run.bind(this.db));

    await run(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        file_path TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_type TEXT,
        extracted_text TEXT,
        metadata TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS document_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_document_id TEXT NOT NULL,
        target_document_id TEXT NOT NULL,
        link_type TEXT,
        confidence REAL,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (source_document_id) REFERENCES documents(id),
        FOREIGN KEY (target_document_id) REFERENCES documents(id)
      )
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        document_id TEXT NOT NULL,
        tag TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (document_id) REFERENCES documents(id)
      )
    `);

    await run(`
      CREATE INDEX IF NOT EXISTS idx_document_links_source 
      ON document_links(source_document_id)
    `);

    await run(`
      CREATE INDEX IF NOT EXISTS idx_document_links_target 
      ON document_links(target_document_id)
    `);

    await run(`
      CREATE INDEX IF NOT EXISTS idx_tags_document 
      ON tags(document_id)
    `);

    console.log('Database tables created successfully');
  }

  /**
   * Add a new document
   */
  async addDocument(documentData) {
    const run = promisify(this.db.run.bind(this.db));
    
    const {
      id,
      filePath,
      fileName,
      fileType,
      extractedText,
      metadata
    } = documentData;

    await run(
      `INSERT INTO documents 
       (id, file_path, file_name, file_type, extracted_text, metadata) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        filePath,
        fileName,
        fileType,
        extractedText,
        JSON.stringify(metadata || {})
      ]
    );

    return id;
  }

  /**
   * Get a document by ID
   */
  async getDocument(documentId) {
    const get = promisify(this.db.get.bind(this.db));
    
    const doc = await get(
      'SELECT * FROM documents WHERE id = ?',
      [documentId]
    );

    if (doc) {
      doc.metadata = JSON.parse(doc.metadata || '{}');
    }

    return doc;
  }

  /**
   * Get all documents
   */
  async getAllDocuments() {
    const all = promisify(this.db.all.bind(this.db));
    
    const docs = await all('SELECT * FROM documents ORDER BY created_at DESC');
    
    return docs.map(doc => {
      doc.metadata = JSON.parse(doc.metadata || '{}');
      return doc;
    });
  }

  /**
   * Link two documents
   */
  async linkDocuments(sourceId, targetId, linkType, confidence, reason) {
    const run = promisify(this.db.run.bind(this.db));
    
    await run(
      `INSERT INTO document_links 
       (source_document_id, target_document_id, link_type, confidence, reason) 
       VALUES (?, ?, ?, ?, ?)`,
      [sourceId, targetId, linkType, confidence, reason]
    );
  }

  /**
   * Get linked documents for a given document
   */
  async getLinkedDocuments(documentId) {
    const all = promisify(this.db.all.bind(this.db));
    
    const links = await all(
      `SELECT dl.*, d.* 
       FROM document_links dl
       JOIN documents d ON (dl.target_document_id = d.id)
       WHERE dl.source_document_id = ?
       ORDER BY dl.confidence DESC`,
      [documentId]
    );

    return links.map(link => {
      link.metadata = JSON.parse(link.metadata || '{}');
      return link;
    });
  }

  /**
   * Auto-link documents based on content similarity
   */
  async autoLinkDocuments(documentId, searchEngine) {
    const document = await this.getDocument(documentId);
    if (!document) return;

    // Get suggestions from search engine
    const suggestions = searchEngine.getSuggestions(documentId);

    // Create links for high-confidence suggestions
    for (const suggestion of suggestions) {
      if (suggestion.documentId !== documentId) {
        await this.linkDocuments(
          documentId,
          suggestion.documentId,
          'auto',
          0.8,
          suggestion.reason
        );
      }
    }
  }

  /**
   * Add tags to a document
   */
  async addTags(documentId, tags) {
    const run = promisify(this.db.run.bind(this.db));
    
    for (const tag of tags) {
      await run(
        'INSERT INTO tags (document_id, tag) VALUES (?, ?)',
        [documentId, tag]
      );
    }
  }

  /**
   * Get tags for a document
   */
  async getTags(documentId) {
    const all = promisify(this.db.all.bind(this.db));
    
    const tags = await all(
      'SELECT tag FROM tags WHERE document_id = ?',
      [documentId]
    );

    return tags.map(t => t.tag);
  }

  /**
   * Search documents by tag
   */
  async searchByTag(tag) {
    const all = promisify(this.db.all.bind(this.db));
    
    const docs = await all(
      `SELECT DISTINCT d.* 
       FROM documents d
       JOIN tags t ON d.id = t.document_id
       WHERE t.tag = ?`,
      [tag]
    );

    return docs.map(doc => {
      doc.metadata = JSON.parse(doc.metadata || '{}');
      return doc;
    });
  }

  /**
   * Delete a document
   */
  async deleteDocument(documentId) {
    const run = promisify(this.db.run.bind(this.db));
    
    // Delete links
    await run(
      'DELETE FROM document_links WHERE source_document_id = ? OR target_document_id = ?',
      [documentId, documentId]
    );
    
    // Delete tags
    await run(
      'DELETE FROM tags WHERE document_id = ?',
      [documentId]
    );
    
    // Delete document
    await run(
      'DELETE FROM documents WHERE id = ?',
      [documentId]
    );
  }

  /**
   * Close the database connection
   */
  async close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }
}

export default DataLinker;

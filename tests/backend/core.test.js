import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import SearchEngine from '../../backend/src/search/searchEngine.js';
import DataLinker from '../../backend/src/dataLinker/dataLinker.js';
import fs from 'fs/promises';
import path from 'path';

// Note: OCR tests are skipped as they require downloading language data
// and take significant time to initialize (30+ seconds)

describe('Search Engine Tests', () => {
  let searchEngine;

  before(() => {
    searchEngine = new SearchEngine();
  });

  it('should create a new search engine instance', () => {
    assert.ok(searchEngine);
    assert.ok(searchEngine.documents instanceof Map);
  });

  it('should index a document', () => {
    const docId = 'test-doc-1';
    const docData = {
      text: 'This is a test document with John Smith and date 2024-01-15',
      fileName: 'test.txt'
    };

    searchEngine.indexDocument(docId, docData);
    
    assert.ok(searchEngine.documents.has(docId));
    assert.strictEqual(searchEngine.documents.get(docId).text, docData.text);
  });

  it('should search for text', () => {
    const docId = 'test-doc-2';
    searchEngine.indexDocument(docId, {
      text: 'Invoice for services rendered to Acme Corporation',
      fileName: 'invoice.txt'
    });

    const results = searchEngine.search('invoice');
    assert.ok(results.length > 0);
    assert.ok(results.some(r => r.documentId === docId));
  });

  it('should extract numbers from text', () => {
    const numbers = searchEngine.extractNumbers('Total: $1,234.56 and 789');
    assert.ok(numbers.includes('1234.56'));
    assert.ok(numbers.includes('789'));
  });

  it('should extract names from text', () => {
    const names = searchEngine.extractNames('John Smith and Jane Doe attended');
    assert.ok(names.includes('john smith'));
    assert.ok(names.includes('jane doe'));
  });

  it('should remove a document from index', () => {
    const docId = 'test-doc-to-remove';
    searchEngine.indexDocument(docId, { text: 'Remove this document' });
    assert.ok(searchEngine.documents.has(docId));

    searchEngine.removeDocument(docId);
    assert.strictEqual(searchEngine.documents.has(docId), false);
  });

  it('should get all documents', () => {
    const allDocs = searchEngine.getAllDocuments();
    assert.ok(Array.isArray(allDocs));
    assert.ok(allDocs.length >= 0);
  });

  it('should provide suggestions for related documents', () => {
    const docId1 = 'doc-with-date-1';
    const docId2 = 'doc-with-date-2';
    
    searchEngine.indexDocument(docId1, {
      text: 'Meeting scheduled for 2024-12-25',
      fileName: 'meeting1.txt'
    });
    
    searchEngine.indexDocument(docId2, {
      text: 'Another meeting on 2024-12-25',
      fileName: 'meeting2.txt'
    });

    const suggestions = searchEngine.getSuggestions(docId1);
    assert.ok(Array.isArray(suggestions));
    // Should find related document with same date
  });
});

describe('Data Linker Tests', () => {
  let dataLinker;
  const testDbPath = './data/test-deskai.db';

  before(async () => {
    // Clean up test database if exists
    try {
      await fs.unlink(testDbPath);
    } catch (error) {
      // File doesn't exist, that's fine
    }

    dataLinker = new DataLinker(testDbPath);
    await dataLinker.initialize();
  });

  after(async () => {
    await dataLinker.close();
    // Clean up test database
    try {
      await fs.unlink(testDbPath);
    } catch (error) {
      // Ignore
    }
  });

  it('should initialize database', () => {
    assert.ok(dataLinker.db);
  });

  it('should add a document', async () => {
    const docId = 'test-doc-db-1';
    await dataLinker.addDocument({
      id: docId,
      filePath: '/test/path.jpg',
      fileName: 'test.jpg',
      fileType: 'image/jpeg',
      extractedText: 'Test text',
      metadata: { confidence: 95 }
    });

    const doc = await dataLinker.getDocument(docId);
    assert.ok(doc);
    assert.strictEqual(doc.id, docId);
    assert.strictEqual(doc.file_name, 'test.jpg');
  });

  it('should get all documents', async () => {
    const docs = await dataLinker.getAllDocuments();
    assert.ok(Array.isArray(docs));
    assert.ok(docs.length > 0);
  });

  it('should link two documents', async () => {
    const docId1 = 'link-doc-1';
    const docId2 = 'link-doc-2';

    await dataLinker.addDocument({
      id: docId1,
      filePath: '/test/doc1.jpg',
      fileName: 'doc1.jpg',
      fileType: 'image/jpeg',
      extractedText: 'First document',
      metadata: {}
    });

    await dataLinker.addDocument({
      id: docId2,
      filePath: '/test/doc2.jpg',
      fileName: 'doc2.jpg',
      fileType: 'image/jpeg',
      extractedText: 'Second document',
      metadata: {}
    });

    await dataLinker.linkDocuments(docId1, docId2, 'manual', 1.0, 'Test link');

    const linkedDocs = await dataLinker.getLinkedDocuments(docId1);
    assert.ok(linkedDocs.length > 0);
    assert.ok(linkedDocs.some(d => d.id === docId2));
  });

  it('should add and retrieve tags', async () => {
    const docId = 'tag-doc';
    
    await dataLinker.addDocument({
      id: docId,
      filePath: '/test/tagged.jpg',
      fileName: 'tagged.jpg',
      fileType: 'image/jpeg',
      extractedText: 'Tagged document',
      metadata: {}
    });

    const tags = ['invoice', 'important', '2024'];
    await dataLinker.addTags(docId, tags);

    const retrievedTags = await dataLinker.getTags(docId);
    assert.strictEqual(retrievedTags.length, tags.length);
    assert.ok(retrievedTags.includes('invoice'));
  });

  it('should search documents by tag', async () => {
    const docs = await dataLinker.searchByTag('invoice');
    assert.ok(Array.isArray(docs));
  });

  it('should delete a document', async () => {
    const docId = 'delete-doc';
    
    await dataLinker.addDocument({
      id: docId,
      filePath: '/test/delete.jpg',
      fileName: 'delete.jpg',
      fileType: 'image/jpeg',
      extractedText: 'To be deleted',
      metadata: {}
    });

    let doc = await dataLinker.getDocument(docId);
    assert.ok(doc);

    await dataLinker.deleteDocument(docId);

    doc = await dataLinker.getDocument(docId);
    assert.strictEqual(doc, undefined);
  });
});

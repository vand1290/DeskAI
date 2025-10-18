import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { 
  WritingTool, 
  PhotoTool, 
  DocumentTool, 
  HandwritingTool, 
  FileSorter 
} from '../tools';

const TEST_DATA_DIR = '/tmp/deskai-tools-test';

describe('WritingTool', () => {
  let writingTool: WritingTool;
  const testDir = path.join(TEST_DATA_DIR, 'documents');

  beforeEach(() => {
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true });
    }
    fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
    writingTool = new WritingTool(testDir);
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true });
    }
  });

  describe('createDocument', () => {
    it('should create a new document successfully', async () => {
      const result = await writingTool.createDocument('test.txt', 'Hello World');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('filename', 'test.txt');
      expect(result.data).toHaveProperty('filepath');
      
      const filepath = path.join(testDir, 'test.txt');
      expect(fs.existsSync(filepath)).toBe(true);
      expect(fs.readFileSync(filepath, 'utf-8')).toBe('Hello World');
    });

    it('should not overwrite existing files', async () => {
      await writingTool.createDocument('test.txt', 'First content');
      const result = await writingTool.createDocument('test.txt', 'Second content');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('already exists');
    });
  });

  describe('editDocument', () => {
    it('should edit an existing document', async () => {
      await writingTool.createDocument('test.txt', 'Original');
      const result = await writingTool.editDocument('test.txt', 'Updated');
      
      expect(result.success).toBe(true);
      
      const filepath = path.join(testDir, 'test.txt');
      expect(fs.readFileSync(filepath, 'utf-8')).toBe('Updated');
    });

    it('should fail to edit non-existent document', async () => {
      const result = await writingTool.editDocument('nonexistent.txt', 'Content');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('readDocument', () => {
    it('should read an existing document', async () => {
      await writingTool.createDocument('test.txt', 'Test content');
      const result = await writingTool.readDocument('test.txt');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('content', 'Test content');
      expect(result.data).toHaveProperty('filename', 'test.txt');
    });

    it('should fail to read non-existent document', async () => {
      const result = await writingTool.readDocument('nonexistent.txt');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('listDocuments', () => {
    it('should list all documents', async () => {
      await writingTool.createDocument('doc1.txt', 'Content 1');
      await writingTool.createDocument('doc2.txt', 'Content 2');
      
      const result = await writingTool.listDocuments();
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('documents');
      expect((result.data as any).documents).toHaveLength(2);
    });

    it('should return empty list for no documents', async () => {
      const result = await writingTool.listDocuments();
      
      expect(result.success).toBe(true);
      expect((result.data as any).documents).toHaveLength(0);
    });
  });

  describe('deleteDocument', () => {
    it('should delete an existing document', async () => {
      await writingTool.createDocument('test.txt', 'Content');
      const result = await writingTool.deleteDocument('test.txt');
      
      expect(result.success).toBe(true);
      
      const filepath = path.join(testDir, 'test.txt');
      expect(fs.existsSync(filepath)).toBe(false);
    });

    it('should fail to delete non-existent document', async () => {
      const result = await writingTool.deleteDocument('nonexistent.txt');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});

describe('PhotoTool', () => {
  let photoTool: PhotoTool;
  const testDir = path.join(TEST_DATA_DIR, 'photos');

  beforeEach(() => {
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true });
    }
    fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
    photoTool = new PhotoTool(testDir);
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true });
    }
  });

  describe('getImageInfo', () => {
    it('should get info for an existing image', async () => {
      const imagePath = path.join(testDir, 'test.jpg');
      fs.writeFileSync(imagePath, 'fake image data');
      
      const result = await photoTool.getImageInfo('test.jpg');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('filename', 'test.jpg');
      expect(result.data).toHaveProperty('format', '.jpg');
    });

    it('should fail for non-existent image', async () => {
      const result = await photoTool.getImageInfo('nonexistent.jpg');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('extractText', () => {
    it('should return stub OCR result', async () => {
      const imagePath = path.join(testDir, 'test.jpg');
      fs.writeFileSync(imagePath, 'fake image data');
      
      const result = await photoTool.extractText('test.jpg');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('isStub', true);
      expect(result.data).toHaveProperty('message');
    });
  });

  describe('listImages', () => {
    it('should list all images', async () => {
      fs.writeFileSync(path.join(testDir, 'image1.jpg'), 'data');
      fs.writeFileSync(path.join(testDir, 'image2.png'), 'data');
      fs.writeFileSync(path.join(testDir, 'document.txt'), 'not an image');
      
      const result = await photoTool.listImages();
      
      expect(result.success).toBe(true);
      expect((result.data as any).images).toHaveLength(2);
    });
  });
});

describe('DocumentTool', () => {
  let documentTool: DocumentTool;
  const testDir = path.join(TEST_DATA_DIR, 'documents');

  beforeEach(() => {
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true });
    }
    fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
    documentTool = new DocumentTool(testDir);
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true });
    }
  });

  describe('summarizeDocument', () => {
    it('should summarize a document', async () => {
      const content = 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6';
      fs.writeFileSync(path.join(testDir, 'test.txt'), content);
      
      const result = await documentTool.summarizeDocument('test.txt');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('summary');
      expect(result.data).toHaveProperty('isStub', true);
    });

    it('should fail for non-existent document', async () => {
      const result = await documentTool.summarizeDocument('nonexistent.txt');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('extractData', () => {
    it('should extract emails and dates', async () => {
      const content = 'Contact me at test@example.com or on 01/15/2024. Phone: 555-123-4567';
      fs.writeFileSync(path.join(testDir, 'test.txt'), content);
      
      const result = await documentTool.extractData('test.txt');
      
      expect(result.success).toBe(true);
      expect((result.data as any).extracted.emails).toContain('test@example.com');
      expect((result.data as any).extracted.dates).toContain('01/15/2024');
      expect((result.data as any).extracted.phones).toContain('555-123-4567');
    });
  });

  describe('getDocumentInfo', () => {
    it('should get document metadata', async () => {
      const content = 'Test document with some content';
      fs.writeFileSync(path.join(testDir, 'test.txt'), content);
      
      const result = await documentTool.getDocumentInfo('test.txt');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('filename', 'test.txt');
      expect(result.data).toHaveProperty('wordCount');
      expect(result.data).toHaveProperty('lineCount');
    });
  });
});

describe('HandwritingTool', () => {
  let handwritingTool: HandwritingTool;

  beforeEach(() => {
    handwritingTool = new HandwritingTool();
  });

  describe('extractHandwriting', () => {
    it('should return stub HTR result', async () => {
      const result = await handwritingTool.extractHandwriting('test.jpg');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('isStub', true);
      expect(result.data).toHaveProperty('message');
      expect(result.data).toHaveProperty('extractedText');
    });
  });
});

describe('FileSorter', () => {
  let fileSorter: FileSorter;
  const testDir = path.join(TEST_DATA_DIR, 'files');

  beforeEach(() => {
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
    fileSorter = new FileSorter();
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true });
    }
  });

  describe('sortFiles', () => {
    it('should sort files by name ascending', async () => {
      fs.writeFileSync(path.join(testDir, 'c.txt'), 'content');
      fs.writeFileSync(path.join(testDir, 'a.txt'), 'content');
      fs.writeFileSync(path.join(testDir, 'b.txt'), 'content');
      
      const result = await fileSorter.sortFiles(testDir, { by: 'name', order: 'asc' });
      
      expect(result.success).toBe(true);
      const files = (result.data as any).files;
      expect(files[0].filename).toBe('a.txt');
      expect(files[1].filename).toBe('b.txt');
      expect(files[2].filename).toBe('c.txt');
    });

    it('should sort files by name descending', async () => {
      fs.writeFileSync(path.join(testDir, 'a.txt'), 'content');
      fs.writeFileSync(path.join(testDir, 'b.txt'), 'content');
      fs.writeFileSync(path.join(testDir, 'c.txt'), 'content');
      
      const result = await fileSorter.sortFiles(testDir, { by: 'name', order: 'desc' });
      
      expect(result.success).toBe(true);
      const files = (result.data as any).files;
      expect(files[0].filename).toBe('c.txt');
      expect(files[1].filename).toBe('b.txt');
      expect(files[2].filename).toBe('a.txt');
    });

    it('should sort files by size', async () => {
      fs.writeFileSync(path.join(testDir, 'large.txt'), 'a'.repeat(100));
      fs.writeFileSync(path.join(testDir, 'small.txt'), 'a');
      fs.writeFileSync(path.join(testDir, 'medium.txt'), 'a'.repeat(50));
      
      const result = await fileSorter.sortFiles(testDir, { by: 'size', order: 'asc' });
      
      expect(result.success).toBe(true);
      const files = (result.data as any).files;
      expect(files[0].filename).toBe('small.txt');
      expect(files[1].filename).toBe('medium.txt');
      expect(files[2].filename).toBe('large.txt');
    });

    it('should fail for non-existent directory', async () => {
      const result = await fileSorter.sortFiles('/nonexistent/dir', { by: 'name', order: 'asc' });
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });

  describe('organizeByDate', () => {
    it('should organize files by date', async () => {
      fs.writeFileSync(path.join(testDir, 'file1.txt'), 'content');
      fs.writeFileSync(path.join(testDir, 'file2.txt'), 'content');
      
      const result = await fileSorter.organizeByDate(testDir);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('organizationScheme', 'by-date');
      expect(result.data).toHaveProperty('groups');
      expect((result.data as any).groupCount).toBeGreaterThan(0);
    });
  });

  describe('organizeByType', () => {
    it('should organize files by type', async () => {
      fs.writeFileSync(path.join(testDir, 'doc.txt'), 'content');
      fs.writeFileSync(path.join(testDir, 'image.jpg'), 'content');
      fs.writeFileSync(path.join(testDir, 'data.json'), 'content');
      
      const result = await fileSorter.organizeByType(testDir);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveProperty('organizationScheme', 'by-type');
      const groups = (result.data as any).groups;
      expect(groups).toHaveProperty('.txt');
      expect(groups).toHaveProperty('.jpg');
      expect(groups).toHaveProperty('.json');
    });
  });
});

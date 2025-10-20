/**
 * Unit tests for DocumentTool
 */

import * as fs from 'fs';
import * as path from 'path';
import { DocumentTool } from '../tools/document';

describe('DocumentTool', () => {
  let tool: DocumentTool;
  const testDir = path.join(process.cwd(), 'out', 'test_documents');

  beforeEach(() => {
    tool = new DocumentTool();
    
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('extractFromText', () => {
    it('should extract text from text file', async () => {
      const testFile = path.join(testDir, 'test.txt');
      const content = 'This is test content.\nWith multiple lines.';
      fs.writeFileSync(testFile, content, 'utf-8');

      const result = await tool.execute({
        action: 'extractText',
        filePath: testFile
      });

      expect(result.text).toBe(content);
    });

    it('should throw error for non-existent file', async () => {
      await expect(tool.execute({
        action: 'extractText',
        filePath: '/nonexistent/file.txt'
      })).rejects.toThrow('Text file not found');
    });
  });

  describe('summarize', () => {
    it('should summarize text', async () => {
      const text = 'First sentence. Second sentence. Third sentence. Fourth sentence. Fifth sentence.';
      
      const result = await tool.execute({
        action: 'summarize',
        text
      });

      expect(result.summary).toBeTruthy();
      expect(result.summary.length).toBeLessThan(text.length);
    });

    it('should handle short text', async () => {
      const text = 'Very short text.';
      
      const result = await tool.execute({
        action: 'summarize',
        text
      });

      expect(result.summary).toBeTruthy();
    });

    it('should require text parameter', async () => {
      await expect(tool.execute({
        action: 'summarize'
      })).rejects.toThrow('text is required');
    });
  });

  describe('extractData', () => {
    it('should extract dates from text', async () => {
      const text = 'Meeting on 12/25/2023 and another on Jan 15, 2024';
      
      const result = await tool.execute({
        action: 'extractData',
        text,
        dataType: 'dates'
      });

      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should extract emails from text', async () => {
      const text = 'Contact us at test@example.com or support@company.org';
      
      const result = await tool.execute({
        action: 'extractData',
        text,
        dataType: 'emails'
      });

      expect(result.data).toContain('test@example.com');
      expect(result.data).toContain('support@company.org');
    });

    it('should extract amounts from text', async () => {
      const text = 'The total is $1,234.56 and the fee is $100.00 USD';
      
      const result = await tool.execute({
        action: 'extractData',
        text,
        dataType: 'amounts'
      });

      expect(result.data).toBeInstanceOf(Array);
      expect(result.data.length).toBeGreaterThan(0);
    });

    it('should remove duplicate extractions', async () => {
      const text = 'Email test@example.com again test@example.com';
      
      const result = await tool.execute({
        action: 'extractData',
        text,
        dataType: 'emails'
      });

      expect(result.data).toEqual(['test@example.com']);
    });

    it('should require dataType', async () => {
      await expect(tool.execute({
        action: 'extractData',
        text: 'some text'
      })).rejects.toThrow('dataType is required');
    });
  });

  describe('searchText', () => {
    it('should find text with context', async () => {
      const text = 'This is a long document with important information about testing.';
      
      const result = await tool.execute({
        action: 'search',
        text,
        query: 'important'
      });

      expect(result.results).toBeInstanceOf(Array);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0]).toHaveProperty('text');
      expect(result.results[0]).toHaveProperty('position');
      expect(result.results[0]).toHaveProperty('context');
    });

    it('should find multiple occurrences', async () => {
      const text = 'Test the test testing test';
      
      const result = await tool.execute({
        action: 'search',
        text,
        query: 'test'
      });

      expect(result.results.length).toBeGreaterThan(1);
    });

    it('should be case insensitive', async () => {
      const text = 'Testing with TESTING and TeSt';
      
      const result = await tool.execute({
        action: 'search',
        text,
        query: 'testing'
      });

      expect(result.results.length).toBeGreaterThan(0);
    });

    it('should require query', async () => {
      await expect(tool.execute({
        action: 'search',
        text: 'some text'
      })).rejects.toThrow('query is required');
    });
  });

  describe('getMetadata', () => {
    it('should get metadata from text file', async () => {
      const testFile = path.join(testDir, 'test.txt');
      fs.writeFileSync(testFile, 'test content', 'utf-8');

      const result = await tool.execute({
        action: 'getMetadata',
        filePath: testFile
      });

      expect(result).toHaveProperty('created');
      expect(result).toHaveProperty('modified');
      expect(result).toHaveProperty('format');
      expect(result.format).toBe('txt');
    });

    it('should throw error for non-existent file', async () => {
      await expect(tool.execute({
        action: 'getMetadata',
        filePath: '/nonexistent/file.txt'
      })).rejects.toThrow('File not found');
    });
  });
});

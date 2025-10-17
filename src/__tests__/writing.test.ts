/**
 * Unit tests for WritingTool
 */

import * as fs from 'fs';
import * as path from 'path';
import { WritingTool } from '../tools/writing';

describe('WritingTool', () => {
  let tool: WritingTool;
  const testDir = path.join(process.cwd(), 'out', 'test_writing');

  beforeEach(() => {
    tool = new WritingTool(testDir);
    
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    tool.cleanup();
    
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('createDocument', () => {
    it('should create a text document', async () => {
      const result = await tool.execute({
        action: 'create',
        title: 'Test Document',
        content: 'This is test content',
        format: 'txt'
      });

      expect(result.success).toBe(true);
      expect(result.path).toContain('Test_Document.txt');
      expect(fs.existsSync(result.path)).toBe(true);
    });

    it('should create a markdown document', async () => {
      const result = await tool.execute({
        action: 'create',
        title: 'Markdown Doc',
        content: '# Header\n\nContent',
        format: 'md'
      });

      expect(result.success).toBe(true);
      expect(result.path).toContain('Markdown_Doc.md');
    });

    it('should sanitize filename', async () => {
      const result = await tool.execute({
        action: 'create',
        title: 'Test@#$Document!',
        content: 'Content',
        format: 'txt'
      });

      expect(result.path).not.toContain('@');
      expect(result.path).not.toContain('#');
      expect(result.path).not.toContain('!');
    });

    it('should throw error if file exists', async () => {
      const title = 'Existing Document';
      
      await tool.execute({
        action: 'create',
        title,
        content: 'Content',
        format: 'txt'
      });

      await expect(tool.execute({
        action: 'create',
        title,
        content: 'New content',
        format: 'txt'
      })).rejects.toThrow('Document already exists');
    });

    it('should require title and content', async () => {
      await expect(tool.execute({
        action: 'create',
        content: 'Content',
        format: 'txt'
      })).rejects.toThrow('title is required');

      await expect(tool.execute({
        action: 'create',
        title: 'Test',
        format: 'txt'
      })).rejects.toThrow('content is required');
    });
  });

  describe('editDocument', () => {
    it('should edit an existing document', async () => {
      const createResult = await tool.execute({
        action: 'create',
        title: 'Edit Test',
        content: 'Original content',
        format: 'txt'
      });

      const editResult = await tool.execute({
        action: 'edit',
        filePath: createResult.path,
        content: 'Updated content'
      });

      expect(editResult.success).toBe(true);
      
      const content = fs.readFileSync(createResult.path, 'utf-8');
      expect(content).toBe('Updated content');
    });

    it('should throw error for non-existent file', async () => {
      await expect(tool.execute({
        action: 'edit',
        filePath: path.join(testDir, 'nonexistent.txt'),
        content: 'Content'
      })).rejects.toThrow('Document not found');
    });

    it('should require filePath and content', async () => {
      await expect(tool.execute({
        action: 'edit',
        content: 'Content'
      })).rejects.toThrow('filePath is required');
    });
  });

  describe('formatDocument', () => {
    it('should format as markdown', async () => {
      const content = '# Header\n\nContent';
      
      const result = await tool.execute({
        action: 'format',
        content,
        style: 'markdown'
      });

      expect(result.formatted).toBe(content);
    });

    it('should strip markdown formatting for plain text', async () => {
      const content = '# Header\n\n**Bold** and *italic* text\n\n[Link](http://example.com)';
      
      const result = await tool.execute({
        action: 'format',
        content,
        style: 'plain'
      });

      expect(result.formatted).not.toContain('**');
      expect(result.formatted).not.toContain('*');
      expect(result.formatted).not.toContain('[');
      expect(result.formatted).toContain('Bold');
      expect(result.formatted).toContain('italic');
      expect(result.formatted).toContain('Link');
    });

    it('should require content and style', async () => {
      await expect(tool.execute({
        action: 'format',
        style: 'plain'
      })).rejects.toThrow('content is required');

      await expect(tool.execute({
        action: 'format',
        content: 'Content'
      })).rejects.toThrow('style is required');
    });
  });

  describe('getTemplates', () => {
    it('should return available templates', async () => {
      const result = await tool.execute({
        action: 'getTemplates'
      });

      expect(result.templates).toBeInstanceOf(Array);
      expect(result.templates.length).toBeGreaterThan(0);
      expect(result.templates[0]).toHaveProperty('name');
      expect(result.templates[0]).toHaveProperty('description');
    });

    it('should include standard templates', async () => {
      const result = await tool.execute({
        action: 'getTemplates'
      });

      const templateNames = result.templates.map((t: any) => t.name);
      expect(templateNames).toContain('business_letter');
      expect(templateNames).toContain('memo');
      expect(templateNames).toContain('meeting_notes');
      expect(templateNames).toContain('blank');
    });
  });

  describe('useTemplate', () => {
    it('should return business letter template', async () => {
      const result = await tool.execute({
        action: 'useTemplate',
        templateName: 'business_letter'
      });

      expect(result.content).toContain('[Your Name]');
      expect(result.content).toContain('[Recipient Name]');
      expect(result.format).toBe('txt');
    });

    it('should return memo template', async () => {
      const result = await tool.execute({
        action: 'useTemplate',
        templateName: 'memo'
      });

      expect(result.content).toContain('MEMORANDUM');
      expect(result.content).toContain('TO:');
      expect(result.content).toContain('FROM:');
    });

    it('should return meeting notes template', async () => {
      const result = await tool.execute({
        action: 'useTemplate',
        templateName: 'meeting_notes'
      });

      expect(result.content).toContain('# Meeting Notes');
      expect(result.content).toContain('## Agenda');
      expect(result.format).toBe('md');
    });

    it('should return blank template', async () => {
      const result = await tool.execute({
        action: 'useTemplate',
        templateName: 'blank'
      });

      expect(result.content).toBe('');
      expect(result.format).toBe('txt');
    });

    it('should throw error for unknown template', async () => {
      await expect(tool.execute({
        action: 'useTemplate',
        templateName: 'nonexistent'
      })).rejects.toThrow('Template not found');
    });

    it('should require templateName', async () => {
      await expect(tool.execute({
        action: 'useTemplate'
      })).rejects.toThrow('templateName is required');
    });
  });
});

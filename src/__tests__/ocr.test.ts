/**
 * Unit tests for OCRTool
 */

import * as fs from 'fs';
import * as path from 'path';
import { OCRTool } from '../tools/ocr';

describe('OCRTool', () => {
  let tool: OCRTool;
  const testDir = path.join(process.cwd(), 'out', 'test_ocr');

  beforeEach(() => {
    tool = new OCRTool();
    
    // Create test directory
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(async () => {
    await tool.cleanup();
    
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('supportedLanguages', () => {
    it('should return list of supported languages', async () => {
      const result = await tool.execute({
        action: 'languages'
      });

      expect(result.languages).toBeInstanceOf(Array);
      expect(result.languages.length).toBeGreaterThan(0);
      expect(result.languages[0]).toHaveProperty('code');
      expect(result.languages[0]).toHaveProperty('name');
    });

    it('should include English', async () => {
      const result = await tool.execute({
        action: 'languages'
      });

      const codes = result.languages.map((l: any) => l.code);
      expect(codes).toContain('eng');
    });

    it('should include major European languages', async () => {
      const result = await tool.execute({
        action: 'languages'
      });

      const codes = result.languages.map((l: any) => l.code);
      expect(codes).toContain('deu'); // German
      expect(codes).toContain('fra'); // French
      expect(codes).toContain('spa'); // Spanish
    });
  });

  describe('extractText validation', () => {
    it('should require imagePath', async () => {
      await expect(tool.execute({
        action: 'extract'
      })).rejects.toThrow('imagePath is required');
    });

    it('should validate file exists', async () => {
      await expect(tool.execute({
        action: 'extract',
        imagePath: '/nonexistent/image.jpg'
      })).rejects.toThrow('Image file not found');
    });

    it('should validate image format', async () => {
      const testFile = path.join(testDir, 'test.txt');
      fs.writeFileSync(testFile, 'not an image', 'utf-8');

      await expect(tool.execute({
        action: 'extract',
        imagePath: testFile
      })).rejects.toThrow('Unsupported image format');
    });
  });

  describe('preprocessImage', () => {
    it('should preprocess image (placeholder)', async () => {
      // Create a dummy image file
      const testFile = path.join(testDir, 'test.jpg');
      fs.writeFileSync(testFile, 'dummy image', 'utf-8');

      const result = await tool.execute({
        action: 'preprocess',
        imagePath: testFile
      });

      expect(result.processedPath).toBe(testFile);
    });

    it('should require imagePath', async () => {
      await expect(tool.execute({
        action: 'preprocess'
      })).rejects.toThrow('imagePath is required');
    });

    it('should validate file exists', async () => {
      await expect(tool.execute({
        action: 'preprocess',
        imagePath: '/nonexistent/image.jpg'
      })).rejects.toThrow('Image file not found');
    });
  });

  describe('batchProcess', () => {
    it('should require imagePaths array', async () => {
      await expect(tool.execute({
        action: 'batch'
      })).rejects.toThrow('imagePaths is required');
    });

    it('should require non-empty array', async () => {
      await expect(tool.execute({
        action: 'batch',
        imagePaths: []
      })).rejects.toThrow('must not be empty');
    });
  });

  describe('cleanup', () => {
    it('should cleanup resources', async () => {
      await tool.cleanup();
      // Should not throw error
      expect(true).toBe(true);
    });
  });
});

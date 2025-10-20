/**
 * Unit tests for HandwritingTool
 */

import * as fs from 'fs';
import * as path from 'path';
import { HandwritingTool } from '../tools/handwriting';

describe('HandwritingTool', () => {
  let tool: HandwritingTool;
  const testDir = path.join(process.cwd(), 'out', 'test_handwriting');

  beforeEach(() => {
    tool = new HandwritingTool();
    
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

  describe('recognizeHandwriting validation', () => {
    it('should require imagePath', async () => {
      await expect(tool.execute({
        action: 'recognize'
      })).rejects.toThrow('imagePath is required');
    });

    it('should validate file exists', async () => {
      await expect(tool.execute({
        action: 'recognize',
        imagePath: '/nonexistent/image.jpg'
      })).rejects.toThrow('Image file not found');
    });
  });

  describe('preprocessHandwriting', () => {
    it('should preprocess handwriting image (placeholder)', async () => {
      const testFile = path.join(testDir, 'handwriting.jpg');
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

  describe('validateRecognition', () => {
    it('should detect empty text', async () => {
      const testFile = path.join(testDir, 'test.jpg');
      fs.writeFileSync(testFile, 'dummy', 'utf-8');

      const result = await tool.execute({
        action: 'validate',
        text: '',
        imagePath: testFile
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('No text recognized');
    });

    it('should detect too many non-alphanumeric characters', async () => {
      const testFile = path.join(testDir, 'test.jpg');
      fs.writeFileSync(testFile, 'dummy', 'utf-8');

      const result = await tool.execute({
        action: 'validate',
        text: '!!!@@@###$$$%%%',
        imagePath: testFile
      });

      expect(result.valid).toBe(false);
      expect(result.reason).toContain('non-alphanumeric');
    });

    it('should require text and imagePath', async () => {
      await expect(tool.execute({
        action: 'validate',
        imagePath: '/some/path.jpg'
      })).rejects.toThrow('text is required');

      await expect(tool.execute({
        action: 'validate',
        text: 'some text'
      })).rejects.toThrow('imagePath is required');
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

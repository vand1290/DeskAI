/**
 * Unit tests for FileManagerTool
 */

import * as fs from 'fs';
import * as path from 'path';
import { FileManagerTool } from '../tools/filemanager';

describe('FileManagerTool', () => {
  let tool: FileManagerTool;
  const testDir = path.join(process.cwd(), 'out', 'test_filemanager');

  beforeEach(() => {
    tool = new FileManagerTool();
    
    // Create test directory and files
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    // Create test files
    fs.writeFileSync(path.join(testDir, 'file1.txt'), 'Content 1', 'utf-8');
    fs.writeFileSync(path.join(testDir, 'file2.txt'), 'Content 2', 'utf-8');
    fs.writeFileSync(path.join(testDir, 'file3.pdf'), 'PDF content', 'utf-8');
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
    tool.clearMetadata();
  });

  describe('listFiles', () => {
    it('should list all files in directory', async () => {
      const result = await tool.execute({
        action: 'list',
        folderPath: testDir
      });

      expect(result.files).toHaveLength(3);
      expect(result.files[0]).toHaveProperty('name');
      expect(result.files[0]).toHaveProperty('path');
      expect(result.files[0]).toHaveProperty('size');
      expect(result.files[0]).toHaveProperty('created');
      expect(result.files[0]).toHaveProperty('modified');
    });

    it('should throw error for non-existent directory', async () => {
      await expect(tool.execute({
        action: 'list',
        folderPath: '/nonexistent/path'
      })).rejects.toThrow('Folder not found');
    });

    it('should require folderPath', async () => {
      await expect(tool.execute({
        action: 'list'
      })).rejects.toThrow('folderPath is required');
    });
  });

  describe('sortFiles', () => {
    it('should sort files by name ascending', async () => {
      const result = await tool.execute({
        action: 'sort',
        folderPath: testDir,
        sortBy: 'name',
        order: 'asc'
      });

      expect(result.files).toHaveLength(3);
      expect(result.files[0].name).toBe('file1.txt');
      expect(result.files[1].name).toBe('file2.txt');
      expect(result.files[2].name).toBe('file3.pdf');
    });

    it('should sort files by name descending', async () => {
      const result = await tool.execute({
        action: 'sort',
        folderPath: testDir,
        sortBy: 'name',
        order: 'desc'
      });

      expect(result.files).toHaveLength(3);
      expect(result.files[0].name).toBe('file3.pdf');
    });

    it('should sort files by size', async () => {
      const result = await tool.execute({
        action: 'sort',
        folderPath: testDir,
        sortBy: 'size',
        order: 'asc'
      });

      expect(result.files).toHaveLength(3);
    });
  });

  describe('addMetadata', () => {
    it('should add metadata to a file', async () => {
      const filePath = path.join(testDir, 'file1.txt');
      const metadata = {
        tags: ['important', 'work'],
        category: 'documents',
        client: 'Client A'
      };

      const result = await tool.execute({
        action: 'addMetadata',
        filePath,
        metadata
      });

      expect(result.success).toBe(true);
      expect(tool.getMetadata(filePath)).toEqual(metadata);
    });

    it('should throw error for non-existent file', async () => {
      await expect(tool.execute({
        action: 'addMetadata',
        filePath: '/nonexistent/file.txt',
        metadata: { tags: ['test'] }
      })).rejects.toThrow('File not found');
    });
  });

  describe('organizeByClient', () => {
    it('should organize files by client metadata', async () => {
      const file1Path = path.join(testDir, 'file1.txt');
      const file2Path = path.join(testDir, 'file2.txt');

      // Add client metadata
      await tool.execute({
        action: 'addMetadata',
        filePath: file1Path,
        metadata: { client: 'ClientA' }
      });

      await tool.execute({
        action: 'addMetadata',
        filePath: file2Path,
        metadata: { client: 'ClientB' }
      });

      const result = await tool.execute({
        action: 'organize',
        folderPath: testDir
      });

      expect(result.organized).toBe(2);
      expect(fs.existsSync(path.join(testDir, 'ClientA'))).toBe(true);
      expect(fs.existsSync(path.join(testDir, 'ClientB'))).toBe(true);
    });
  });

  describe('searchFiles', () => {
    it('should search files by name', async () => {
      const result = await tool.execute({
        action: 'search',
        folderPath: testDir,
        query: 'file1'
      });

      expect(result.files).toHaveLength(1);
      expect(result.files[0].name).toBe('file1.txt');
    });

    it('should search files by metadata', async () => {
      const filePath = path.join(testDir, 'file1.txt');
      await tool.execute({
        action: 'addMetadata',
        filePath,
        metadata: { tags: ['important'] }
      });

      const result = await tool.execute({
        action: 'search',
        folderPath: testDir,
        query: 'important'
      });

      expect(result.files).toHaveLength(1);
      expect(result.files[0].name).toBe('file1.txt');
    });

    it('should throw error without query', async () => {
      await expect(tool.execute({
        action: 'search',
        folderPath: testDir
      })).rejects.toThrow('query is required');
    });
  });
});

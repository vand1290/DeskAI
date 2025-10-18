/**
 * Tests for offline tools
 */

import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { fileReadTool, fileWriteTool, fileListTool } from './tools.js';

const OUT_DIR = path.join(process.cwd(), 'out');
const TEST_FILE = 'test.txt';
const TEST_CONTENT = 'Hello, offline world!';

describe('File Tools', () => {
  beforeEach(() => {
    // Clean up test files
    if (fs.existsSync(path.join(OUT_DIR, TEST_FILE))) {
      fs.unlinkSync(path.join(OUT_DIR, TEST_FILE));
    }
  });
  
  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(path.join(OUT_DIR, TEST_FILE))) {
      fs.unlinkSync(path.join(OUT_DIR, TEST_FILE));
    }
  });
  
  test('fileWriteTool creates a file', async () => {
    const result = await fileWriteTool.execute({
      path: TEST_FILE,
      content: TEST_CONTENT
    });
    
    expect(result).toContain('Successfully wrote');
    expect(fs.existsSync(path.join(OUT_DIR, TEST_FILE))).toBe(true);
  });
  
  test('fileReadTool reads a file', async () => {
    // First write a file
    await fileWriteTool.execute({
      path: TEST_FILE,
      content: TEST_CONTENT
    });
    
    // Then read it
    const content = await fileReadTool.execute({
      path: TEST_FILE
    });
    
    expect(content).toBe(TEST_CONTENT);
  });
  
  test('fileListTool lists files', async () => {
    // Write a test file
    await fileWriteTool.execute({
      path: TEST_FILE,
      content: TEST_CONTENT
    });
    
    // List files
    const result = await fileListTool.execute({ path: '.' });
    const files = JSON.parse(result);
    
    expect(Array.isArray(files)).toBe(true);
    expect(files).toContain(TEST_FILE);
  });
  
  test('tools prevent access outside out directory', async () => {
    await expect(
      fileReadTool.execute({ path: '../../../etc/passwd' })
    ).rejects.toThrow('Access denied');
  });
  
  test('fileReadTool throws error for non-existent file', async () => {
    await expect(
      fileReadTool.execute({ path: 'nonexistent.txt' })
    ).rejects.toThrow('File not found');
  });
});

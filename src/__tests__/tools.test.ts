/**
 * Unit tests for tool execution and security
 */

import * as fs from 'fs';
import * as path from 'path';
import { ToolRegistry, FileWriteTool, FileReadTool, CalculatorTool, TextAnalysisTool } from '../tools';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  it('should register and list tools', () => {
    const tools = registry.listTools();
    expect(tools.length).toBeGreaterThan(0);
    
    const toolNames = tools.map(t => t.name);
    expect(toolNames).toContain('file_write');
    expect(toolNames).toContain('file_read');
    expect(toolNames).toContain('calculator');
    expect(toolNames).toContain('text_analysis');
  });

  it('should check if tool exists', () => {
    expect(registry.hasTool('file_write')).toBe(true);
    expect(registry.hasTool('nonexistent')).toBe(false);
  });

  it('should throw error for non-existent tool', async () => {
    await expect(registry.executeTool('nonexistent', {}))
      .rejects.toThrow('Tool not found');
  });
});

describe('FileWriteTool', () => {
  let tool: FileWriteTool;
  const outDir = path.join(process.cwd(), 'out');

  beforeEach(() => {
    tool = new FileWriteTool();
    // Clean up out directory
    if (fs.existsSync(outDir)) {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  });

  afterEach(() => {
    // Clean up out directory
    if (fs.existsSync(outDir)) {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  });

  it('should be allowed', () => {
    expect(tool.isAllowed()).toBe(true);
  });

  it('should write file to out directory', async () => {
    const result = await tool.execute({
      filename: 'test.txt',
      content: 'Hello World'
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain('test.txt');
    
    const filePath = path.join(outDir, 'test.txt');
    expect(fs.existsSync(filePath)).toBe(true);
    expect(fs.readFileSync(filePath, 'utf-8')).toBe('Hello World');
  });

  it('should reject access outside out directory', async () => {
    await expect(tool.execute({
      filename: '../sensitive.txt',
      content: 'bad'
    })).rejects.toThrow('Access denied');
  });

  it('should require filename and content', async () => {
    await expect(tool.execute({ content: 'test' } as any))
      .rejects.toThrow('filename and content are required');
  });
});

describe('FileReadTool', () => {
  let tool: FileReadTool;
  const outDir = path.join(process.cwd(), 'out');

  beforeEach(() => {
    tool = new FileReadTool();
    // Setup test file
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(path.join(outDir, 'test.txt'), 'Test Content', 'utf-8');
  });

  afterEach(() => {
    if (fs.existsSync(outDir)) {
      fs.rmSync(outDir, { recursive: true, force: true });
    }
  });

  it('should read file from out directory', async () => {
    const result = await tool.execute({ filename: 'test.txt' });

    expect(result.success).toBe(true);
    expect(result.content).toBe('Test Content');
  });

  it('should reject access outside out directory', async () => {
    await expect(tool.execute({ filename: '../package.json' }))
      .rejects.toThrow('Access denied');
  });

  it('should throw error for non-existent file', async () => {
    await expect(tool.execute({ filename: 'nonexistent.txt' }))
      .rejects.toThrow('File not found');
  });
});

describe('CalculatorTool', () => {
  let tool: CalculatorTool;

  beforeEach(() => {
    tool = new CalculatorTool();
  });

  it('should perform basic arithmetic', async () => {
    const result = await tool.execute({ expression: '2 + 2' });
    expect(result.success).toBe(true);
    expect(result.result).toBe(4);
  });

  it('should handle complex expressions', async () => {
    const result = await tool.execute({ expression: '(10 + 5) * 2 - 8 / 4' });
    expect(result.success).toBe(true);
    expect(result.result).toBe(28);
  });

  it('should be deterministic', async () => {
    const result1 = await tool.execute({ expression: '123 * 456' });
    const result2 = await tool.execute({ expression: '123 * 456' });
    expect(result1.result).toBe(result2.result);
  });

  it('should reject invalid characters', async () => {
    await expect(tool.execute({ expression: 'alert("xss")' }))
      .rejects.toThrow('Invalid expression');
  });

  it('should require expression parameter', async () => {
    await expect(tool.execute({} as any))
      .rejects.toThrow('expression is required');
  });
});

describe('TextAnalysisTool', () => {
  let tool: TextAnalysisTool;

  beforeEach(() => {
    tool = new TextAnalysisTool();
  });

  it('should analyze text properties', async () => {
    const result = await tool.execute({ text: 'Hello world test' });
    
    expect(result.success).toBe(true);
    expect(result.wordCount).toBe(3);
    expect(result.characterCount).toBe(16);
    expect(result.lineCount).toBe(1);
  });

  it('should handle multiline text', async () => {
    const result = await tool.execute({ text: 'Line 1\nLine 2\nLine 3' });
    
    expect(result.lineCount).toBe(3);
    expect(result.wordCount).toBe(6);
  });

  it('should be deterministic', async () => {
    const text = 'Test text for analysis';
    const result1 = await tool.execute({ text });
    const result2 = await tool.execute({ text });
    
    expect(result1.wordCount).toBe(result2.wordCount);
    expect(result1.characterCount).toBe(result2.characterCount);
  });

  it('should handle empty text', async () => {
    const result = await tool.execute({ text: '' });
    
    expect(result.wordCount).toBe(0);
    expect(result.characterCount).toBe(0);
  });
});

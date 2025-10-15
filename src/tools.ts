/**
 * Allowlisted tool definitions with security restrictions
 * All filesystem operations are restricted to the out/ directory
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdir = promisify(fs.mkdir);

export interface Tool {
  name: string;
  description: string;
  execute(params: any): Promise<any>;
  isAllowed(): boolean;
}

/**
 * Base directory for all file operations (security constraint)
 */
const OUT_DIR = path.join(process.cwd(), 'out');

/**
 * Ensure path is within allowed directory
 */
function validatePath(filePath: string): string {
  const resolvedPath = path.resolve(OUT_DIR, filePath);
  if (!resolvedPath.startsWith(OUT_DIR)) {
    throw new Error(`Access denied: Path must be within out/ directory`);
  }
  return resolvedPath;
}

/**
 * File write tool - restricted to out/ directory
 */
export class FileWriteTool implements Tool {
  name = 'file_write';
  description = 'Write content to a file in the out/ directory';

  isAllowed(): boolean {
    return true;
  }

  async execute(params: { filename: string; content: string }): Promise<any> {
    if (!params.filename || params.content === undefined) {
      throw new Error('filename and content are required');
    }

    const filePath = validatePath(params.filename);
    
    // Ensure out directory exists
    await mkdir(OUT_DIR, { recursive: true });
    
    await writeFile(filePath, params.content, 'utf-8');
    
    return {
      success: true,
      path: filePath,
      message: `File written to ${params.filename}`
    };
  }
}

/**
 * File read tool - restricted to out/ directory
 */
export class FileReadTool implements Tool {
  name = 'file_read';
  description = 'Read content from a file in the out/ directory';

  isAllowed(): boolean {
    return true;
  }

  async execute(params: { filename: string }): Promise<any> {
    if (!params.filename) {
      throw new Error('filename is required');
    }

    const filePath = validatePath(params.filename);
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${params.filename}`);
    }
    
    const content = await readFile(filePath, 'utf-8');
    
    return {
      success: true,
      content,
      path: filePath
    };
  }
}

/**
 * Calculator tool - deterministic computation
 */
export class CalculatorTool implements Tool {
  name = 'calculator';
  description = 'Perform basic arithmetic calculations';

  isAllowed(): boolean {
    return true;
  }

  async execute(params: { expression: string }): Promise<any> {
    if (!params.expression) {
      throw new Error('expression is required');
    }

    // Simple safe evaluation for basic arithmetic
    // Only allows numbers and basic operators
    const sanitized = params.expression.replace(/[^0-9+\-*/().\s]/g, '');
    
    if (sanitized !== params.expression) {
      throw new Error('Invalid expression: only numbers and basic operators allowed');
    }

    try {
      // Use Function constructor for safer evaluation than eval
      const result = new Function(`return ${sanitized}`)();
      
      return {
        success: true,
        expression: params.expression,
        result
      };
    } catch (error) {
      throw new Error(`Calculation error: ${error}`);
    }
  }
}

/**
 * Text analysis tool - deterministic text processing
 */
export class TextAnalysisTool implements Tool {
  name = 'text_analysis';
  description = 'Analyze text properties (word count, character count, etc.)';

  isAllowed(): boolean {
    return true;
  }

  async execute(params: { text: string }): Promise<any> {
    if (params.text === undefined) {
      throw new Error('text is required');
    }

    const text = params.text;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    const lines = text.split('\n');
    const chars = text.length;
    const charsNoSpaces = text.replace(/\s/g, '').length;

    return {
      success: true,
      wordCount: words.length,
      characterCount: chars,
      characterCountNoSpaces: charsNoSpaces,
      lineCount: lines.length,
      averageWordLength: words.length > 0 
        ? (charsNoSpaces / words.length).toFixed(2) 
        : 0
    };
  }
}

/**
 * Tool registry for managing available tools
 */
export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  constructor() {
    // Register allowlisted tools
    this.registerTool(new FileWriteTool());
    this.registerTool(new FileReadTool());
    this.registerTool(new CalculatorTool());
    this.registerTool(new TextAnalysisTool());
  }

  registerTool(tool: Tool): void {
    if (tool.isAllowed()) {
      this.tools.set(tool.name, tool);
    }
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  listTools(): Array<{ name: string; description: string }> {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description
    }));
  }

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  async executeTool(name: string, params: any): Promise<any> {
    const tool = this.getTool(name);
    if (!tool) {
      throw new Error(`Tool not found: ${name}`);
    }
    return await tool.execute(params);
  }
}

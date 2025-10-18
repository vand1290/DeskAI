/**
 * Offline, deterministic tools restricted to the 'out' directory
 */

import * as fs from 'fs';
import * as path from 'path';
import { Tool } from './types.js';

const OUT_DIR = path.join(process.cwd(), 'out');

// Ensure out directory exists
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

/**
 * Validates that a path is within the allowed 'out' directory
 */
function validatePath(filePath: string): string {
  const resolved = path.resolve(OUT_DIR, filePath);
  if (!resolved.startsWith(OUT_DIR)) {
    throw new Error(`Access denied: Path ${filePath} is outside allowed directory`);
  }
  return resolved;
}

export const fileReadTool: Tool = {
  name: 'file_read',
  description: 'Read a file from the out directory',
  parameters: {
    path: 'string - relative path within out directory'
  },
  async execute(args: Record<string, unknown>): Promise<string> {
    const filePath = args.path as string;
    if (!filePath) {
      throw new Error('path parameter is required');
    }
    
    const fullPath = validatePath(filePath);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    return fs.readFileSync(fullPath, 'utf-8');
  }
};

export const fileWriteTool: Tool = {
  name: 'file_write',
  description: 'Write content to a file in the out directory',
  parameters: {
    path: 'string - relative path within out directory',
    content: 'string - content to write'
  },
  async execute(args: Record<string, unknown>): Promise<string> {
    const filePath = args.path as string;
    const content = args.content as string;
    
    if (!filePath) {
      throw new Error('path parameter is required');
    }
    if (content === undefined) {
      throw new Error('content parameter is required');
    }
    
    const fullPath = validatePath(filePath);
    const dir = path.dirname(fullPath);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(fullPath, content, 'utf-8');
    return `Successfully wrote to ${filePath}`;
  }
};

export const fileListTool: Tool = {
  name: 'file_list',
  description: 'List files in a directory within out',
  parameters: {
    path: 'string - relative path within out directory (default: .)'
  },
  async execute(args: Record<string, unknown>): Promise<string> {
    const filePath = (args.path as string) || '.';
    const fullPath = validatePath(filePath);
    
    if (!fs.existsSync(fullPath)) {
      throw new Error(`Directory not found: ${filePath}`);
    }
    
    const files = fs.readdirSync(fullPath);
    return JSON.stringify(files, null, 2);
  }
};

export const allTools: Tool[] = [
  fileReadTool,
  fileWriteTool,
  fileListTool
];

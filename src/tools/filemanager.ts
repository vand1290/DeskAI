/**
 * File Management Tool for organizing and managing files
 * Provides folder selection, sorting, metadata management, and organization features
 */

import * as fs from 'fs';
import * as path from 'path';
import { promisify } from 'util';
import { Tool } from '../tools';

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const rename = promisify(fs.rename);
const mkdir = promisify(fs.mkdir);

export interface FileInfo {
  name: string;
  path: string;
  size: number;
  created: Date;
  modified: Date;
  type: string;
  metadata?: CustomMetadata;
}

export interface CustomMetadata {
  tags?: string[];
  category?: string;
  client?: string;
  notes?: string;
}

export interface FileManagerParams {
  action: 'list' | 'sort' | 'organize' | 'addMetadata' | 'search';
  folderPath?: string;
  sortBy?: 'date' | 'name' | 'client' | 'size';
  order?: 'asc' | 'desc';
  metadata?: CustomMetadata;
  filePath?: string;
  query?: string;
}

/**
 * File Manager Tool - manage files with metadata and organization
 */
export class FileManagerTool implements Tool {
  name = 'file_manager';
  description = 'Manage files: list, sort, organize, add metadata, and search files';
  private metadataStore: Map<string, CustomMetadata> = new Map();

  isAllowed(): boolean {
    return true;
  }

  async execute(params: FileManagerParams): Promise<any> {
    switch (params.action) {
      case 'list':
        return await this.listFiles(params.folderPath!);
      case 'sort':
        return await this.sortFiles(params.folderPath!, params.sortBy!, params.order!);
      case 'organize':
        return await this.organizeByClient(params.folderPath!);
      case 'addMetadata':
        return this.addMetadata(params.filePath!, params.metadata!);
      case 'search':
        return await this.searchFiles(params.folderPath!, params.query!);
      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  }

  /**
   * List all files in a folder with their information
   */
  private async listFiles(folderPath: string): Promise<{ files: FileInfo[] }> {
    if (!folderPath) {
      throw new Error('folderPath is required');
    }

    // Validate path exists
    if (!fs.existsSync(folderPath)) {
      throw new Error(`Folder not found: ${folderPath}`);
    }

    const entries = await readdir(folderPath);
    const files: FileInfo[] = [];

    for (const entry of entries) {
      const fullPath = path.join(folderPath, entry);
      try {
        const stats = await stat(fullPath);
        
        if (stats.isFile()) {
          const fileInfo: FileInfo = {
            name: entry,
            path: fullPath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            type: path.extname(entry),
            metadata: this.metadataStore.get(fullPath)
          };
          files.push(fileInfo);
        }
      } catch (error) {
        // Skip files we can't access
        continue;
      }
    }

    return { files };
  }

  /**
   * Sort files by specified criteria
   */
  private async sortFiles(
    folderPath: string,
    sortBy: 'date' | 'name' | 'client' | 'size',
    order: 'asc' | 'desc' = 'asc'
  ): Promise<{ files: FileInfo[] }> {
    const { files } = await this.listFiles(folderPath);

    files.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = a.modified.getTime() - b.modified.getTime();
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'client':
          const clientA = a.metadata?.client || '';
          const clientB = b.metadata?.client || '';
          comparison = clientA.localeCompare(clientB);
          break;
      }

      return order === 'desc' ? -comparison : comparison;
    });

    return { files };
  }

  /**
   * Organize files by client into separate folders
   */
  private async organizeByClient(folderPath: string): Promise<{ organized: number; errors: string[] }> {
    const { files } = await this.listFiles(folderPath);
    let organized = 0;
    const errors: string[] = [];

    for (const file of files) {
      const client = file.metadata?.client;
      if (!client) {
        continue;
      }

      const clientFolder = path.join(folderPath, client);
      const newPath = path.join(clientFolder, file.name);

      try {
        // Create client folder if it doesn't exist
        await mkdir(clientFolder, { recursive: true });
        
        // Move file to client folder
        await rename(file.path, newPath);
        
        // Update metadata path
        this.metadataStore.delete(file.path);
        this.metadataStore.set(newPath, file.metadata!);
        
        organized++;
      } catch (error) {
        errors.push(`Failed to move ${file.name}: ${error}`);
      }
    }

    return { organized, errors };
  }

  /**
   * Add metadata to a file
   */
  private addMetadata(filePath: string, metadata: CustomMetadata): { success: boolean; path: string } {
    if (!filePath) {
      throw new Error('filePath is required');
    }
    if (!metadata) {
      throw new Error('metadata is required');
    }

    // Validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Store metadata
    const existing = this.metadataStore.get(filePath) || {};
    this.metadataStore.set(filePath, { ...existing, ...metadata });

    return { success: true, path: filePath };
  }

  /**
   * Search files by name or metadata
   */
  private async searchFiles(folderPath: string, query: string): Promise<{ files: FileInfo[] }> {
    if (!query) {
      throw new Error('query is required');
    }

    const { files } = await this.listFiles(folderPath);
    const lowerQuery = query.toLowerCase();

    const matches = files.filter(file => {
      // Search in filename
      if (file.name.toLowerCase().includes(lowerQuery)) {
        return true;
      }

      // Search in metadata
      if (file.metadata) {
        const { tags, category, client, notes } = file.metadata;
        
        if (tags?.some(tag => tag.toLowerCase().includes(lowerQuery))) {
          return true;
        }
        if (category?.toLowerCase().includes(lowerQuery)) {
          return true;
        }
        if (client?.toLowerCase().includes(lowerQuery)) {
          return true;
        }
        if (notes?.toLowerCase().includes(lowerQuery)) {
          return true;
        }
      }

      return false;
    });

    return { files: matches };
  }

  /**
   * Get metadata for a file
   */
  getMetadata(filePath: string): CustomMetadata | undefined {
    return this.metadataStore.get(filePath);
  }

  /**
   * Clear all metadata
   */
  clearMetadata(): void {
    this.metadataStore.clear();
  }
}

/**
 * Document Processing Tool for extracting and analyzing documents
 * Supports PDF extraction, text processing, summarization, and data extraction
 */

import * as fs from 'fs';
import { promisify } from 'util';
import { Tool } from '../tools';

const readFile = promisify(fs.readFile);

// Use require for pdf-parse to handle CJS module properly
const pdfParse = require('pdf-parse');

export interface DocumentMetadata {
  title?: string;
  author?: string;
  created?: Date;
  modified?: Date;
  pages?: number;
  format?: string;
}

export interface SearchResult {
  text: string;
  position: number;
  context: string;
}

export interface DocumentParams {
  action: 'extractPDF' | 'extractText' | 'summarize' | 'extractData' | 'search' | 'getMetadata';
  filePath?: string;
  text?: string;
  dataType?: 'dates' | 'emails' | 'amounts';
  query?: string;
  model?: string;
}

/**
 * Document Processing Tool - extract and analyze document content
 */
export class DocumentTool implements Tool {
  name = 'document_processor';
  description = 'Process documents: extract text from PDFs, summarize, extract data, and search';

  isAllowed(): boolean {
    return true;
  }

  async execute(params: DocumentParams): Promise<any> {
    switch (params.action) {
      case 'extractPDF':
        return await this.extractFromPDF(params.filePath!);
      case 'extractText':
        return await this.extractFromText(params.filePath!);
      case 'summarize':
        return await this.summarize(params.text!, params.model);
      case 'extractData':
        return this.extractData(params.text!, params.dataType!);
      case 'search':
        return this.searchText(params.text!, params.query!);
      case 'getMetadata':
        return await this.getMetadata(params.filePath!);
      default:
        throw new Error(`Unknown action: ${params.action}`);
    }
  }

  /**
   * Extract text from PDF using pdf-parse
   */
  private async extractFromPDF(pdfPath: string): Promise<{
    text: string;
    pages: number;
    metadata: any;
  }> {
    if (!pdfPath) {
      throw new Error('pdfPath is required');
    }

    if (!fs.existsSync(pdfPath)) {
      throw new Error(`PDF file not found: ${pdfPath}`);
    }

    const dataBuffer = await readFile(pdfPath);
    const data = await pdfParse(dataBuffer);

    return {
      text: data.text,
      pages: data.numpages,
      metadata: data.info
    };
  }

  /**
   * Extract text from plain text file
   */
  private async extractFromText(txtPath: string): Promise<{ text: string }> {
    if (!txtPath) {
      throw new Error('txtPath is required');
    }

    if (!fs.existsSync(txtPath)) {
      throw new Error(`Text file not found: ${txtPath}`);
    }

    const text = await readFile(txtPath, 'utf-8');
    return { text };
  }

  /**
   * Summarize text using a local model
   * Note: This is a stub - in production would use actual local model
   */
  private async summarize(text: string, model?: string): Promise<{ summary: string }> {
    if (!text) {
      throw new Error('text is required');
    }

    // Simple extractive summarization (offline)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const maxSentences = Math.min(3, Math.ceil(sentences.length * 0.1));
    
    // Take first few sentences as summary (deterministic)
    const summary = sentences.slice(0, maxSentences).join(' ').trim();

    return {
      summary: summary || 'Document is too short to summarize.'
    };
  }

  /**
   * Extract structured data from text (dates, emails, amounts)
   */
  private extractData(text: string, dataType: 'dates' | 'emails' | 'amounts'): { data: string[] } {
    if (!text) {
      throw new Error('text is required');
    }
    if (!dataType) {
      throw new Error('dataType is required');
    }

    let data: string[] = [];

    switch (dataType) {
      case 'dates':
        // Match common date formats
        const datePatterns = [
          /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g,  // MM/DD/YYYY or DD-MM-YYYY
          /\b\d{4}[/-]\d{1,2}[/-]\d{1,2}\b/g,    // YYYY-MM-DD
          /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/gi  // Month DD, YYYY
        ];
        
        for (const pattern of datePatterns) {
          const matches = text.match(pattern);
          if (matches) {
            data.push(...matches);
          }
        }
        break;

      case 'emails':
        // Match email addresses
        const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const emails = text.match(emailPattern);
        if (emails) {
          data = emails;
        }
        break;

      case 'amounts':
        // Match currency amounts
        const amountPattern = /\$\s?\d+(?:,\d{3})*(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s?(?:USD|EUR|GBP)/g;
        const amounts = text.match(amountPattern);
        if (amounts) {
          data = amounts;
        }
        break;
    }

    // Remove duplicates
    data = [...new Set(data)];

    return { data };
  }

  /**
   * Search for text within document with context
   */
  private searchText(text: string, query: string): { results: SearchResult[] } {
    if (!text) {
      throw new Error('text is required');
    }
    if (!query) {
      throw new Error('query is required');
    }

    const results: SearchResult[] = [];
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const contextLength = 50; // characters before and after match

    let position = lowerText.indexOf(lowerQuery);
    while (position !== -1) {
      const start = Math.max(0, position - contextLength);
      const end = Math.min(text.length, position + query.length + contextLength);
      
      results.push({
        text: text.substring(position, position + query.length),
        position,
        context: '...' + text.substring(start, end) + '...'
      });

      position = lowerText.indexOf(lowerQuery, position + 1);
    }

    return { results };
  }

  /**
   * Get metadata from a file
   */
  private async getMetadata(filePath: string): Promise<DocumentMetadata> {
    if (!filePath) {
      throw new Error('filePath is required');
    }

    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const stats = fs.statSync(filePath);
    const metadata: DocumentMetadata = {
      created: stats.birthtime,
      modified: stats.mtime,
      format: filePath.split('.').pop()
    };

    // For PDFs, extract additional metadata
    if (filePath.toLowerCase().endsWith('.pdf')) {
      try {
        const pdfData = await this.extractFromPDF(filePath);
        metadata.pages = pdfData.pages;
        metadata.title = pdfData.metadata.Title;
        metadata.author = pdfData.metadata.Author;
      } catch (error) {
        // If PDF parsing fails, just return basic metadata
      }
    }

    return metadata;
  }
}

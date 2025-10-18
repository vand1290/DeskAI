import * as fs from 'fs';
import * as path from 'path';
import Tesseract from 'tesseract.js';
import { ScanDocument, ScanSearchResult } from './memory.js';

/**
 * ScanProcessor handles OCR and text extraction from scanned documents
 * All processing is done offline using Tesseract.js
 */
export class ScanProcessor {
  private scansDir: string;

  constructor(dataDir: string = './out') {
    this.scansDir = path.join(dataDir, 'scans');
  }

  /**
   * Initialize the scan processor by creating necessary directories
   */
  async initialize(): Promise<void> {
    if (!fs.existsSync(this.scansDir)) {
      fs.mkdirSync(this.scansDir, { recursive: true });
    }
  }

  /**
   * Process a scanned image file and extract text using OCR
   */
  async processScan(filePath: string, filename: string): Promise<ScanDocument> {
    try {
      // Perform OCR using Tesseract.js
      const result = await Tesseract.recognize(
        filePath,
        'eng',
        {
          logger: () => {} // Suppress logs
        }
      );

      const extractedText = result.data.text;

      // Extract structured data from the text
      const metadata = this.extractMetadata(extractedText);

      // Save the scan file to scans directory
      const scanId = this.generateId();
      const savedFilePath = path.join(this.scansDir, `${scanId}_${filename}`);
      fs.copyFileSync(filePath, savedFilePath);

      const scanDocument: ScanDocument = {
        id: scanId,
        filename,
        extractedText,
        metadata,
        uploadedAt: Date.now(),
        filePath: savedFilePath
      };

      return scanDocument;
    } catch (error) {
      console.error('Failed to process scan:', error);
      throw new Error(`Failed to process scan: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract structured metadata from text
   */
  private extractMetadata(text: string): ScanDocument['metadata'] {
    return {
      names: this.extractNames(text),
      dates: this.extractDates(text),
      totals: this.extractTotals(text),
      keywords: this.extractKeywords(text)
    };
  }

  /**
   * Extract potential names (capitalized words/phrases)
   */
  private extractNames(text: string): string[] {
    const names = new Set<string>();
    
    // Pattern for names: Two or more consecutive capitalized words
    const namePattern = /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g;
    let match;
    
    while ((match = namePattern.exec(text)) !== null) {
      names.add(match[1]);
    }

    return Array.from(names).slice(0, 20); // Limit to 20 names
  }

  /**
   * Extract dates in various formats
   */
  private extractDates(text: string): string[] {
    const dates = new Set<string>();
    
    // Multiple date patterns
    const datePatterns = [
      /\b(\d{1,2}\/\d{1,2}\/\d{2,4})\b/g, // MM/DD/YYYY or DD/MM/YYYY
      /\b(\d{1,2}-\d{1,2}-\d{2,4})\b/g, // MM-DD-YYYY or DD-MM-YYYY
      /\b([A-Z][a-z]+\s+\d{1,2},?\s+\d{4})\b/g, // January 1, 2024
      /\b(\d{4}-\d{2}-\d{2})\b/g // ISO format YYYY-MM-DD
    ];

    for (const pattern of datePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        dates.add(match[1]);
      }
    }

    return Array.from(dates).slice(0, 20); // Limit to 20 dates
  }

  /**
   * Extract potential totals/amounts (currency and numbers)
   */
  private extractTotals(text: string): string[] {
    const totals = new Set<string>();
    
    // Patterns for currency and amounts
    const totalPatterns = [
      /\$\s*[\d,]+\.?\d*/g, // Dollar amounts
      /€\s*[\d,]+\.?\d*/g, // Euro amounts
      /£\s*[\d,]+\.?\d*/g, // Pound amounts
      /\b(?:total|amount|sum|balance|price|cost)[\s:]+\$?\s*([\d,]+\.?\d*)/gi, // Total: $123.45
      /\b([\d,]+\.?\d+)\s*(?:USD|EUR|GBP|dollars?|euros?|pounds?)\b/gi // 123.45 USD
    ];

    for (const pattern of totalPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        totals.add(match[0]);
      }
    }

    return Array.from(totals).slice(0, 20); // Limit to 20 totals
  }

  /**
   * Extract important keywords (words that appear frequently or are significant)
   */
  private extractKeywords(text: string): string[] {
    // Common stop words to exclude
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
      'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
    ]);

    // Extract words (3+ characters, excluding numbers)
    const words = text.toLowerCase()
      .split(/\s+/)
      .filter(word => {
        const cleaned = word.replace(/[^a-z]/g, '');
        return cleaned.length >= 3 && !stopWords.has(cleaned);
      });

    // Count word frequency
    const wordCounts = new Map<string, number>();
    for (const word of words) {
      const cleaned = word.replace(/[^a-z]/g, '');
      if (cleaned) {
        wordCounts.set(cleaned, (wordCounts.get(cleaned) || 0) + 1);
      }
    }

    // Sort by frequency and return top keywords
    const keywords = Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);

    return keywords;
  }

  /**
   * Search for text in a scan document
   */
  searchInDocument(document: ScanDocument, query: string): ScanSearchResult | null {
    const lowerQuery = query.toLowerCase();
    const matches: ScanSearchResult['matches'] = [];
    let score = 0;

    // Search in metadata
    for (const name of document.metadata.names) {
      if (name.toLowerCase().includes(lowerQuery)) {
        matches.push({
          type: 'name',
          value: name,
          context: this.getContext(document.extractedText, name)
        });
        score += 2; // Names have higher weight
      }
    }

    for (const date of document.metadata.dates) {
      if (date.toLowerCase().includes(lowerQuery)) {
        matches.push({
          type: 'date',
          value: date,
          context: this.getContext(document.extractedText, date)
        });
        score += 1.5;
      }
    }

    for (const total of document.metadata.totals) {
      if (total.toLowerCase().includes(lowerQuery)) {
        matches.push({
          type: 'total',
          value: total,
          context: this.getContext(document.extractedText, total)
        });
        score += 1.5;
      }
    }

    for (const keyword of document.metadata.keywords) {
      if (keyword.toLowerCase().includes(lowerQuery)) {
        matches.push({
          type: 'keyword',
          value: keyword,
          context: this.getContext(document.extractedText, keyword)
        });
        score += 1;
      }
    }

    // Search in full text
    if (document.extractedText.toLowerCase().includes(lowerQuery)) {
      const context = this.getContext(document.extractedText, query);
      if (!matches.some(m => m.context === context)) {
        matches.push({
          type: 'text',
          value: query,
          context
        });
        score += 0.5;
      }
    }

    if (matches.length === 0) {
      return null;
    }

    return {
      documentId: document.id,
      filename: document.filename,
      matches,
      score
    };
  }

  /**
   * Get context around a matched term
   */
  private getContext(text: string, term: string, contextLength: number = 100): string {
    const lowerText = text.toLowerCase();
    const lowerTerm = term.toLowerCase();
    const index = lowerText.indexOf(lowerTerm);
    
    if (index === -1) {
      return text.substring(0, contextLength);
    }

    const start = Math.max(0, index - contextLength / 2);
    const end = Math.min(text.length, index + term.length + contextLength / 2);
    
    let context = text.substring(start, end);
    
    if (start > 0) {
      context = '...' + context;
    }
    if (end < text.length) {
      context = context + '...';
    }
    
    return context.trim();
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Delete a scan file
   */
  async deleteScan(scanId: string, filename: string): Promise<boolean> {
    try {
      const filePath = path.join(this.scansDir, `${scanId}_${filename}`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete scan:', error);
      return false;
    }
  }
}

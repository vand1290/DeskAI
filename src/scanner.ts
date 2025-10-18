import Tesseract from 'tesseract.js';
import { ScannedDocument } from './memory.js';

export interface ScanSearchResult {
  documentId: string;
  filename: string;
  matches: Array<{
    text: string;
    type: 'name' | 'date' | 'number' | 'keyword';
    position: number;
  }>;
  score: number;
}

/**
 * Scanner handles OCR and text extraction from images and scanned documents
 * Provides search functionality over extracted data
 * All processing is done locally using Tesseract.js
 */
export class Scanner {
  private worker: Tesseract.Worker | null = null;
  private initialized: boolean = false;

  constructor() {
  }

  /**
   * Initialize the OCR worker
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      this.worker = await Tesseract.createWorker('eng');
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize OCR worker:', error);
      throw error;
    }
  }

  /**
   * Process a scanned image or document using OCR
   */
  async processDocument(
    imageData: string | Buffer,
    filename: string,
    fileType?: string,
    fileSize?: number
  ): Promise<ScannedDocument> {
    if (!this.worker) {
      throw new Error('Scanner not initialized. Call initialize() first.');
    }

    try {
      // Perform OCR
      const result = await this.worker.recognize(imageData);
      const extractedText = result.data.text;
      const confidence = result.data.confidence;

      // Extract structured data from text
      const extractedData = this.extractStructuredData(extractedText);

      // Create document record
      const document: ScannedDocument = {
        id: this.generateId(),
        filename,
        content: extractedText,
        extractedData,
        metadata: {
          uploadedAt: Date.now(),
          fileSize,
          fileType,
          ocrConfidence: confidence
        },
        relatedConversationIds: [],
        tags: []
      };

      return document;
    } catch (error) {
      console.error('Failed to process document:', error);
      throw error;
    }
  }

  /**
   * Extract structured data (names, dates, numbers, keywords) from text
   */
  private extractStructuredData(text: string): ScannedDocument['extractedData'] {
    const data: ScannedDocument['extractedData'] = {
      names: [],
      dates: [],
      numbers: [],
      keywords: []
    };

    // Extract dates (various formats)
    const datePatterns = [
      /\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b/g, // MM/DD/YYYY, DD-MM-YYYY, etc.
      /\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b/g,   // YYYY-MM-DD
      /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/gi, // Month DD, YYYY
      /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/gi  // DD Month YYYY
    ];

    for (const pattern of datePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        data.dates = [...(data.dates || []), ...matches];
      }
    }

    // Extract numbers (currency, totals, amounts)
    const numberPatterns = [
      /\$\s*\d+(?:,\d{3})*(?:\.\d{2})?/g,  // Currency with $
      /\b\d+(?:,\d{3})*(?:\.\d{2})?\b/g     // General numbers
    ];

    for (const pattern of numberPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        data.numbers = [...(data.numbers || []), ...matches];
      }
    }

    // Extract capitalized words (potential names)
    const namePattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;
    const nameMatches = text.match(namePattern);
    if (nameMatches) {
      data.names = nameMatches.filter(name => {
        // Filter out common words that aren't names
        const commonWords = ['The', 'This', 'That', 'These', 'Those', 'Total', 'Amount', 'Date', 'Invoice'];
        return !commonWords.includes(name.split(' ')[0]);
      });
    }

    // Extract keywords (words appearing multiple times or in title case)
    const words = text.split(/\s+/);
    const wordFrequency: Record<string, number> = {};
    
    for (const word of words) {
      const cleaned = word.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (cleaned.length > 3) { // Only words longer than 3 characters
        wordFrequency[cleaned] = (wordFrequency[cleaned] || 0) + 1;
      }
    }

    // Get words that appear more than once
    data.keywords = Object.entries(wordFrequency)
      .filter(([_, count]) => count > 1)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, _]) => word);

    // Remove duplicates
    data.dates = [...new Set(data.dates || [])];
    data.numbers = [...new Set(data.numbers || [])];
    data.names = [...new Set(data.names || [])];
    data.keywords = [...new Set(data.keywords || [])];

    return data;
  }

  /**
   * Search scanned documents by query
   */
  searchDocuments(
    documents: ScannedDocument[],
    query: string,
    filterType?: 'name' | 'date' | 'number' | 'keyword'
  ): ScanSearchResult[] {
    const results: ScanSearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    for (const doc of documents) {
      const matches: ScanSearchResult['matches'] = [];
      let score = 0;

      // Search in extracted data
      const searchInArray = (
        arr: string[] | undefined,
        type: 'name' | 'date' | 'number' | 'keyword'
      ) => {
        if (!arr || (filterType && filterType !== type)) return;
        
        for (const item of arr) {
          if (item.toLowerCase().includes(lowerQuery)) {
            matches.push({
              text: item,
              type,
              position: doc.content.toLowerCase().indexOf(item.toLowerCase())
            });
            score += 2; // Higher score for structured data matches
          }
        }
      };

      searchInArray(doc.extractedData.names, 'name');
      searchInArray(doc.extractedData.dates, 'date');
      searchInArray(doc.extractedData.numbers, 'number');
      searchInArray(doc.extractedData.keywords, 'keyword');

      // Only search in full content if no filter type is specified
      if (!filterType && doc.content.toLowerCase().includes(lowerQuery)) {
        const position = doc.content.toLowerCase().indexOf(lowerQuery);
        matches.push({
          text: query,
          type: 'keyword',
          position
        });
        score += 1;
      }

      if (matches.length > 0) {
        results.push({
          documentId: doc.id,
          filename: doc.filename,
          matches,
          score
        });
      }
    }

    // Sort by score (descending)
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Suggest related documents based on content similarity
   */
  suggestRelatedDocuments(
    documents: ScannedDocument[],
    documentId: string,
    limit: number = 5
  ): ScannedDocument[] {
    const sourceDoc = documents.find(d => d.id === documentId);
    if (!sourceDoc) return [];

    const scored: Array<{ doc: ScannedDocument; score: number }> = [];

    for (const doc of documents) {
      if (doc.id === documentId) continue;

      let score = 0;

      // Check for common names
      const commonNames = sourceDoc.extractedData.names?.filter(name =>
        doc.extractedData.names?.includes(name)
      ).length || 0;
      score += commonNames * 3;

      // Check for common dates
      const commonDates = sourceDoc.extractedData.dates?.filter(date =>
        doc.extractedData.dates?.includes(date)
      ).length || 0;
      score += commonDates * 2;

      // Check for common keywords
      const commonKeywords = sourceDoc.extractedData.keywords?.filter(kw =>
        doc.extractedData.keywords?.includes(kw)
      ).length || 0;
      score += commonKeywords;

      if (score > 0) {
        scored.push({ doc, score });
      }
    }

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.doc);
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.initialized = false;
    }
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `scan-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}

import * as chrono from 'chrono-node';

/**
 * Search Engine for extracted document data
 * Supports searching for names, dates, totals, and keywords
 */
class SearchEngine {
  constructor() {
    this.documents = new Map(); // documentId -> document data
    this.index = {
      text: new Map(),      // word -> Set of documentIds
      dates: new Map(),     // date string -> Set of documentIds
      numbers: new Map(),   // number -> Set of documentIds
      names: new Map()      // name -> Set of documentIds
    };
  }

  /**
   * Index a document for searching
   * @param {string} documentId - Unique document identifier
   * @param {Object} documentData - Document data with text and metadata
   */
  indexDocument(documentId, documentData) {
    this.documents.set(documentId, documentData);
    
    const text = documentData.text || '';
    const words = this.tokenize(text);
    
    // Index words
    words.forEach(word => {
      if (!this.index.text.has(word)) {
        this.index.text.set(word, new Set());
      }
      this.index.text.get(word).add(documentId);
    });
    
    // Extract and index dates
    const dates = this.extractDates(text);
    dates.forEach(date => {
      if (!this.index.dates.has(date)) {
        this.index.dates.set(date, new Set());
      }
      this.index.dates.get(date).add(documentId);
    });
    
    // Extract and index numbers/totals
    const numbers = this.extractNumbers(text);
    numbers.forEach(number => {
      if (!this.index.numbers.has(number)) {
        this.index.numbers.set(number, new Set());
      }
      this.index.numbers.get(number).add(documentId);
    });
    
    // Extract and index potential names
    const names = this.extractNames(text);
    names.forEach(name => {
      if (!this.index.names.has(name)) {
        this.index.names.set(name, new Set());
      }
      this.index.names.get(name).add(documentId);
    });
  }

  /**
   * Search for documents matching query
   * @param {string} query - Search query
   * @param {Object} options - Search options (type, fuzzy, etc.)
   * @returns {Array} Matching documents with relevance scores
   */
  search(query, options = {}) {
    const { type = 'all', limit = 10 } = options;
    const results = new Map(); // documentId -> score
    
    if (type === 'all' || type === 'text') {
      this.searchText(query, results);
    }
    
    if (type === 'all' || type === 'date') {
      this.searchDates(query, results);
    }
    
    if (type === 'all' || type === 'number') {
      this.searchNumbers(query, results);
    }
    
    if (type === 'all' || type === 'name') {
      this.searchNames(query, results);
    }
    
    // Sort by score and return top results
    const sortedResults = Array.from(results.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([docId, score]) => ({
        documentId: docId,
        score,
        data: this.documents.get(docId)
      }));
    
    return sortedResults;
  }

  /**
   * Search in text index
   */
  searchText(query, results) {
    const words = this.tokenize(query.toLowerCase());
    
    words.forEach(word => {
      if (this.index.text.has(word)) {
        this.index.text.get(word).forEach(docId => {
          results.set(docId, (results.get(docId) || 0) + 1);
        });
      }
    });
  }

  /**
   * Search for dates
   */
  searchDates(query, results) {
    const dates = this.extractDates(query);
    
    dates.forEach(date => {
      if (this.index.dates.has(date)) {
        this.index.dates.get(date).forEach(docId => {
          results.set(docId, (results.get(docId) || 0) + 2);
        });
      }
    });
  }

  /**
   * Search for numbers
   */
  searchNumbers(query, results) {
    const numbers = this.extractNumbers(query);
    
    numbers.forEach(number => {
      if (this.index.numbers.has(number)) {
        this.index.numbers.get(number).forEach(docId => {
          results.set(docId, (results.get(docId) || 0) + 1.5);
        });
      }
    });
  }

  /**
   * Search for names
   */
  searchNames(query, results) {
    const queryLower = query.toLowerCase();
    
    for (const [name, docIds] of this.index.names.entries()) {
      if (name.includes(queryLower)) {
        docIds.forEach(docId => {
          results.set(docId, (results.get(docId) || 0) + 2);
        });
      }
    }
  }

  /**
   * Tokenize text into words
   */
  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2);
  }

  /**
   * Extract dates from text using chrono-node
   */
  extractDates(text) {
    const parsedDates = chrono.parse(text);
    return parsedDates.map(result => {
      const date = result.start.date();
      return date.toISOString().split('T')[0]; // YYYY-MM-DD format
    });
  }

  /**
   * Extract numbers from text (potential totals, amounts)
   */
  extractNumbers(text) {
    const numberPattern = /\$?\d+(?:,\d{3})*(?:\.\d{2})?/g;
    const matches = text.match(numberPattern) || [];
    return matches.map(match => match.replace(/[$,]/g, ''));
  }

  /**
   * Extract potential names (capitalized words/phrases)
   */
  extractNames(text) {
    const namePattern = /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g;
    const matches = text.match(namePattern) || [];
    return matches.map(name => name.toLowerCase());
  }

  /**
   * Get suggestions based on document content
   */
  getSuggestions(documentId) {
    const document = this.documents.get(documentId);
    if (!document) return [];
    
    const suggestions = [];
    const text = document.text || '';
    
    // Extract key entities
    const dates = this.extractDates(text);
    const numbers = this.extractNumbers(text);
    const names = this.extractNames(text);
    
    // Find related documents
    dates.forEach(date => {
      if (this.index.dates.has(date)) {
        this.index.dates.get(date).forEach(docId => {
          if (docId !== documentId) {
            suggestions.push({
              documentId: docId,
              reason: `Shares date: ${date}`,
              data: this.documents.get(docId)
            });
          }
        });
      }
    });
    
    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  /**
   * Remove a document from the index
   */
  removeDocument(documentId) {
    this.documents.delete(documentId);
    
    // Remove from all indexes
    for (const [word, docIds] of this.index.text.entries()) {
      docIds.delete(documentId);
    }
    for (const [date, docIds] of this.index.dates.entries()) {
      docIds.delete(documentId);
    }
    for (const [number, docIds] of this.index.numbers.entries()) {
      docIds.delete(documentId);
    }
    for (const [name, docIds] of this.index.names.entries()) {
      docIds.delete(documentId);
    }
  }

  /**
   * Get all indexed documents
   */
  getAllDocuments() {
    return Array.from(this.documents.entries()).map(([id, data]) => ({
      documentId: id,
      data
    }));
  }
}

export default SearchEngine;

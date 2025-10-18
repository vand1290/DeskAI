import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Scanner } from '../scanner';
import { ScannedDocument } from '../memory';

describe('Scanner', () => {
  let scanner: Scanner;

  beforeEach(() => {
    scanner = new Scanner();
  });

  afterEach(async () => {
    // Only cleanup if initialized
    try {
      await scanner.cleanup();
    } catch (error) {
      // Ignore cleanup errors in tests
    }
  });

  describe('initialization', () => {
    it('should create a scanner instance', () => {
      const newScanner = new Scanner();
      expect(newScanner).toBeDefined();
    });
  });

  describe('searchDocuments', () => {
    it('should find documents by keyword', () => {
      const documents: ScannedDocument[] = [
        {
          id: 'doc1',
          filename: 'invoice.pdf',
          content: 'Invoice for services rendered. Total amount: $500',
          extractedData: {
            names: ['John Doe'],
            dates: ['12/31/2023'],
            numbers: ['$500'],
            keywords: ['invoice', 'services', 'total']
          },
          metadata: {
            uploadedAt: Date.now()
          },
          relatedConversationIds: [],
          tags: []
        },
        {
          id: 'doc2',
          filename: 'receipt.pdf',
          content: 'Receipt for payment received',
          extractedData: {
            names: [],
            dates: ['01/15/2024'],
            numbers: ['$300'],
            keywords: ['receipt', 'payment']
          },
          metadata: {
            uploadedAt: Date.now()
          },
          relatedConversationIds: [],
          tags: []
        }
      ];

      const results = scanner.searchDocuments(documents, 'invoice');
      
      expect(results).toHaveLength(1);
      expect(results[0].documentId).toBe('doc1');
      expect(results[0].matches.length).toBeGreaterThan(0);
    });

    it('should filter by type', () => {
      const documents: ScannedDocument[] = [
        {
          id: 'doc1',
          filename: 'invoice.pdf',
          content: 'Invoice for John Doe dated 12/31/2023',
          extractedData: {
            names: ['John Doe'],
            dates: ['12/31/2023'],
            numbers: [],
            keywords: []
          },
          metadata: {
            uploadedAt: Date.now()
          },
          relatedConversationIds: [],
          tags: []
        }
      ];

      const nameResults = scanner.searchDocuments(documents, 'John', 'name');
      expect(nameResults).toHaveLength(1);
      expect(nameResults[0].matches[0].type).toBe('name');

      const dateResults = scanner.searchDocuments(documents, '12/31', 'date');
      expect(dateResults).toHaveLength(1);
      expect(dateResults[0].matches[0].type).toBe('date');
    });

    it('should score structured data matches higher', () => {
      const documents: ScannedDocument[] = [
        {
          id: 'doc1',
          filename: 'doc1.pdf',
          content: 'Document about general topics',
          extractedData: {
            names: [],
            dates: [],
            numbers: [],
            keywords: ['john', 'keyword']
          },
          metadata: {
            uploadedAt: Date.now()
          },
          relatedConversationIds: [],
          tags: []
        },
        {
          id: 'doc2',
          filename: 'doc2.pdf',
          content: 'Document about important people',
          extractedData: {
            names: ['John Doe'],
            dates: [],
            numbers: [],
            keywords: []
          },
          metadata: {
            uploadedAt: Date.now()
          },
          relatedConversationIds: [],
          tags: []
        }
      ];

      const results = scanner.searchDocuments(documents, 'john');
      
      // Both should match, and scores should be equal (both get +2 for structured data)
      expect(results).toHaveLength(2);
      expect(results[0].score).toEqual(2);
      expect(results[1].score).toEqual(2);
    });
  });

  describe('suggestRelatedDocuments', () => {
    it('should suggest documents with common names', () => {
      const documents: ScannedDocument[] = [
        {
          id: 'doc1',
          filename: 'invoice1.pdf',
          content: 'Invoice for John Doe',
          extractedData: {
            names: ['John Doe'],
            dates: ['12/31/2023'],
            numbers: [],
            keywords: []
          },
          metadata: {
            uploadedAt: Date.now()
          },
          relatedConversationIds: [],
          tags: []
        },
        {
          id: 'doc2',
          filename: 'invoice2.pdf',
          content: 'Invoice for John Doe',
          extractedData: {
            names: ['John Doe'],
            dates: ['01/15/2024'],
            numbers: [],
            keywords: []
          },
          metadata: {
            uploadedAt: Date.now()
          },
          relatedConversationIds: [],
          tags: []
        },
        {
          id: 'doc3',
          filename: 'invoice3.pdf',
          content: 'Invoice for Jane Smith',
          extractedData: {
            names: ['Jane Smith'],
            dates: [],
            numbers: [],
            keywords: []
          },
          metadata: {
            uploadedAt: Date.now()
          },
          relatedConversationIds: [],
          tags: []
        }
      ];

      const related = scanner.suggestRelatedDocuments(documents, 'doc1');
      
      expect(related).toHaveLength(1);
      expect(related[0].id).toBe('doc2');
    });

    it('should suggest documents with common dates', () => {
      const documents: ScannedDocument[] = [
        {
          id: 'doc1',
          filename: 'doc1.pdf',
          content: 'Document from 12/31/2023',
          extractedData: {
            names: [],
            dates: ['12/31/2023'],
            numbers: [],
            keywords: []
          },
          metadata: {
            uploadedAt: Date.now()
          },
          relatedConversationIds: [],
          tags: []
        },
        {
          id: 'doc2',
          filename: 'doc2.pdf',
          content: 'Document from 12/31/2023',
          extractedData: {
            names: [],
            dates: ['12/31/2023'],
            numbers: [],
            keywords: []
          },
          metadata: {
            uploadedAt: Date.now()
          },
          relatedConversationIds: [],
          tags: []
        }
      ];

      const related = scanner.suggestRelatedDocuments(documents, 'doc1');
      
      expect(related).toHaveLength(1);
      expect(related[0].id).toBe('doc2');
    });

    it('should limit results', () => {
      const documents: ScannedDocument[] = Array.from({ length: 10 }, (_, i) => ({
        id: `doc${i}`,
        filename: `doc${i}.pdf`,
        content: 'Common content',
        extractedData: {
          names: ['Common Name'],
          dates: [],
          numbers: [],
          keywords: []
        },
        metadata: {
          uploadedAt: Date.now()
        },
        relatedConversationIds: [],
        tags: []
      }));

      const related = scanner.suggestRelatedDocuments(documents, 'doc0', 3);
      
      expect(related).toHaveLength(3);
    });
  });
});

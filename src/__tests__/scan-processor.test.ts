import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { ScanProcessor } from '../scan-processor';
import { MemoryManager, ScanDocument } from '../memory';

const TEST_DATA_DIR = '/tmp/deskai-test-scans';

describe('ScanProcessor', () => {
  let scanProcessor: ScanProcessor;
  let memoryManager: MemoryManager;

  beforeEach(async () => {
    // Create a fresh test directory
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true });
    }
    fs.mkdirSync(TEST_DATA_DIR, { recursive: true });

    scanProcessor = new ScanProcessor(TEST_DATA_DIR);
    await scanProcessor.initialize();

    memoryManager = new MemoryManager(TEST_DATA_DIR);
    await memoryManager.initialize();
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true });
    }
  });

  describe('initialization', () => {
    it('should create the scans directory', async () => {
      const scansDir = path.join(TEST_DATA_DIR, 'scans');
      expect(fs.existsSync(scansDir)).toBe(true);
    });
  });

  describe('metadata extraction', () => {
    it('should extract dates from text', () => {
      const processor = new ScanProcessor(TEST_DATA_DIR);
      const text = 'Invoice date: 01/15/2024, Due: January 30, 2024';
      // Access private method through any type for testing
      const dates = (processor as any).extractDates(text);
      
      expect(dates.length).toBeGreaterThan(0);
      expect(dates.some((d: string) => d.includes('2024'))).toBe(true);
    });

    it('should extract names from text', () => {
      const processor = new ScanProcessor(TEST_DATA_DIR);
      const text = 'Invoice from John Smith to Mary Johnson, ABC Company';
      const names = (processor as any).extractNames(text);
      
      expect(names).toContain('John Smith');
      expect(names).toContain('Mary Johnson');
    });

    it('should extract totals from text', () => {
      const processor = new ScanProcessor(TEST_DATA_DIR);
      const text = 'Total amount: $1,234.56, Balance: $500.00';
      const totals = (processor as any).extractTotals(text);
      
      expect(totals.length).toBeGreaterThan(0);
      expect(totals.some((t: string) => t.includes('$'))).toBe(true);
    });

    it('should extract keywords from text', () => {
      const processor = new ScanProcessor(TEST_DATA_DIR);
      const text = 'Invoice invoice invoice payment payment receipt';
      const keywords = (processor as any).extractKeywords(text);
      
      expect(keywords).toContain('invoice');
      expect(keywords).toContain('payment');
    });
  });

  describe('memory integration', () => {
    it('should store scans in memory manager', async () => {
      const mockScan: ScanDocument = {
        id: 'test-scan-1',
        filename: 'test.jpg',
        extractedText: 'Test invoice from John Smith dated 01/15/2024 total $100.00',
        metadata: {
          names: ['John Smith'],
          dates: ['01/15/2024'],
          totals: ['$100.00'],
          keywords: ['invoice', 'total']
        },
        uploadedAt: Date.now(),
        filePath: '/tmp/test.jpg'
      };

      await memoryManager.addScan(mockScan);
      const retrieved = await memoryManager.getScan('test-scan-1');
      
      expect(retrieved).toBeTruthy();
      expect(retrieved?.filename).toBe('test.jpg');
      expect(retrieved?.metadata.names).toContain('John Smith');
    });

    it('should list all scans sorted by upload time', async () => {
      const scan1: ScanDocument = {
        id: 'scan-1',
        filename: 'first.jpg',
        extractedText: 'First scan',
        metadata: { names: [], dates: [], totals: [], keywords: [] },
        uploadedAt: Date.now() - 1000,
        filePath: '/tmp/first.jpg'
      };

      const scan2: ScanDocument = {
        id: 'scan-2',
        filename: 'second.jpg',
        extractedText: 'Second scan',
        metadata: { names: [], dates: [], totals: [], keywords: [] },
        uploadedAt: Date.now(),
        filePath: '/tmp/second.jpg'
      };

      await memoryManager.addScan(scan1);
      await memoryManager.addScan(scan2);

      const scans = await memoryManager.listScans();
      expect(scans).toHaveLength(2);
      expect(scans[0].id).toBe('scan-2'); // Most recent first
      expect(scans[1].id).toBe('scan-1');
    });

    it('should search scans by query', async () => {
      const scan: ScanDocument = {
        id: 'scan-1',
        filename: 'invoice.jpg',
        extractedText: 'Invoice from John Smith for consulting services',
        metadata: {
          names: ['John Smith'],
          dates: ['01/15/2024'],
          totals: ['$500.00'],
          keywords: ['invoice', 'consulting', 'services']
        },
        uploadedAt: Date.now(),
        filePath: '/tmp/invoice.jpg'
      };

      await memoryManager.addScan(scan);
      const results = await memoryManager.searchScans('John Smith');
      
      expect(results).toHaveLength(1);
      expect(results[0].documentId).toBe('scan-1');
      expect(results[0].matches.some(m => m.type === 'name')).toBe(true);
    });

    it('should delete scans', async () => {
      const scan: ScanDocument = {
        id: 'scan-to-delete',
        filename: 'delete-me.jpg',
        extractedText: 'Test',
        metadata: { names: [], dates: [], totals: [], keywords: [] },
        uploadedAt: Date.now(),
        filePath: '/tmp/delete-me.jpg'
      };

      await memoryManager.addScan(scan);
      const deleted = await memoryManager.deleteScan('scan-to-delete');
      
      expect(deleted).toBe(true);
      const retrieved = await memoryManager.getScan('scan-to-delete');
      expect(retrieved).toBeNull();
    });
  });

  describe('scan-conversation linking', () => {
    it('should link a scan to a conversation', async () => {
      // Create a conversation
      const conversation = await memoryManager.createConversation('Test Conversation');
      
      // Create a scan
      const scan: ScanDocument = {
        id: 'scan-1',
        filename: 'test.jpg',
        extractedText: 'Test content',
        metadata: { names: [], dates: [], totals: [], keywords: [] },
        uploadedAt: Date.now(),
        filePath: '/tmp/test.jpg'
      };
      await memoryManager.addScan(scan);

      // Link them
      const linked = await memoryManager.linkScanToConversation(scan.id, conversation.id);
      expect(linked).toBe(true);

      // Verify the link
      const updatedScan = await memoryManager.getScan(scan.id);
      const updatedConv = await memoryManager.getConversation(conversation.id);
      
      expect(updatedScan?.linkedConversations).toContain(conversation.id);
      expect(updatedConv?.linkedScans).toContain(scan.id);
    });

    it('should suggest related conversations based on content', async () => {
      // Create conversations with specific content
      const conv1 = await memoryManager.createConversation('Project Discussion');
      await memoryManager.addMessage(conv1.id, 'user', 'Discussing the invoice from John Smith');
      await memoryManager.addMessage(conv1.id, 'agent', 'The invoice details look good');

      const conv2 = await memoryManager.createConversation('Random Chat');
      await memoryManager.addMessage(conv2.id, 'user', 'Hello world');

      // Create a scan with matching content
      const scan: ScanDocument = {
        id: 'scan-1',
        filename: 'invoice.jpg',
        extractedText: 'Invoice from John Smith',
        metadata: {
          names: ['John Smith'],
          dates: [],
          totals: [],
          keywords: ['invoice', 'john', 'smith']
        },
        uploadedAt: Date.now(),
        filePath: '/tmp/invoice.jpg'
      };
      await memoryManager.addScan(scan);

      // Get suggestions
      const suggestions = await memoryManager.getSuggestedConversations(scan.id, 5);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].id).toBe(conv1.id); // Should match the invoice conversation
    });
  });

  describe('persistence', () => {
    it('should persist scans to disk', async () => {
      const scan: ScanDocument = {
        id: 'persist-test',
        filename: 'test.jpg',
        extractedText: 'Test content',
        metadata: { names: [], dates: [], totals: [], keywords: [] },
        uploadedAt: Date.now(),
        filePath: '/tmp/test.jpg'
      };

      await memoryManager.addScan(scan);

      // Create a new memory manager instance
      const newMemory = new MemoryManager(TEST_DATA_DIR);
      await newMemory.initialize();

      const retrieved = await newMemory.getScan('persist-test');
      expect(retrieved).toBeTruthy();
      expect(retrieved?.filename).toBe('test.jpg');
    });
  });
});

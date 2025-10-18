import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { MemoryManager } from '../memory';

const TEST_DATA_DIR = '/tmp/deskai-test-data';

describe('MemoryManager', () => {
  let memoryManager: MemoryManager;

  beforeEach(async () => {
    // Create a fresh test directory
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true });
    }
    fs.mkdirSync(TEST_DATA_DIR, { recursive: true });

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
    it('should create the data directory if it does not exist', async () => {
      const newDir = path.join(TEST_DATA_DIR, 'subdir');
      const newMemory = new MemoryManager(newDir);
      await newMemory.initialize();

      expect(fs.existsSync(newDir)).toBe(true);
    });

    it('should load existing conversations from file', async () => {
      // Create a test conversation file
      const testConversations = [
        {
          id: 'test-1',
          title: 'Test Conversation',
          messages: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          tags: []
        }
      ];

      const conversationsPath = path.join(TEST_DATA_DIR, 'conversations.json');
      fs.writeFileSync(conversationsPath, JSON.stringify(testConversations));

      // Initialize a new memory manager
      const newMemory = new MemoryManager(TEST_DATA_DIR);
      await newMemory.initialize();

      const conversation = await newMemory.getConversation('test-1');
      expect(conversation).toBeTruthy();
      expect(conversation?.title).toBe('Test Conversation');
    });
  });

  describe('createConversation', () => {
    it('should create a new conversation with a title', async () => {
      const conversation = await memoryManager.createConversation('Test Title');

      expect(conversation.id).toBeTruthy();
      expect(conversation.title).toBe('Test Title');
      expect(conversation.messages).toEqual([]);
      expect(conversation.createdAt).toBeTruthy();
      expect(conversation.updatedAt).toBeTruthy();
    });

    it('should create a conversation with tags', async () => {
      const conversation = await memoryManager.createConversation('Tagged Conversation', ['tag1', 'tag2']);

      expect(conversation.tags).toEqual(['tag1', 'tag2']);
    });

    it('should persist the conversation to disk', async () => {
      await memoryManager.createConversation('Persisted');

      const conversationsPath = path.join(TEST_DATA_DIR, 'conversations.json');
      const data = fs.readFileSync(conversationsPath, 'utf-8');
      const conversations = JSON.parse(data);

      expect(conversations).toHaveLength(1);
      expect(conversations[0].title).toBe('Persisted');
    });
  });

  describe('addMessage', () => {
    it('should add a message to an existing conversation', async () => {
      const conversation = await memoryManager.createConversation('Test');
      const message = await memoryManager.addMessage(conversation.id, 'user', 'Hello!');

      expect(message.id).toBeTruthy();
      expect(message.role).toBe('user');
      expect(message.content).toBe('Hello!');
      expect(message.timestamp).toBeTruthy();
    });

    it('should update the conversation updatedAt timestamp', async () => {
      const conversation = await memoryManager.createConversation('Test');
      const originalUpdatedAt = conversation.updatedAt;

      // Wait a bit to ensure timestamp changes
      await new Promise(resolve => setTimeout(resolve, 10));

      await memoryManager.addMessage(conversation.id, 'user', 'Hello!');

      const updated = await memoryManager.getConversation(conversation.id);
      expect(updated!.updatedAt).toBeGreaterThan(originalUpdatedAt);
    });

    it('should throw error for non-existent conversation', async () => {
      await expect(
        memoryManager.addMessage('non-existent', 'user', 'Hello!')
      ).rejects.toThrow();
    });

    it('should persist messages to disk', async () => {
      const conversation = await memoryManager.createConversation('Test');
      await memoryManager.addMessage(conversation.id, 'user', 'Message 1');
      await memoryManager.addMessage(conversation.id, 'agent', 'Message 2');

      const conversationsPath = path.join(TEST_DATA_DIR, 'conversations.json');
      const data = fs.readFileSync(conversationsPath, 'utf-8');
      const conversations = JSON.parse(data);

      expect(conversations[0].messages).toHaveLength(2);
      expect(conversations[0].messages[0].content).toBe('Message 1');
      expect(conversations[0].messages[1].content).toBe('Message 2');
    });
  });

  describe('getConversation', () => {
    it('should retrieve an existing conversation', async () => {
      const created = await memoryManager.createConversation('Test');
      const retrieved = await memoryManager.getConversation(created.id);

      expect(retrieved).toBeTruthy();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.title).toBe('Test');
    });

    it('should return null for non-existent conversation', async () => {
      const result = await memoryManager.getConversation('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('listConversations', () => {
    it('should return an empty array when no conversations exist', async () => {
      const list = await memoryManager.listConversations();
      expect(list).toEqual([]);
    });

    it('should return conversation summaries', async () => {
      const conv1 = await memoryManager.createConversation('First');
      await memoryManager.addMessage(conv1.id, 'user', 'Hello');
      
      const conv2 = await memoryManager.createConversation('Second');
      await memoryManager.addMessage(conv2.id, 'user', 'Hi there');

      const list = await memoryManager.listConversations();

      expect(list).toHaveLength(2);
      expect(list[0].messageCount).toBeGreaterThan(0);
      expect(list[0].lastMessage).toBeTruthy();
    });

    it('should sort conversations by most recent first', async () => {
      const conv1 = await memoryManager.createConversation('First');
      await new Promise(resolve => setTimeout(resolve, 10));
      const conv2 = await memoryManager.createConversation('Second');

      const list = await memoryManager.listConversations();

      expect(list[0].id).toBe(conv2.id);
      expect(list[1].id).toBe(conv1.id);
    });
  });

  describe('searchConversations', () => {
    beforeEach(async () => {
      const conv1 = await memoryManager.createConversation('Tech Discussion');
      await memoryManager.addMessage(conv1.id, 'user', 'I love TypeScript');
      await memoryManager.addMessage(conv1.id, 'agent', 'TypeScript is great!');

      const conv2 = await memoryManager.createConversation('General Chat');
      await memoryManager.addMessage(conv2.id, 'user', 'Hello world');
      await memoryManager.addMessage(conv2.id, 'agent', 'Hi there!');
    });

    it('should find messages matching the query', async () => {
      const results = await memoryManager.searchConversations('TypeScript');

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].content).toContain('TypeScript');
    });

    it('should be case-insensitive', async () => {
      const results = await memoryManager.searchConversations('typescript');

      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty array when no matches found', async () => {
      const results = await memoryManager.searchConversations('nonexistent');

      expect(results).toEqual([]);
    });

    it('should include conversation and message IDs in results', async () => {
      const results = await memoryManager.searchConversations('TypeScript');

      expect(results[0].conversationId).toBeTruthy();
      expect(results[0].messageId).toBeTruthy();
    });
  });

  describe('filterByTags', () => {
    beforeEach(async () => {
      await memoryManager.createConversation('First', ['work', 'urgent']);
      await memoryManager.createConversation('Second', ['personal']);
      await memoryManager.createConversation('Third', ['work']);
    });

    it('should filter conversations by single tag', async () => {
      const results = await memoryManager.filterByTags(['work']);

      expect(results).toHaveLength(2);
    });

    it('should filter conversations by multiple tags', async () => {
      const results = await memoryManager.filterByTags(['urgent']);

      expect(results).toHaveLength(1);
    });

    it('should return empty array when no conversations match', async () => {
      const results = await memoryManager.filterByTags(['nonexistent']);

      expect(results).toEqual([]);
    });
  });

  describe('deleteConversation', () => {
    it('should delete an existing conversation', async () => {
      const conv = await memoryManager.createConversation('To Delete');
      const deleted = await memoryManager.deleteConversation(conv.id);

      expect(deleted).toBe(true);

      const retrieved = await memoryManager.getConversation(conv.id);
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent conversation', async () => {
      const deleted = await memoryManager.deleteConversation('non-existent');
      expect(deleted).toBe(false);
    });

    it('should persist deletion to disk', async () => {
      const conv = await memoryManager.createConversation('To Delete');
      await memoryManager.deleteConversation(conv.id);

      const conversationsPath = path.join(TEST_DATA_DIR, 'conversations.json');
      const data = fs.readFileSync(conversationsPath, 'utf-8');
      const conversations = JSON.parse(data);

      expect(conversations).toHaveLength(0);
    });
  });

  describe('exportConversations', () => {
    it('should export all conversations', async () => {
      await memoryManager.createConversation('First');
      await memoryManager.createConversation('Second');

      const exported = await memoryManager.exportConversations();

      expect(exported).toHaveLength(2);
      expect(exported[0].title).toBeTruthy();
      expect(exported[1].title).toBeTruthy();
    });

    it('should include full conversation data', async () => {
      const conv = await memoryManager.createConversation('Test');
      await memoryManager.addMessage(conv.id, 'user', 'Hello');

      const exported = await memoryManager.exportConversations();

      expect(exported[0].messages).toHaveLength(1);
      expect(exported[0].messages[0].content).toBe('Hello');
    });
  });

  describe('getAnalytics', () => {
    beforeEach(async () => {
      const conv1 = await memoryManager.createConversation('First', ['work']);
      await memoryManager.addMessage(conv1.id, 'user', 'Message 1');
      await memoryManager.addMessage(conv1.id, 'agent', 'Response 1');

      const conv2 = await memoryManager.createConversation('Second', ['work', 'urgent']);
      await memoryManager.addMessage(conv2.id, 'user', 'Message 2');
    });

    it('should calculate total conversations and messages', async () => {
      const analytics = await memoryManager.getAnalytics();

      expect(analytics.totalConversations).toBe(2);
      expect(analytics.totalMessages).toBe(3);
    });

    it('should calculate average messages per conversation', async () => {
      const analytics = await memoryManager.getAnalytics();

      expect(analytics.averageMessagesPerConversation).toBe(1.5);
    });

    it('should extract frequent topics from tags', async () => {
      const analytics = await memoryManager.getAnalytics();

      expect(analytics.frequentTopics).toContainEqual({ topic: 'work', count: 2 });
      expect(analytics.frequentTopics).toContainEqual({ topic: 'urgent', count: 1 });
    });

    it('should include most recent conversations', async () => {
      const analytics = await memoryManager.getAnalytics();

      expect(analytics.mostRecentConversations).toHaveLength(2);
    });

    it('should group conversations by day', async () => {
      const analytics = await memoryManager.getAnalytics();
      const today = new Date().toISOString().split('T')[0];

      expect(analytics.conversationsByDay[today]).toBe(2);
    });
  });

  describe('clearAll', () => {
    it('should clear all conversations', async () => {
      await memoryManager.createConversation('First');
      await memoryManager.createConversation('Second');

      await memoryManager.clearAll();

      const list = await memoryManager.listConversations();
      expect(list).toEqual([]);
    });

    it('should persist clear to disk', async () => {
      await memoryManager.createConversation('Test');
      await memoryManager.clearAll();

      const conversationsPath = path.join(TEST_DATA_DIR, 'conversations.json');
      const data = fs.readFileSync(conversationsPath, 'utf-8');
      const conversations = JSON.parse(data);

      expect(conversations).toEqual([]);
    });
  });
});

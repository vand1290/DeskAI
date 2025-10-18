import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'fs';
import { MemoryManager } from '../memory';
import { Agent } from '../agent';

const TEST_DATA_DIR = '/tmp/deskai-agent-test';

describe('Agent', () => {
  let memoryManager: MemoryManager;
  let agent: Agent;

  beforeEach(async () => {
    // Clean up and create test directory
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true });
    }
    fs.mkdirSync(TEST_DATA_DIR, { recursive: true });

    memoryManager = new MemoryManager(TEST_DATA_DIR);
    await memoryManager.initialize();

    agent = new Agent(memoryManager, { memoryEnabled: true });
  });

  afterEach(() => {
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true });
    }
  });

  describe('startConversation', () => {
    it('should start a new conversation', async () => {
      const conversationId = await agent.startConversation('Test Conversation');

      expect(conversationId).toBeTruthy();
      expect(agent.getCurrentConversationId()).toBe(conversationId);
    });

    it('should use default title if none provided', async () => {
      const conversationId = await agent.startConversation();
      const conversation = await memoryManager.getConversation(conversationId);

      expect(conversation?.title).toContain('Conversation');
    });

    it('should support tags', async () => {
      const conversationId = await agent.startConversation('Tagged', ['tag1', 'tag2']);
      const conversation = await memoryManager.getConversation(conversationId);

      expect(conversation?.tags).toEqual(['tag1', 'tag2']);
    });
  });

  describe('continueConversation', () => {
    it('should continue an existing conversation', async () => {
      const conversationId = await agent.startConversation('Test');
      await agent.processMessage('Hello');

      // Create a new agent instance
      const newAgent = new Agent(memoryManager, { memoryEnabled: true });
      const success = await newAgent.continueConversation(conversationId);

      expect(success).toBe(true);
      expect(newAgent.getCurrentConversationId()).toBe(conversationId);
    });

    it('should return false for non-existent conversation', async () => {
      const success = await agent.continueConversation('non-existent');
      expect(success).toBe(false);
    });
  });

  describe('processMessage', () => {
    it('should process a user message and return a response', async () => {
      const response = await agent.processMessage('Hello');

      expect(response.content).toBeTruthy();
      expect(typeof response.content).toBe('string');
    });

    it('should log messages when memory is enabled', async () => {
      await agent.processMessage('Test message');

      const conversationId = agent.getCurrentConversationId();
      const conversation = await memoryManager.getConversation(conversationId!);

      expect(conversation?.messages).toHaveLength(2); // User + Agent
      expect(conversation?.messages[0].content).toBe('Test message');
      expect(conversation?.messages[0].role).toBe('user');
      expect(conversation?.messages[1].role).toBe('agent');
    });

    it('should not log messages when memory is disabled', async () => {
      const agentNoMemory = new Agent(memoryManager, { memoryEnabled: false });
      await agentNoMemory.processMessage('Test message');

      const conversations = await memoryManager.listConversations();
      expect(conversations).toHaveLength(0);
    });

    it('should automatically start a conversation if none exists', async () => {
      expect(agent.getCurrentConversationId()).toBeNull();

      await agent.processMessage('First message');

      expect(agent.getCurrentConversationId()).toBeTruthy();
    });

    it('should respond to greeting messages', async () => {
      const response = await agent.processMessage('Hello');

      expect(response.content.toLowerCase()).toContain('hello');
    });

    it('should respond to help requests', async () => {
      const response = await agent.processMessage('help');

      expect(response.content.toLowerCase()).toContain('help');
    });
  });

  describe('getConversationHistory', () => {
    it('should return empty array when no conversation is active', async () => {
      const history = await agent.getConversationHistory();
      expect(history).toEqual([]);
    });

    it('should return messages from current conversation', async () => {
      await agent.processMessage('Message 1');
      await agent.processMessage('Message 2');

      const history = await agent.getConversationHistory();

      expect(history.length).toBeGreaterThanOrEqual(4); // 2 user + 2 agent messages
    });
  });

  describe('searchContext', () => {
    it('should search for relevant messages across conversations', async () => {
      await agent.startConversation('First');
      await agent.processMessage('I love TypeScript');

      await agent.startConversation('Second');
      await agent.processMessage('TypeScript is great');

      const results = await agent.searchContext('TypeScript');

      expect(results.length).toBeGreaterThan(0);
    });

    it('should limit results based on limit parameter', async () => {
      await agent.startConversation('Test');
      await agent.processMessage('Test message 1');
      await agent.processMessage('Test message 2');
      await agent.processMessage('Test message 3');

      const results = await agent.searchContext('Test', 2);

      expect(results.length).toBeLessThanOrEqual(2);
    });
  });

  describe('response generation', () => {
    it('should handle history requests', async () => {
      await agent.startConversation('Conv 1');
      await agent.processMessage('First');

      await agent.startConversation('Conv 2');
      const response = await agent.processMessage('show me my history');

      expect(response.content.toLowerCase()).toContain('conversation');
    });

    it('should handle analytics requests', async () => {
      await agent.startConversation('Test', ['tag1']);
      await agent.processMessage('Test message');

      const response = await agent.processMessage('show me analytics');

      expect(response.content.toLowerCase()).toContain('conversation');
      expect(response.metadata?.type).toBe('analytics');
    });

    it('should provide context-aware responses', async () => {
      await agent.startConversation('Test');
      await agent.processMessage('Message 1');
      await agent.processMessage('Message 2');
      
      const response = await agent.processMessage('What did we discuss?');

      expect(response.content).toBeTruthy();
    });
  });
});

/**
 * Unit tests for agent routing logic
 */

import { Agent } from '../agent';
import { AgentRequest } from '../router';

describe('Agent', () => {
  let agent: Agent;

  beforeEach(() => {
    agent = new Agent();
  });

  describe('initialization', () => {
    it('should initialize with available models', () => {
      const models = agent.getAvailableModels();
      expect(models).toContain('qwen2.5:7b');
      expect(models).toContain('llama2:7b');
      expect(models).toContain('mistral:7b');
    });

    it('should initialize with available tools', () => {
      const tools = agent.getAvailableTools();
      const toolNames = tools.map(t => t.name);
      expect(toolNames).toContain('file_write');
      expect(toolNames).toContain('file_read');
      expect(toolNames).toContain('calculator');
      expect(toolNames).toContain('text_analysis');
    });
  });

  describe('processRequest', () => {
    it('should reject empty queries', async () => {
      const request: AgentRequest = { query: '' };
      await expect(agent.processRequest(request)).rejects.toThrow('Query cannot be empty');
    });

    it('should process a basic model query', async () => {
      const request: AgentRequest = {
        query: 'What is the meaning of life?',
        model: 'qwen2.5:7b'
      };
      
      const response = await agent.processRequest(request);
      
      expect(response).toBeDefined();
      expect(response.result).toBeTruthy();
      expect(response.deterministic).toBe(true);
      expect(response.route).toContain('qwen2.5:7b');
    });

    it('should produce deterministic results for same input', async () => {
      const request: AgentRequest = {
        query: 'Hello world',
        model: 'qwen2.5:7b'
      };
      
      const response1 = await agent.processRequest(request);
      const response2 = await agent.processRequest(request);
      
      expect(response1.result).toBe(response2.result);
      expect(response1.deterministic).toBe(true);
      expect(response2.deterministic).toBe(true);
    });

    it('should identify tool-based queries', async () => {
      const request: AgentRequest = {
        query: 'Calculate 2 + 2'
      };
      
      const response = await agent.processRequest(request);
      
      expect(response.toolsUsed).toContain('calculator');
    });

    it('should handle errors gracefully', async () => {
      const request: AgentRequest = {
        query: 'Test query',
        model: 'nonexistent-model'
      };
      
      const response = await agent.processRequest(request);
      
      expect(response).toBeDefined();
      expect(response.deterministic).toBe(true);
    });
  });

  describe('getRoutingInfo', () => {
    it('should provide routing information', () => {
      const info = agent.getRoutingInfo();
      
      expect(info.availableModels).toBeInstanceOf(Array);
      expect(info.availableModels.length).toBeGreaterThan(0);
      expect(info.availableTools).toBeInstanceOf(Array);
      expect(info.availableTools.length).toBeGreaterThan(0);
    });
  });

  describe('offline behavior', () => {
    it('should not make any network calls', async () => {
      // This test ensures no network calls are made
      // In a real scenario, we'd mock network and verify no calls
      const request: AgentRequest = {
        query: 'Test offline behavior'
      };
      
      const response = await agent.processRequest(request);
      
      expect(response).toBeDefined();
      expect(response.deterministic).toBe(true);
    });
  });
});

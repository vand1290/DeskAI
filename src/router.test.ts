/**
 * Tests for the meta-agent router
 */

import { describe, test, expect } from '@jest/globals';
import { routeRequest, handleRequest } from './router.js';
import { Message } from './types.js';

describe('routeRequest', () => {
  test('routes code-related queries to code agent', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Help me debug this JavaScript code' }
    ];
    
    const decision = routeRequest(messages);
    expect(decision.agentName).toBe('code');
    expect(decision.reasoning).toContain('code-related');
  });
  
  test('routes data-related queries to data agent', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Analyze this CSV data' }
    ];
    
    const decision = routeRequest(messages);
    expect(decision.agentName).toBe('data');
    expect(decision.reasoning).toContain('data analysis');
  });
  
  test('routes general queries to general agent', () => {
    const messages: Message[] = [
      { role: 'user', content: 'What is the weather like?' }
    ];
    
    const decision = routeRequest(messages);
    expect(decision.agentName).toBe('general');
  });
  
  test('defaults to general agent for empty messages', () => {
    const messages: Message[] = [];
    
    const decision = routeRequest(messages);
    expect(decision.agentName).toBe('general');
  });
});

describe('handleRequest', () => {
  test('successfully handles a request and returns response', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hello, can you help me?' }
    ];
    
    const result = await handleRequest(messages);
    
    expect(result.response).toBeDefined();
    expect(result.agent).toBe('general');
    expect(result.reasoning).toBeDefined();
  });
  
  test('routes to code agent for programming questions', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'How do I write a function in Python?' }
    ];
    
    const result = await handleRequest(messages);
    
    expect(result.agent).toBe('code');
    expect(result.response).toContain('Code Agent');
  });
  
  test('is deterministic for same input', async () => {
    const messages: Message[] = [
      { role: 'user', content: 'Test message' }
    ];
    
    const result1 = await handleRequest(messages);
    const result2 = await handleRequest(messages);
    
    expect(result1.response).toBe(result2.response);
    expect(result1.agent).toBe(result2.agent);
  });
});

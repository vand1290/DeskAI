/**
 * Offline agents with deterministic behavior
 * These are stubs that can be replaced with local model runners
 */

import { Agent, Message } from './types.js';

/**
 * General-purpose agent using qwen2.5:7b model
 */
export const generalAgent: Agent = {
  name: 'general',
  model: 'qwen2.5:7b',
  description: 'General-purpose assistant for answering questions and tasks',
  async invoke(messages: Message[]): Promise<string> {
    // Deterministic stub - returns a predictable response
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return 'I am ready to assist you. Please provide your request.';
    }
    
    // Simple deterministic response based on input
    return `[Offline Response] I received your request: "${lastMessage.content}". This is a deterministic stub response. Replace with your local model runner for actual inference.`;
  }
};

/**
 * Code-focused agent for programming tasks
 */
export const codeAgent: Agent = {
  name: 'code',
  model: 'qwen2.5:7b',
  description: 'Specialized agent for code generation and debugging',
  async invoke(messages: Message[]): Promise<string> {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return 'I am ready to help with coding tasks.';
    }
    
    return `[Code Agent] Analyzing your request: "${lastMessage.content}". This is a deterministic stub. Integrate with your local code model for real responses.`;
  }
};

/**
 * Data analysis agent
 */
export const dataAgent: Agent = {
  name: 'data',
  model: 'qwen2.5:7b',
  description: 'Agent specialized in data analysis and interpretation',
  async invoke(messages: Message[]): Promise<string> {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return 'I am ready to analyze data.';
    }
    
    return `[Data Agent] Processing your data request: "${lastMessage.content}". This is a deterministic stub. Connect your local data analysis model.`;
  }
};

export const allAgents: Agent[] = [
  generalAgent,
  codeAgent,
  dataAgent
];

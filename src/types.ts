/**
 * Core types for the offline meta-agent system
 */

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<string>;
}

export interface Agent {
  name: string;
  model: string;
  description: string;
  invoke: (messages: Message[]) => Promise<string>;
}

export interface RouteDecision {
  agentName: string;
  reasoning: string;
}

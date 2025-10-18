/**
 * Meta-agent router that determines which agent to use
 * Fully deterministic and offline
 */

import { Message, RouteDecision, Agent } from './types.js';
import { allAgents } from './agents.js';

/**
 * Deterministic routing logic based on keywords
 */
export function routeRequest(messages: Message[]): RouteDecision {
  const lastMessage = messages[messages.length - 1];
  if (!lastMessage || lastMessage.role !== 'user') {
    return {
      agentName: 'general',
      reasoning: 'Default to general agent for non-user messages'
    };
  }
  
  const content = lastMessage.content.toLowerCase();
  
  // Code-related keywords
  const codeKeywords = ['code', 'program', 'function', 'class', 'bug', 'debug', 'javascript', 'python', 'typescript', 'compile'];
  if (codeKeywords.some(keyword => content.includes(keyword))) {
    return {
      agentName: 'code',
      reasoning: 'Detected code-related keywords in request'
    };
  }
  
  // Data-related keywords
  const dataKeywords = ['data', 'analyze', 'statistics', 'chart', 'graph', 'csv', 'excel', 'visualization'];
  if (dataKeywords.some(keyword => content.includes(keyword))) {
    return {
      agentName: 'data',
      reasoning: 'Detected data analysis keywords in request'
    };
  }
  
  // Default to general agent
  return {
    agentName: 'general',
    reasoning: 'No specific domain detected, using general agent'
  };
}

/**
 * Find an agent by name
 */
export function getAgent(name: string): Agent | undefined {
  return allAgents.find(agent => agent.name === name);
}

/**
 * Main meta-agent that routes and executes requests
 */
export async function handleRequest(messages: Message[]): Promise<{
  response: string;
  agent: string;
  reasoning: string;
}> {
  const decision = routeRequest(messages);
  const agent = getAgent(decision.agentName);
  
  if (!agent) {
    throw new Error(`Agent '${decision.agentName}' not found`);
  }
  
  const response = await agent.invoke(messages);
  
  return {
    response,
    agent: decision.agentName,
    reasoning: decision.reasoning
  };
}

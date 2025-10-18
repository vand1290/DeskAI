import { MemoryManager } from './memory.js';
import { Agent } from './agent.js';
import { Scanner } from './scanner.js';

export interface RouterRequest {
  action: string;
  params?: Record<string, unknown>;
}

export interface RouterResponse {
  success: boolean;
  data?: unknown;
  error?: string;
}

/**
 * Router handles routing of requests to appropriate handlers
 * Provides a simple API for interacting with the memory system, agent, and task chains
 */
export class Router {
  private memory: MemoryManager;
  private agent: Agent;
  private scanner: Scanner;

  constructor(memory: MemoryManager, agent: Agent, scanner: Scanner) {
    this.memory = memory;
    this.agent = agent;
    this.scanner = scanner;
  }

  /**
   * Handle a request and route it to the appropriate handler
   */
  async handleRequest(request: RouterRequest): Promise<RouterResponse> {
    try {
      switch (request.action) {
        case 'message':
          return await this.handleMessage(request.params);
        
        case 'startConversation':
          return await this.handleStartConversation(request.params);
        
        case 'continueConversation':
          return await this.handleContinueConversation(request.params);
        
        case 'listConversations':
          return await this.handleListConversations();
        
        case 'getConversation':
          return await this.handleGetConversation(request.params);
        
        case 'searchConversations':
          return await this.handleSearchConversations(request.params);
        
        case 'deleteConversation':
          return await this.handleDeleteConversation(request.params);
        
        case 'exportConversations':
          return await this.handleExportConversations();
        
        case 'getAnalytics':
          return await this.handleGetAnalytics();
        
        case 'filterByTags':
          return await this.handleFilterByTags(request.params);
        
        case 'processDocument':
          return await this.handleProcessDocument(request.params);
        
        case 'listScannedDocuments':
          return await this.handleListScannedDocuments();
        
        case 'getScannedDocument':
          return await this.handleGetScannedDocument(request.params);
        
        case 'searchScannedDocuments':
          return await this.handleSearchScannedDocuments(request.params);
        
        case 'deleteScannedDocument':
          return await this.handleDeleteScannedDocument(request.params);
        
        case 'linkDocumentToConversation':
          return await this.handleLinkDocumentToConversation(request.params);
        
        case 'suggestRelatedDocuments':
          return await this.handleSuggestRelatedDocuments(request.params);
        
        default:
          return {
            success: false,
            error: `Unknown action: ${request.action}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async handleMessage(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.message || typeof params.message !== 'string') {
      return { success: false, error: 'Message is required' };
    }

    const response = await this.agent.processMessage(params.message as string);
    return {
      success: true,
      data: {
        response: response.content,
        conversationId: this.agent.getCurrentConversationId(),
        metadata: response.metadata
      }
    };
  }

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

  // Task chain handlers
  private async handleCreateChain(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.name || typeof params.name !== 'string') {
      return { success: false, error: 'Chain name is required' };
    }

    const name = params.name as string;
    const description = params.description as string | undefined;
    const tags = params.tags as string[] | undefined;

    const chain = await this.taskChainManager.createChain(name, description, tags);
    return {
      success: true,
      data: { chain }
    };
  }

  private async handleGetChain(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.chainId || typeof params.chainId !== 'string') {
      return { success: false, error: 'Chain ID is required' };
    }

    const chain = await this.taskChainManager.getChain(params.chainId as string);
    if (!chain) {
      return { success: false, error: 'Chain not found' };
    }

    return {
      success: true,
      data: { chain }
    };
  }

  private async handleListChains(params?: Record<string, unknown>): Promise<RouterResponse> {
    const tags = params?.tags as string[] | undefined;
    const chains = await this.taskChainManager.listChains(tags);
    
    return {
      success: true,
      data: { chains }
    };
  }

  private async handleDeleteChain(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.chainId || typeof params.chainId !== 'string') {
      return { success: false, error: 'Chain ID is required' };
    }

    const deleted = await this.taskChainManager.deleteChain(params.chainId as string);
    return {
      success: true,
      data: { deleted }
    };
  }

  private async handleAddStep(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.chainId || typeof params.chainId !== 'string') {
      return { success: false, error: 'Chain ID is required' };
    }
    if (!params?.type || typeof params.type !== 'string') {
      return { success: false, error: 'Step type is required' };
    }
    if (!params?.name || typeof params.name !== 'string') {
      return { success: false, error: 'Step name is required' };
    }

    const chainId = params.chainId as string;
    const type = params.type as TaskStep['type'];
    const name = params.name as string;
    const config = params.config as Record<string, unknown> | undefined;

    const step = await this.taskChainManager.addStep(chainId, type, name, config);
    return {
      success: true,
      data: { step }
    };
  }

  private async handleUpdateStep(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.chainId || typeof params.chainId !== 'string') {
      return { success: false, error: 'Chain ID is required' };
    }
    if (!params?.stepId || typeof params.stepId !== 'string') {
      return { success: false, error: 'Step ID is required' };
    }
    if (!params?.updates || typeof params.updates !== 'object') {
      return { success: false, error: 'Updates object is required' };
    }

    const chainId = params.chainId as string;
    const stepId = params.stepId as string;
    const updates = params.updates as Record<string, unknown>;

    const step = await this.taskChainManager.updateStep(chainId, stepId, updates);
    return {
      success: true,
      data: { step }
    };
  }

  private async handleRemoveStep(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.chainId || typeof params.chainId !== 'string') {
      return { success: false, error: 'Chain ID is required' };
    }
    if (!params?.stepId || typeof params.stepId !== 'string') {
      return { success: false, error: 'Step ID is required' };
    }

    const removed = await this.taskChainManager.removeStep(
      params.chainId as string,
      params.stepId as string
    );
    return {
      success: true,
      data: { removed }
    };
  }

  private async handleReorderSteps(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.chainId || typeof params.chainId !== 'string') {
      return { success: false, error: 'Chain ID is required' };
    }
    if (!params?.stepIds || !Array.isArray(params.stepIds)) {
      return { success: false, error: 'Step IDs array is required' };
    }

    const reordered = await this.taskChainManager.reorderSteps(
      params.chainId as string,
      params.stepIds as string[]
    );
    return {
      success: true,
      data: { reordered }
    };
  }

  private async handleExecuteChain(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.chainId || typeof params.chainId !== 'string') {
      return { success: false, error: 'Chain ID is required' };
    }

    const chainId = params.chainId as string;
    const initialInput = params.initialInput;

    const result = await this.taskChainManager.executeChain(chainId, initialInput);
    return {
      success: true,
      data: { result }
    };
  }

  private async handleGetAvailableTools(): Promise<RouterResponse> {
    const tools = this.taskChainManager.getAvailableTools();
    return {
      success: true,
      data: { tools }
    };
  }

  // Learning mode handlers
  private async handleGetLearningEnabled(): Promise<RouterResponse> {
    const enabled = this.learning.isEnabled();
    return {
      success: true,
      data: { enabled }
    };
  }

  private async handleSetLearningEnabled(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (params?.enabled === undefined || typeof params.enabled !== 'boolean') {
      return { success: false, error: 'Boolean enabled parameter is required' };
    }

    await this.learning.setEnabled(params.enabled as boolean);
    return {
      success: true,
      data: { enabled: params.enabled }
    };
  }

  private async handleGetSuggestions(params?: Record<string, unknown>): Promise<RouterResponse> {
    const limit = (params?.limit as number) || 5;
    const suggestions = await this.learning.generateSuggestions(limit);
    return {
      success: true,
      data: { suggestions }
    };
  }

  private async handleGetLearningStatistics(): Promise<RouterResponse> {
    const statistics = await this.learning.getStatistics();
    return {
      success: true,
      data: { statistics }
    };
  }

  private async handleGetLearningData(): Promise<RouterResponse> {
    const data = await this.learning.getLearningData();
    return {
      success: true,
      data
    };
  }

  private async handleResetLearning(): Promise<RouterResponse> {
    await this.learning.reset();
    return {
      success: true,
      data: { message: 'Learning data has been reset' }
    };
  }

  private async handleProcessDocument(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.imageData || !params?.filename) {
      return { success: false, error: 'Image data and filename are required' };
    }

    const document = await this.scanner.processDocument(
      params.imageData as string,
      params.filename as string,
      params.fileType as string | undefined,
      params.fileSize as number | undefined
    );

    // Save to memory
    await this.memory.saveScannedDocument(document);

    return {
      success: true,
      data: { document }
    };
  }

  private async handleListScannedDocuments(): Promise<RouterResponse> {
    const documents = await this.memory.listScannedDocuments();
    return {
      success: true,
      data: { documents }
    };
  }

  private async handleGetScannedDocument(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.documentId || typeof params.documentId !== 'string') {
      return { success: false, error: 'Document ID is required' };
    }

    const document = await this.memory.getScannedDocument(params.documentId as string);
    if (!document) {
      return { success: false, error: 'Document not found' };
    }

    return {
      success: true,
      data: { document }
    };
  }

  private async handleSearchScannedDocuments(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.query || typeof params.query !== 'string') {
      return { success: false, error: 'Query is required' };
    }

    const allDocuments = await this.memory.listScannedDocuments();
    const results = this.scanner.searchDocuments(
      allDocuments,
      params.query as string,
      params.filterType as 'name' | 'date' | 'number' | 'keyword' | undefined
    );

    return {
      success: true,
      data: { results }
    };
  }

  private async handleDeleteScannedDocument(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.documentId || typeof params.documentId !== 'string') {
      return { success: false, error: 'Document ID is required' };
    }

    const deleted = await this.memory.deleteScannedDocument(params.documentId as string);

    return {
      success: true,
      data: { deleted }
    };
  }

  private async handleLinkDocumentToConversation(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.documentId || !params?.conversationId) {
      return { success: false, error: 'Document ID and Conversation ID are required' };
    }

    const linked = await this.memory.linkScannedDocumentToConversation(
      params.documentId as string,
      params.conversationId as string
    );

    return {
      success: true,
      data: { linked }
    };
  }

  private async handleSuggestRelatedDocuments(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.documentId || typeof params.documentId !== 'string') {
      return { success: false, error: 'Document ID is required' };
    }

    const limit = (params.limit as number) || 5;
    const allDocuments = await this.memory.listScannedDocuments();
    const relatedDocuments = this.scanner.suggestRelatedDocuments(
      allDocuments,
      params.documentId as string,
      limit
    );

    return {
      success: true,
      data: { relatedDocuments }
    };
  }
}

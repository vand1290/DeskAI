import { MemoryManager } from './memory.js';
import { Agent } from './agent.js';
import { LearningManager } from './learning.js';

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
 * Provides a simple API for interacting with the memory system and agent
 */
export class Router {
  private memory: MemoryManager;
  private agent: Agent;
  private learning: LearningManager;

  constructor(memory: MemoryManager, agent: Agent, learning: LearningManager) {
    this.memory = memory;
    this.agent = agent;
    this.learning = learning;
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
        
        // Learning mode endpoints
        case 'getLearningEnabled':
          return await this.handleGetLearningEnabled();
        
        case 'setLearningEnabled':
          return await this.handleSetLearningEnabled(request.params);
        
        case 'getSuggestions':
          return await this.handleGetSuggestions(request.params);
        
        case 'getLearningStatistics':
          return await this.handleGetLearningStatistics();
        
        case 'getLearningData':
          return await this.handleGetLearningData();
        
        case 'resetLearning':
          return await this.handleResetLearning();
        
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

  private async handleStartConversation(params?: Record<string, unknown>): Promise<RouterResponse> {
    const title = params?.title as string | undefined;
    const tags = params?.tags as string[] | undefined;
    
    const conversationId = await this.agent.startConversation(title, tags);
    return {
      success: true,
      data: { conversationId }
    };
  }

  private async handleContinueConversation(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.conversationId || typeof params.conversationId !== 'string') {
      return { success: false, error: 'Conversation ID is required' };
    }

    const success = await this.agent.continueConversation(params.conversationId as string);
    if (!success) {
      return { success: false, error: 'Conversation not found' };
    }

    const history = await this.agent.getConversationHistory();
    return {
      success: true,
      data: { history }
    };
  }

  private async handleListConversations(): Promise<RouterResponse> {
    const conversations = await this.memory.listConversations();
    return {
      success: true,
      data: { conversations }
    };
  }

  private async handleGetConversation(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.conversationId || typeof params.conversationId !== 'string') {
      return { success: false, error: 'Conversation ID is required' };
    }

    const conversation = await this.memory.getConversation(params.conversationId as string);
    if (!conversation) {
      return { success: false, error: 'Conversation not found' };
    }

    return {
      success: true,
      data: { conversation }
    };
  }

  private async handleSearchConversations(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.query || typeof params.query !== 'string') {
      return { success: false, error: 'Query is required' };
    }

    const results = await this.memory.searchConversations(params.query as string);
    return {
      success: true,
      data: { results }
    };
  }

  private async handleDeleteConversation(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.conversationId || typeof params.conversationId !== 'string') {
      return { success: false, error: 'Conversation ID is required' };
    }

    const deleted = await this.memory.deleteConversation(params.conversationId as string);
    return {
      success: true,
      data: { deleted }
    };
  }

  private async handleExportConversations(): Promise<RouterResponse> {
    const conversations = await this.memory.exportConversations();
    return {
      success: true,
      data: { conversations }
    };
  }

  private async handleGetAnalytics(): Promise<RouterResponse> {
    const analytics = await this.memory.getAnalytics();
    return {
      success: true,
      data: { analytics }
    };
  }

  private async handleFilterByTags(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.tags || !Array.isArray(params.tags)) {
      return { success: false, error: 'Tags array is required' };
    }

    const conversations = await this.memory.filterByTags(params.tags as string[]);
    return {
      success: true,
      data: { conversations }
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
}

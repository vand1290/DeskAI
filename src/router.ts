import { MemoryManager } from './memory.js';
import { Agent } from './agent.js';
import { TaskChainManager, TaskStep } from './taskChain.js';

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
  private taskChainManager: TaskChainManager;

  constructor(memory: MemoryManager, agent: Agent, taskChainManager: TaskChainManager) {
    this.memory = memory;
    this.agent = agent;
    this.taskChainManager = taskChainManager;
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
        
        // Task chain operations
        case 'createChain':
          return await this.handleCreateChain(request.params);
        
        case 'getChain':
          return await this.handleGetChain(request.params);
        
        case 'listChains':
          return await this.handleListChains(request.params);
        
        case 'deleteChain':
          return await this.handleDeleteChain(request.params);
        
        case 'addStep':
          return await this.handleAddStep(request.params);
        
        case 'updateStep':
          return await this.handleUpdateStep(request.params);
        
        case 'removeStep':
          return await this.handleRemoveStep(request.params);
        
        case 'reorderSteps':
          return await this.handleReorderSteps(request.params);
        
        case 'executeChain':
          return await this.handleExecuteChain(request.params);
        
        case 'getAvailableTools':
          return await this.handleGetAvailableTools();
        
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
}

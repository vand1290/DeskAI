import { MemoryManager } from './memory.js';
import { Agent } from './agent.js';
import { ScanProcessor } from './scan-processor.js';

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
 * Provides a simple API for interacting with the memory system, agent, and scan processor
 */
export class Router {
  private memory: MemoryManager;
  private agent: Agent;
  private scanProcessor: ScanProcessor;

  constructor(memory: MemoryManager, agent: Agent, scanProcessor: ScanProcessor) {
    this.memory = memory;
    this.agent = agent;
    this.scanProcessor = scanProcessor;
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
        
        case 'processScan':
          return await this.handleProcessScan(request.params);
        
        case 'listScans':
          return await this.handleListScans();
        
        case 'getScan':
          return await this.handleGetScan(request.params);
        
        case 'searchScans':
          return await this.handleSearchScans(request.params);
        
        case 'deleteScan':
          return await this.handleDeleteScan(request.params);
        
        case 'linkScanToConversation':
          return await this.handleLinkScanToConversation(request.params);
        
        case 'getSuggestedConversations':
          return await this.handleGetSuggestedConversations(request.params);
        
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

  private async handleProcessScan(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.filePath || typeof params.filePath !== 'string') {
      return { success: false, error: 'File path is required' };
    }
    if (!params?.filename || typeof params.filename !== 'string') {
      return { success: false, error: 'Filename is required' };
    }

    try {
      const scanDocument = await this.scanProcessor.processScan(
        params.filePath as string,
        params.filename as string
      );
      await this.memory.addScan(scanDocument);
      
      // Get suggested conversations
      const suggestions = await this.memory.getSuggestedConversations(scanDocument.id);

      return {
        success: true,
        data: { 
          scan: scanDocument,
          suggestedConversations: suggestions
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process scan'
      };
    }
  }

  private async handleListScans(): Promise<RouterResponse> {
    const scans = await this.memory.listScans();
    return {
      success: true,
      data: { scans }
    };
  }

  private async handleGetScan(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.scanId || typeof params.scanId !== 'string') {
      return { success: false, error: 'Scan ID is required' };
    }

    const scan = await this.memory.getScan(params.scanId as string);
    if (!scan) {
      return { success: false, error: 'Scan not found' };
    }

    return {
      success: true,
      data: { scan }
    };
  }

  private async handleSearchScans(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.query || typeof params.query !== 'string') {
      return { success: false, error: 'Query is required' };
    }

    const results = await this.memory.searchScans(params.query as string);
    return {
      success: true,
      data: { results }
    };
  }

  private async handleDeleteScan(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.scanId || typeof params.scanId !== 'string') {
      return { success: false, error: 'Scan ID is required' };
    }

    const scan = await this.memory.getScan(params.scanId as string);
    if (scan) {
      await this.scanProcessor.deleteScan(scan.id, scan.filename);
    }

    const deleted = await this.memory.deleteScan(params.scanId as string);
    return {
      success: true,
      data: { deleted }
    };
  }

  private async handleLinkScanToConversation(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.scanId || typeof params.scanId !== 'string') {
      return { success: false, error: 'Scan ID is required' };
    }
    if (!params?.conversationId || typeof params.conversationId !== 'string') {
      return { success: false, error: 'Conversation ID is required' };
    }

    const linked = await this.memory.linkScanToConversation(
      params.scanId as string,
      params.conversationId as string
    );

    if (!linked) {
      return { success: false, error: 'Failed to link scan to conversation' };
    }

    return {
      success: true,
      data: { linked }
    };
  }

  private async handleGetSuggestedConversations(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.scanId || typeof params.scanId !== 'string') {
      return { success: false, error: 'Scan ID is required' };
    }

    const limit = typeof params?.limit === 'number' ? params.limit : 5;
    const suggestions = await this.memory.getSuggestedConversations(
      params.scanId as string,
      limit
    );

    return {
      success: true,
      data: { suggestions }
    };
  }
}

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
 * Provides a simple API for interacting with the memory system and agent
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

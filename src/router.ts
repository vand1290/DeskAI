import { MemoryManager } from './memory.js';
import { Agent } from './agent.js';
import { 
  WritingTool, 
  PhotoTool, 
  DocumentTool, 
  HandwritingTool, 
  FileSorter,
  SortCriteria 
} from './tools.js';

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
  private writingTool: WritingTool;
  private photoTool: PhotoTool;
  private documentTool: DocumentTool;
  private handwritingTool: HandwritingTool;
  private fileSorter: FileSorter;

  constructor(memory: MemoryManager, agent: Agent, dataDir: string = './out') {
    this.memory = memory;
    this.agent = agent;
    this.writingTool = new WritingTool(`${dataDir}/documents`);
    this.photoTool = new PhotoTool(`${dataDir}/photos`);
    this.documentTool = new DocumentTool(`${dataDir}/documents`);
    this.handwritingTool = new HandwritingTool();
    this.fileSorter = new FileSorter();
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
        
        // Writing tool actions
        case 'createDocument':
          return await this.handleCreateDocument(request.params);
        
        case 'editDocument':
          return await this.handleEditDocument(request.params);
        
        case 'readDocument':
          return await this.handleReadDocument(request.params);
        
        case 'listDocuments':
          return await this.handleListDocuments();
        
        case 'deleteDocument':
          return await this.handleDeleteDocument(request.params);
        
        // Photo tool actions
        case 'getImageInfo':
          return await this.handleGetImageInfo(request.params);
        
        case 'extractTextFromImage':
          return await this.handleExtractTextFromImage(request.params);
        
        case 'listImages':
          return await this.handleListImages();
        
        // Document tool actions
        case 'summarizeDocument':
          return await this.handleSummarizeDocument(request.params);
        
        case 'extractData':
          return await this.handleExtractData(request.params);
        
        case 'getDocumentInfo':
          return await this.handleGetDocumentInfo(request.params);
        
        // Handwriting tool actions
        case 'extractHandwriting':
          return await this.handleExtractHandwriting(request.params);
        
        // File sorting actions
        case 'sortFiles':
          return await this.handleSortFiles(request.params);
        
        case 'organizeByDate':
          return await this.handleOrganizeByDate(request.params);
        
        case 'organizeByType':
          return await this.handleOrganizeByType(request.params);
        
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

  // Writing tool handlers
  private async handleCreateDocument(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.filename || typeof params.filename !== 'string') {
      return { success: false, error: 'Filename is required' };
    }
    if (!params?.content || typeof params.content !== 'string') {
      return { success: false, error: 'Content is required' };
    }

    const result = await this.writingTool.createDocument(
      params.filename as string,
      params.content as string
    );
    return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
  }

  private async handleEditDocument(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.filename || typeof params.filename !== 'string') {
      return { success: false, error: 'Filename is required' };
    }
    if (!params?.content || typeof params.content !== 'string') {
      return { success: false, error: 'Content is required' };
    }

    const result = await this.writingTool.editDocument(
      params.filename as string,
      params.content as string
    );
    return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
  }

  private async handleReadDocument(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.filename || typeof params.filename !== 'string') {
      return { success: false, error: 'Filename is required' };
    }

    const result = await this.writingTool.readDocument(params.filename as string);
    return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
  }

  private async handleListDocuments(): Promise<RouterResponse> {
    const result = await this.writingTool.listDocuments();
    return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
  }

  private async handleDeleteDocument(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.filename || typeof params.filename !== 'string') {
      return { success: false, error: 'Filename is required' };
    }

    const result = await this.writingTool.deleteDocument(params.filename as string);
    return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
  }

  // Photo tool handlers
  private async handleGetImageInfo(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.filename || typeof params.filename !== 'string') {
      return { success: false, error: 'Filename is required' };
    }

    const result = await this.photoTool.getImageInfo(params.filename as string);
    return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
  }

  private async handleExtractTextFromImage(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.filename || typeof params.filename !== 'string') {
      return { success: false, error: 'Filename is required' };
    }

    const result = await this.photoTool.extractText(params.filename as string);
    return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
  }

  private async handleListImages(): Promise<RouterResponse> {
    const result = await this.photoTool.listImages();
    return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
  }

  // Document tool handlers
  private async handleSummarizeDocument(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.filename || typeof params.filename !== 'string') {
      return { success: false, error: 'Filename is required' };
    }

    const result = await this.documentTool.summarizeDocument(params.filename as string);
    return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
  }

  private async handleExtractData(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.filename || typeof params.filename !== 'string') {
      return { success: false, error: 'Filename is required' };
    }

    const pattern = params?.pattern as string | undefined;
    const result = await this.documentTool.extractData(params.filename as string, pattern);
    return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
  }

  private async handleGetDocumentInfo(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.filename || typeof params.filename !== 'string') {
      return { success: false, error: 'Filename is required' };
    }

    const result = await this.documentTool.getDocumentInfo(params.filename as string);
    return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
  }

  // Handwriting tool handlers
  private async handleExtractHandwriting(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.filename || typeof params.filename !== 'string') {
      return { success: false, error: 'Filename is required' };
    }

    const result = await this.handwritingTool.extractHandwriting(params.filename as string);
    return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
  }

  // File sorting handlers
  private async handleSortFiles(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.directory || typeof params.directory !== 'string') {
      return { success: false, error: 'Directory is required' };
    }
    if (!params?.criteria || typeof params.criteria !== 'object') {
      return { success: false, error: 'Sort criteria is required' };
    }

    const result = await this.fileSorter.sortFiles(
      params.directory as string,
      params.criteria as SortCriteria
    );
    return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
  }

  private async handleOrganizeByDate(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.directory || typeof params.directory !== 'string') {
      return { success: false, error: 'Directory is required' };
    }

    const result = await this.fileSorter.organizeByDate(params.directory as string);
    return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
  }

  private async handleOrganizeByType(params?: Record<string, unknown>): Promise<RouterResponse> {
    if (!params?.directory || typeof params.directory !== 'string') {
      return { success: false, error: 'Directory is required' };
    }

    const result = await this.fileSorter.organizeByType(params.directory as string);
    return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
  }
}

import { WritingTool, PhotoTool, DocumentTool, HandwritingTool, FileSorter } from './tools.js';
/**
 * Router handles routing of requests to appropriate handlers
 * Provides a simple API for interacting with the memory system and agent
 */
export class Router {
    constructor(memory, agent, dataDir = './out') {
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
    async handleRequest(request) {
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    async handleMessage(params) {
        if (!params?.message || typeof params.message !== 'string') {
            return { success: false, error: 'Message is required' };
        }
        const response = await this.agent.processMessage(params.message);
        return {
            success: true,
            data: {
                response: response.content,
                conversationId: this.agent.getCurrentConversationId(),
                metadata: response.metadata
            }
        };
    }
    async handleStartConversation(params) {
        const title = params?.title;
        const tags = params?.tags;
        const conversationId = await this.agent.startConversation(title, tags);
        return {
            success: true,
            data: { conversationId }
        };
    }
    async handleContinueConversation(params) {
        if (!params?.conversationId || typeof params.conversationId !== 'string') {
            return { success: false, error: 'Conversation ID is required' };
        }
        const success = await this.agent.continueConversation(params.conversationId);
        if (!success) {
            return { success: false, error: 'Conversation not found' };
        }
        const history = await this.agent.getConversationHistory();
        return {
            success: true,
            data: { history }
        };
    }
    async handleListConversations() {
        const conversations = await this.memory.listConversations();
        return {
            success: true,
            data: { conversations }
        };
    }
    async handleGetConversation(params) {
        if (!params?.conversationId || typeof params.conversationId !== 'string') {
            return { success: false, error: 'Conversation ID is required' };
        }
        const conversation = await this.memory.getConversation(params.conversationId);
        if (!conversation) {
            return { success: false, error: 'Conversation not found' };
        }
        return {
            success: true,
            data: { conversation }
        };
    }
    async handleSearchConversations(params) {
        if (!params?.query || typeof params.query !== 'string') {
            return { success: false, error: 'Query is required' };
        }
        const results = await this.memory.searchConversations(params.query);
        return {
            success: true,
            data: { results }
        };
    }
    async handleDeleteConversation(params) {
        if (!params?.conversationId || typeof params.conversationId !== 'string') {
            return { success: false, error: 'Conversation ID is required' };
        }
        const deleted = await this.memory.deleteConversation(params.conversationId);
        return {
            success: true,
            data: { deleted }
        };
    }
    async handleExportConversations() {
        const conversations = await this.memory.exportConversations();
        return {
            success: true,
            data: { conversations }
        };
    }
    async handleGetAnalytics() {
        const analytics = await this.memory.getAnalytics();
        return {
            success: true,
            data: { analytics }
        };
    }
    async handleFilterByTags(params) {
        if (!params?.tags || !Array.isArray(params.tags)) {
            return { success: false, error: 'Tags array is required' };
        }
        const conversations = await this.memory.filterByTags(params.tags);
        return {
            success: true,
            data: { conversations }
        };
    }
    // Writing tool handlers
    async handleCreateDocument(params) {
        if (!params?.filename || typeof params.filename !== 'string') {
            return { success: false, error: 'Filename is required' };
        }
        if (!params?.content || typeof params.content !== 'string') {
            return { success: false, error: 'Content is required' };
        }
        const result = await this.writingTool.createDocument(params.filename, params.content);
        return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
    }
    async handleEditDocument(params) {
        if (!params?.filename || typeof params.filename !== 'string') {
            return { success: false, error: 'Filename is required' };
        }
        if (!params?.content || typeof params.content !== 'string') {
            return { success: false, error: 'Content is required' };
        }
        const result = await this.writingTool.editDocument(params.filename, params.content);
        return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
    }
    async handleReadDocument(params) {
        if (!params?.filename || typeof params.filename !== 'string') {
            return { success: false, error: 'Filename is required' };
        }
        const result = await this.writingTool.readDocument(params.filename);
        return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
    }
    async handleListDocuments() {
        const result = await this.writingTool.listDocuments();
        return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
    }
    async handleDeleteDocument(params) {
        if (!params?.filename || typeof params.filename !== 'string') {
            return { success: false, error: 'Filename is required' };
        }
        const result = await this.writingTool.deleteDocument(params.filename);
        return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
    }
    // Photo tool handlers
    async handleGetImageInfo(params) {
        if (!params?.filename || typeof params.filename !== 'string') {
            return { success: false, error: 'Filename is required' };
        }
        const result = await this.photoTool.getImageInfo(params.filename);
        return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
    }
    async handleExtractTextFromImage(params) {
        if (!params?.filename || typeof params.filename !== 'string') {
            return { success: false, error: 'Filename is required' };
        }
        const result = await this.photoTool.extractText(params.filename);
        return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
    }
    async handleListImages() {
        const result = await this.photoTool.listImages();
        return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
    }
    // Document tool handlers
    async handleSummarizeDocument(params) {
        if (!params?.filename || typeof params.filename !== 'string') {
            return { success: false, error: 'Filename is required' };
        }
        const result = await this.documentTool.summarizeDocument(params.filename);
        return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
    }
    async handleExtractData(params) {
        if (!params?.filename || typeof params.filename !== 'string') {
            return { success: false, error: 'Filename is required' };
        }
        const pattern = params?.pattern;
        const result = await this.documentTool.extractData(params.filename, pattern);
        return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
    }
    async handleGetDocumentInfo(params) {
        if (!params?.filename || typeof params.filename !== 'string') {
            return { success: false, error: 'Filename is required' };
        }
        const result = await this.documentTool.getDocumentInfo(params.filename);
        return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
    }
    // Handwriting tool handlers
    async handleExtractHandwriting(params) {
        if (!params?.filename || typeof params.filename !== 'string') {
            return { success: false, error: 'Filename is required' };
        }
        const result = await this.handwritingTool.extractHandwriting(params.filename);
        return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
    }
    // File sorting handlers
    async handleSortFiles(params) {
        if (!params?.directory || typeof params.directory !== 'string') {
            return { success: false, error: 'Directory is required' };
        }
        if (!params?.criteria || typeof params.criteria !== 'object') {
            return { success: false, error: 'Sort criteria is required' };
        }
        const result = await this.fileSorter.sortFiles(params.directory, params.criteria);
        return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
    }
    async handleOrganizeByDate(params) {
        if (!params?.directory || typeof params.directory !== 'string') {
            return { success: false, error: 'Directory is required' };
        }
        const result = await this.fileSorter.organizeByDate(params.directory);
        return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
    }
    async handleOrganizeByType(params) {
        if (!params?.directory || typeof params.directory !== 'string') {
            return { success: false, error: 'Directory is required' };
        }
        const result = await this.fileSorter.organizeByType(params.directory);
        return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
    }
}

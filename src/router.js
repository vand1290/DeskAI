/**
 * Router handles routing of requests to appropriate handlers
 * Provides a simple API for interacting with the memory system, agent, and scan processor
 */
export class Router {
    constructor(memory, agent, scanProcessor) {
        this.memory = memory;
        this.agent = agent;
        this.scanProcessor = scanProcessor;
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
    async handleProcessScan(params) {
        if (!params?.filePath || typeof params.filePath !== 'string') {
            return { success: false, error: 'File path is required' };
        }
        if (!params?.filename || typeof params.filename !== 'string') {
            return { success: false, error: 'Filename is required' };
        }
        try {
            const scanDocument = await this.scanProcessor.processScan(params.filePath, params.filename);
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
        }
        catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to process scan'
            };
        }
    }
    async handleListScans() {
        const scans = await this.memory.listScans();
        return {
            success: true,
            data: { scans }
        };
    }
    async handleGetScan(params) {
        if (!params?.scanId || typeof params.scanId !== 'string') {
            return { success: false, error: 'Scan ID is required' };
        }
        const scan = await this.memory.getScan(params.scanId);
        if (!scan) {
            return { success: false, error: 'Scan not found' };
        }
        return {
            success: true,
            data: { scan }
        };
    }
    async handleSearchScans(params) {
        if (!params?.query || typeof params.query !== 'string') {
            return { success: false, error: 'Query is required' };
        }
        const results = await this.memory.searchScans(params.query);
        return {
            success: true,
            data: { results }
        };
    }
    async handleDeleteScan(params) {
        if (!params?.scanId || typeof params.scanId !== 'string') {
            return { success: false, error: 'Scan ID is required' };
        }
        const scan = await this.memory.getScan(params.scanId);
        if (scan) {
            await this.scanProcessor.deleteScan(scan.id, scan.filename);
        }
        const deleted = await this.memory.deleteScan(params.scanId);
        return {
            success: true,
            data: { deleted }
        };
    }
    async handleLinkScanToConversation(params) {
        if (!params?.scanId || typeof params.scanId !== 'string') {
            return { success: false, error: 'Scan ID is required' };
        }
        if (!params?.conversationId || typeof params.conversationId !== 'string') {
            return { success: false, error: 'Conversation ID is required' };
        }
        const linked = await this.memory.linkScanToConversation(params.scanId, params.conversationId);
        if (!linked) {
            return { success: false, error: 'Failed to link scan to conversation' };
        }
        return {
            success: true,
            data: { linked }
        };
    }
    async handleGetSuggestedConversations(params) {
        if (!params?.scanId || typeof params.scanId !== 'string') {
            return { success: false, error: 'Scan ID is required' };
        }
        const limit = typeof params?.limit === 'number' ? params.limit : 5;
        const suggestions = await this.memory.getSuggestedConversations(params.scanId, limit);
        return {
            success: true,
            data: { suggestions }
        };
    }
}

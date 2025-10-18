/**
 * Router handles routing of requests to appropriate handlers
 * Provides a simple API for interacting with the memory system, agent, and task chains
 */
export class Router {
    constructor(memory, agent, taskChainManager) {
        this.memory = memory;
        this.agent = agent;
        this.taskChainManager = taskChainManager;
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
    // Task chain handlers
    async handleCreateChain(params) {
        if (!params?.name || typeof params.name !== 'string') {
            return { success: false, error: 'Chain name is required' };
        }
        const name = params.name;
        const description = params.description;
        const tags = params.tags;
        const chain = await this.taskChainManager.createChain(name, description, tags);
        return {
            success: true,
            data: { chain }
        };
    }
    async handleGetChain(params) {
        if (!params?.chainId || typeof params.chainId !== 'string') {
            return { success: false, error: 'Chain ID is required' };
        }
        const chain = await this.taskChainManager.getChain(params.chainId);
        if (!chain) {
            return { success: false, error: 'Chain not found' };
        }
        return {
            success: true,
            data: { chain }
        };
    }
    async handleListChains(params) {
        const tags = params?.tags;
        const chains = await this.taskChainManager.listChains(tags);
        return {
            success: true,
            data: { chains }
        };
    }
    async handleDeleteChain(params) {
        if (!params?.chainId || typeof params.chainId !== 'string') {
            return { success: false, error: 'Chain ID is required' };
        }
        const deleted = await this.taskChainManager.deleteChain(params.chainId);
        return {
            success: true,
            data: { deleted }
        };
    }
    async handleAddStep(params) {
        if (!params?.chainId || typeof params.chainId !== 'string') {
            return { success: false, error: 'Chain ID is required' };
        }
        if (!params?.type || typeof params.type !== 'string') {
            return { success: false, error: 'Step type is required' };
        }
        if (!params?.name || typeof params.name !== 'string') {
            return { success: false, error: 'Step name is required' };
        }
        const chainId = params.chainId;
        const type = params.type;
        const name = params.name;
        const config = params.config;
        const step = await this.taskChainManager.addStep(chainId, type, name, config);
        return {
            success: true,
            data: { step }
        };
    }
    async handleUpdateStep(params) {
        if (!params?.chainId || typeof params.chainId !== 'string') {
            return { success: false, error: 'Chain ID is required' };
        }
        if (!params?.stepId || typeof params.stepId !== 'string') {
            return { success: false, error: 'Step ID is required' };
        }
        if (!params?.updates || typeof params.updates !== 'object') {
            return { success: false, error: 'Updates object is required' };
        }
        const chainId = params.chainId;
        const stepId = params.stepId;
        const updates = params.updates;
        const step = await this.taskChainManager.updateStep(chainId, stepId, updates);
        return {
            success: true,
            data: { step }
        };
    }
    async handleRemoveStep(params) {
        if (!params?.chainId || typeof params.chainId !== 'string') {
            return { success: false, error: 'Chain ID is required' };
        }
        if (!params?.stepId || typeof params.stepId !== 'string') {
            return { success: false, error: 'Step ID is required' };
        }
        const removed = await this.taskChainManager.removeStep(params.chainId, params.stepId);
        return {
            success: true,
            data: { removed }
        };
    }
    async handleReorderSteps(params) {
        if (!params?.chainId || typeof params.chainId !== 'string') {
            return { success: false, error: 'Chain ID is required' };
        }
        if (!params?.stepIds || !Array.isArray(params.stepIds)) {
            return { success: false, error: 'Step IDs array is required' };
        }
        const reordered = await this.taskChainManager.reorderSteps(params.chainId, params.stepIds);
        return {
            success: true,
            data: { reordered }
        };
    }
    async handleExecuteChain(params) {
        if (!params?.chainId || typeof params.chainId !== 'string') {
            return { success: false, error: 'Chain ID is required' };
        }
        const chainId = params.chainId;
        const initialInput = params.initialInput;
        const result = await this.taskChainManager.executeChain(chainId, initialInput);
        return {
            success: true,
            data: { result }
        };
    }
    async handleGetAvailableTools() {
        const tools = this.taskChainManager.getAvailableTools();
        return {
            success: true,
            data: { tools }
        };
    }
}

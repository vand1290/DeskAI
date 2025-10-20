/**
 * Agent handles user interactions and integrates with the memory system
 * Maintains conversation context and logs all interactions
 */
export class Agent {
    constructor(memory, config = { memoryEnabled: true }) {
        this.currentConversationId = null;
        this.memory = memory;
        this.config = config;
    }
    /**
     * Start a new conversation
     */
    async startConversation(title, tags) {
        const conversationTitle = title || `Conversation ${new Date().toLocaleString()}`;
        const conversation = await this.memory.createConversation(conversationTitle, tags);
        this.currentConversationId = conversation.id;
        return conversation.id;
    }
    /**
     * Continue an existing conversation
     */
    async continueConversation(conversationId) {
        const conversation = await this.memory.getConversation(conversationId);
        if (!conversation) {
            return false;
        }
        this.currentConversationId = conversationId;
        return true;
    }
    /**
     * Process a user message and generate a response
     */
    async processMessage(userMessage) {
        // Ensure we have an active conversation only if memory is enabled
        if (this.config.memoryEnabled && !this.currentConversationId) {
            await this.startConversation();
        }
        // Log the user message if memory is enabled
        if (this.config.memoryEnabled && this.currentConversationId) {
            await this.memory.addMessage(this.currentConversationId, 'user', userMessage);
        }
        // Generate response (this is a placeholder - in a real implementation,
        // this would integrate with an AI model or rule-based system)
        const response = await this.generateResponse(userMessage);
        // Log the agent response if memory is enabled
        if (this.config.memoryEnabled && this.currentConversationId) {
            await this.memory.addMessage(this.currentConversationId, 'agent', response.content);
        }
        return response;
    }
    /**
     * Generate a response based on user input
     * This is a simple implementation - can be extended with AI models
     */
    async generateResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        // Check for more specific patterns first before greetings
        if (lowerMessage.includes('history') || lowerMessage.includes('past conversations')) {
            const summaries = await this.memory.listConversations();
            const recentConvs = summaries.slice(0, 5).map(s => `- ${s.title} (${s.messageCount} messages, ${new Date(s.updatedAt).toLocaleDateString()})`).join('\n');
            return {
                content: `Here are your recent conversations:\n\n${recentConvs}`,
                metadata: { type: 'history' }
            };
        }
        if (lowerMessage.includes('analytics') || lowerMessage.includes('stats')) {
            const analytics = await this.memory.getAnalytics();
            const topicsStr = analytics.frequentTopics
                .map(t => `- ${t.topic} (${t.count} times)`)
                .join('\n');
            return {
                content: `Here are your conversation analytics:\n\n` +
                    `Total conversations: ${analytics.totalConversations}\n` +
                    `Total messages: ${analytics.totalMessages}\n` +
                    `Average messages per conversation: ${analytics.averageMessagesPerConversation.toFixed(1)}\n\n` +
                    `Frequent topics:\n${topicsStr || 'No topics tagged yet'}`,
                metadata: { type: 'analytics', data: analytics }
            };
        }
        // Simple rule-based responses for demo
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return {
                content: 'Hello! How can I help you today?',
                metadata: { type: 'greeting' }
            };
        }
        if (lowerMessage.includes('help')) {
            return {
                content: 'I can help you with various tasks. You can:\n' +
                    '- Ask me questions\n' +
                    '- Browse past conversations\n' +
                    '- Search through conversation history\n' +
                    '- View analytics about your interactions\n\n' +
                    'What would you like to do?',
                metadata: { type: 'help' }
            };
        }
        // Default response with context awareness
        const conversation = this.currentConversationId
            ? await this.memory.getConversation(this.currentConversationId)
            : null;
        const contextHint = conversation && conversation.messages.length > 2
            ? ' I remember our previous discussion in this conversation.'
            : '';
        return {
            content: `I understand you said: "${userMessage}".${contextHint} ` +
                `This is a demonstration response. In a full implementation, ` +
                `this would integrate with an AI model for intelligent responses.`,
            metadata: { type: 'default' }
        };
    }
    /**
     * Get the current conversation ID
     */
    getCurrentConversationId() {
        return this.currentConversationId;
    }
    /**
     * Get conversation history for context
     */
    async getConversationHistory() {
        if (!this.currentConversationId) {
            return [];
        }
        const conversation = await this.memory.getConversation(this.currentConversationId);
        return conversation ? conversation.messages : [];
    }
    /**
     * Search for relevant context from past conversations
     */
    async searchContext(query, limit = 5) {
        const results = await this.memory.searchConversations(query);
        const messages = [];
        for (const result of results.slice(0, limit)) {
            const conversation = await this.memory.getConversation(result.conversationId);
            if (conversation) {
                const message = conversation.messages.find(m => m.id === result.messageId);
                if (message) {
                    messages.push(message);
                }
            }
        }
        return messages;
    }
}

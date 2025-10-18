import * as fs from 'fs';
import * as path from 'path';
/**
 * MemoryManager handles persistent storage and retrieval of conversations and scans
 * All data is stored locally in the out/ directory as JSON
 * No network calls are made - operates completely offline
 */
export class MemoryManager {
    constructor(dataDir = './out') {
        this.initialized = false;
        this.conversationsPath = path.join(dataDir, 'conversations.json');
        this.scansPath = path.join(dataDir, 'scans.json');
        this.conversations = new Map();
        this.scans = new Map();
    }
    /**
     * Initialize the memory manager by loading existing conversations and scans
     */
    async initialize() {
        if (this.initialized)
            return;
        try {
            // Ensure the output directory exists
            const dir = path.dirname(this.conversationsPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            // Load existing conversations if the file exists
            if (fs.existsSync(this.conversationsPath)) {
                const data = fs.readFileSync(this.conversationsPath, 'utf-8');
                const conversationsArray = JSON.parse(data);
                for (const conv of conversationsArray) {
                    this.conversations.set(conv.id, conv);
                }
            }
            // Load existing scans if the file exists
            if (fs.existsSync(this.scansPath)) {
                const data = fs.readFileSync(this.scansPath, 'utf-8');
                const scansArray = JSON.parse(data);
                for (const scan of scansArray) {
                    this.scans.set(scan.id, scan);
                }
            }
            this.initialized = true;
        }
        catch (error) {
            console.error('Failed to initialize memory manager:', error);
            throw error;
        }
    }
    /**
     * Save conversations to disk
     */
    async saveConversations() {
        try {
            const conversationsArray = Array.from(this.conversations.values());
            const data = JSON.stringify(conversationsArray, null, 2);
            fs.writeFileSync(this.conversationsPath, data, 'utf-8');
        }
        catch (error) {
            console.error('Failed to save conversations:', error);
            throw error;
        }
    }
    /**
     * Save scans to disk
     */
    async saveScans() {
        try {
            const scansArray = Array.from(this.scans.values());
            const data = JSON.stringify(scansArray, null, 2);
            fs.writeFileSync(this.scansPath, data, 'utf-8');
        }
        catch (error) {
            console.error('Failed to save scans:', error);
            throw error;
        }
    }
    /**
     * Create a new conversation
     */
    async createConversation(title, tags) {
        const conversation = {
            id: this.generateId(),
            title,
            messages: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            tags: tags || [],
            metadata: {}
        };
        this.conversations.set(conversation.id, conversation);
        await this.saveConversations();
        return conversation;
    }
    /**
     * Add a message to a conversation
     */
    async addMessage(conversationId, role, content) {
        const conversation = this.conversations.get(conversationId);
        if (!conversation) {
            throw new Error(`Conversation ${conversationId} not found`);
        }
        const message = {
            id: this.generateId(),
            role,
            content,
            timestamp: Date.now()
        };
        conversation.messages.push(message);
        conversation.updatedAt = Date.now();
        await this.saveConversations();
        return message;
    }
    /**
     * Get a specific conversation by ID
     */
    async getConversation(conversationId) {
        return this.conversations.get(conversationId) || null;
    }
    /**
     * Get all conversations as summaries (without full message content)
     */
    async listConversations() {
        const summaries = [];
        for (const conv of this.conversations.values()) {
            const lastMessage = conv.messages[conv.messages.length - 1];
            summaries.push({
                id: conv.id,
                title: conv.title,
                messageCount: conv.messages.length,
                lastMessage: lastMessage ? lastMessage.content.substring(0, 100) : '',
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt,
                tags: conv.tags
            });
        }
        // Sort by most recent first
        return summaries.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    /**
     * Search conversations by text query (simple substring search)
     */
    async searchConversations(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        for (const conv of this.conversations.values()) {
            for (const message of conv.messages) {
                if (message.content.toLowerCase().includes(lowerQuery)) {
                    results.push({
                        conversationId: conv.id,
                        messageId: message.id,
                        content: message.content,
                        score: 1.0 // Simple binary match for now
                    });
                }
            }
        }
        return results;
    }
    /**
     * Filter conversations by tags
     */
    async filterByTags(tags) {
        const allSummaries = await this.listConversations();
        return allSummaries.filter(summary => {
            if (!summary.tags || summary.tags.length === 0)
                return false;
            return tags.some(tag => summary.tags.includes(tag));
        });
    }
    /**
     * Delete a conversation
     */
    async deleteConversation(conversationId) {
        const deleted = this.conversations.delete(conversationId);
        if (deleted) {
            await this.saveConversations();
        }
        return deleted;
    }
    /**
     * Export all conversations
     */
    async exportConversations() {
        return Array.from(this.conversations.values());
    }
    /**
     * Get analytics about conversation history
     */
    async getAnalytics() {
        const conversationsArray = Array.from(this.conversations.values());
        // Calculate basic stats
        const totalConversations = conversationsArray.length;
        const totalMessages = conversationsArray.reduce((sum, conv) => sum + conv.messages.length, 0);
        const averageMessagesPerConversation = totalConversations > 0
            ? totalMessages / totalConversations
            : 0;
        // Get most recent conversations
        const mostRecentConversations = (await this.listConversations()).slice(0, 5);
        // Count conversations by day
        const conversationsByDay = {};
        for (const conv of conversationsArray) {
            const date = new Date(conv.createdAt).toISOString().split('T')[0];
            conversationsByDay[date] = (conversationsByDay[date] || 0) + 1;
        }
        // Extract frequent topics from tags
        const topicCounts = {};
        for (const conv of conversationsArray) {
            if (conv.tags) {
                for (const tag of conv.tags) {
                    topicCounts[tag] = (topicCounts[tag] || 0) + 1;
                }
            }
        }
        const frequentTopics = Object.entries(topicCounts)
            .map(([topic, count]) => ({ topic, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
        return {
            totalConversations,
            totalMessages,
            frequentTopics,
            averageMessagesPerConversation,
            mostRecentConversations,
            conversationsByDay
        };
    }
    /**
     * Clear all conversation data (for testing or user request)
     */
    async clearAll() {
        this.conversations.clear();
        await this.saveConversations();
    }
    /**
     * Add a scan document
     */
    async addScan(scanDocument) {
        this.scans.set(scanDocument.id, scanDocument);
        await this.saveScans();
        return scanDocument;
    }
    /**
     * Get a scan document by ID
     */
    async getScan(scanId) {
        return this.scans.get(scanId) || null;
    }
    /**
     * List all scan documents
     */
    async listScans() {
        const scansArray = Array.from(this.scans.values());
        return scansArray.sort((a, b) => b.uploadedAt - a.uploadedAt);
    }
    /**
     * Search scans by query
     */
    async searchScans(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();
        for (const scan of this.scans.values()) {
            const matches = [];
            let score = 0;
            // Search in metadata
            for (const name of scan.metadata.names) {
                if (name.toLowerCase().includes(lowerQuery)) {
                    matches.push({
                        type: 'name',
                        value: name,
                        context: this.getContext(scan.extractedText, name)
                    });
                    score += 2;
                }
            }
            for (const date of scan.metadata.dates) {
                if (date.toLowerCase().includes(lowerQuery)) {
                    matches.push({
                        type: 'date',
                        value: date,
                        context: this.getContext(scan.extractedText, date)
                    });
                    score += 1.5;
                }
            }
            for (const total of scan.metadata.totals) {
                if (total.toLowerCase().includes(lowerQuery)) {
                    matches.push({
                        type: 'total',
                        value: total,
                        context: this.getContext(scan.extractedText, total)
                    });
                    score += 1.5;
                }
            }
            for (const keyword of scan.metadata.keywords) {
                if (keyword.toLowerCase().includes(lowerQuery)) {
                    matches.push({
                        type: 'keyword',
                        value: keyword,
                        context: this.getContext(scan.extractedText, keyword)
                    });
                    score += 1;
                }
            }
            // Search in full text
            if (scan.extractedText.toLowerCase().includes(lowerQuery)) {
                const context = this.getContext(scan.extractedText, query);
                if (!matches.some(m => m.context === context)) {
                    matches.push({
                        type: 'text',
                        value: query,
                        context
                    });
                    score += 0.5;
                }
            }
            if (matches.length > 0) {
                results.push({
                    documentId: scan.id,
                    filename: scan.filename,
                    matches,
                    score
                });
            }
        }
        return results.sort((a, b) => b.score - a.score);
    }
    /**
     * Delete a scan document
     */
    async deleteScan(scanId) {
        const deleted = this.scans.delete(scanId);
        if (deleted) {
            await this.saveScans();
        }
        return deleted;
    }
    /**
     * Link a scan to a conversation
     */
    async linkScanToConversation(scanId, conversationId) {
        const scan = this.scans.get(scanId);
        const conversation = this.conversations.get(conversationId);
        if (!scan || !conversation) {
            return false;
        }
        // Add to scan's linked conversations
        if (!scan.linkedConversations) {
            scan.linkedConversations = [];
        }
        if (!scan.linkedConversations.includes(conversationId)) {
            scan.linkedConversations.push(conversationId);
        }
        // Add to conversation's linked scans
        if (!conversation.linkedScans) {
            conversation.linkedScans = [];
        }
        if (!conversation.linkedScans.includes(scanId)) {
            conversation.linkedScans.push(scanId);
        }
        await this.saveScans();
        await this.saveConversations();
        return true;
    }
    /**
     * Get suggested conversations for a scan based on content similarity
     */
    async getSuggestedConversations(scanId, limit = 5) {
        const scan = this.scans.get(scanId);
        if (!scan) {
            return [];
        }
        const suggestions = [];
        // Score conversations based on keyword overlap
        for (const conv of this.conversations.values()) {
            let score = 0;
            // Check if any scan keywords appear in conversation messages
            for (const message of conv.messages) {
                const lowerContent = message.content.toLowerCase();
                for (const keyword of scan.metadata.keywords) {
                    if (lowerContent.includes(keyword)) {
                        score += 1;
                    }
                }
                for (const name of scan.metadata.names) {
                    if (lowerContent.includes(name.toLowerCase())) {
                        score += 2;
                    }
                }
            }
            if (score > 0) {
                suggestions.push({ conversation: conv, score });
            }
        }
        // Sort by score and convert to summaries
        const sortedSuggestions = suggestions
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);
        const summaries = [];
        for (const { conversation } of sortedSuggestions) {
            const lastMessage = conversation.messages[conversation.messages.length - 1];
            summaries.push({
                id: conversation.id,
                title: conversation.title,
                messageCount: conversation.messages.length,
                lastMessage: lastMessage ? lastMessage.content.substring(0, 100) : '',
                createdAt: conversation.createdAt,
                updatedAt: conversation.updatedAt,
                tags: conversation.tags
            });
        }
        return summaries;
    }
    /**
     * Get context around a matched term
     */
    getContext(text, term, contextLength = 100) {
        const lowerText = text.toLowerCase();
        const lowerTerm = term.toLowerCase();
        const index = lowerText.indexOf(lowerTerm);
        if (index === -1) {
            return text.substring(0, contextLength);
        }
        const start = Math.max(0, index - contextLength / 2);
        const end = Math.min(text.length, index + term.length + contextLength / 2);
        let context = text.substring(start, end);
        if (start > 0) {
            context = '...' + context;
        }
        if (end < text.length) {
            context = context + '...';
        }
        return context.trim();
    }
    /**
     * Generate a unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }
}

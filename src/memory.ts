import * as fs from 'fs';
import * as path from 'path';

export interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface ScannedDocument {
  id: string;
  filename: string;
  content: string;
  extractedData: {
    names?: string[];
    dates?: string[];
    numbers?: string[];
    keywords?: string[];
  };
  metadata: {
    uploadedAt: number;
    fileSize?: number;
    fileType?: string;
    ocrConfidence?: number;
  };
  relatedConversationIds?: string[];
  tags?: string[];
}

export interface ConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  lastMessage: string;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
}

export interface SearchResult {
  conversationId: string;
  messageId: string;
  content: string;
  score: number;
}

export interface Analytics {
  totalConversations: number;
  totalMessages: number;
  frequentTopics: Array<{ topic: string; count: number }>;
  averageMessagesPerConversation: number;
  mostRecentConversations: ConversationSummary[];
  conversationsByDay: Record<string, number>;
}

/**
 * MemoryManager handles persistent storage and retrieval of conversations
 * All data is stored locally in the out/ directory as JSON
 * No network calls are made - operates completely offline
 */
export class MemoryManager {
  private conversationsPath: string;
  private scannedDocsPath: string;
  private conversations: Map<string, Conversation>;
  private scannedDocuments: Map<string, ScannedDocument>;
  private initialized: boolean = false;

  constructor(dataDir: string = './out') {
    this.conversationsPath = path.join(dataDir, 'conversations.json');
    this.scannedDocsPath = path.join(dataDir, 'scanned-documents.json');
    this.conversations = new Map();
    this.scannedDocuments = new Map();
  }

  /**
   * Initialize the memory manager by loading existing conversations
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure the output directory exists
      const dir = path.dirname(this.conversationsPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Load existing conversations if the file exists
      if (fs.existsSync(this.conversationsPath)) {
        const data = fs.readFileSync(this.conversationsPath, 'utf-8');
        const conversationsArray: Conversation[] = JSON.parse(data);
        
        for (const conv of conversationsArray) {
          this.conversations.set(conv.id, conv);
        }
      }

      // Load existing scanned documents if the file exists
      if (fs.existsSync(this.scannedDocsPath)) {
        const data = fs.readFileSync(this.scannedDocsPath, 'utf-8');
        const docsArray: ScannedDocument[] = JSON.parse(data);
        
        for (const doc of docsArray) {
          this.scannedDocuments.set(doc.id, doc);
        }
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize memory manager:', error);
      throw error;
    }
  }

  /**
   * Save conversations to disk
   */
  private async saveConversations(): Promise<void> {
    try {
      const conversationsArray = Array.from(this.conversations.values());
      const data = JSON.stringify(conversationsArray, null, 2);
      fs.writeFileSync(this.conversationsPath, data, 'utf-8');
    } catch (error) {
      console.error('Failed to save conversations:', error);
      throw error;
    }
  }

  /**
   * Save scanned documents to disk
   */
  private async saveScannedDocuments(): Promise<void> {
    try {
      const docsArray = Array.from(this.scannedDocuments.values());
      const data = JSON.stringify(docsArray, null, 2);
      fs.writeFileSync(this.scannedDocsPath, data, 'utf-8');
    } catch (error) {
      console.error('Failed to save scanned documents:', error);
      throw error;
    }
  }

  /**
   * Create a new conversation
   */
  async createConversation(title: string, tags?: string[]): Promise<Conversation> {
    const conversation: Conversation = {
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
  async addMessage(
    conversationId: string,
    role: 'user' | 'agent',
    content: string
  ): Promise<Message> {
    const conversation = this.conversations.get(conversationId);
    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    const message: Message = {
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
  async getConversation(conversationId: string): Promise<Conversation | null> {
    return this.conversations.get(conversationId) || null;
  }

  /**
   * Get all conversations as summaries (without full message content)
   */
  async listConversations(): Promise<ConversationSummary[]> {
    const summaries: ConversationSummary[] = [];

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
  async searchConversations(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];
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
  async filterByTags(tags: string[]): Promise<ConversationSummary[]> {
    const allSummaries = await this.listConversations();
    
    return allSummaries.filter(summary => {
      if (!summary.tags || summary.tags.length === 0) return false;
      return tags.some(tag => summary.tags!.includes(tag));
    });
  }

  /**
   * Delete a conversation
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    const deleted = this.conversations.delete(conversationId);
    if (deleted) {
      await this.saveConversations();
    }
    return deleted;
  }

  /**
   * Export all conversations
   */
  async exportConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values());
  }

  /**
   * Get analytics about conversation history
   */
  async getAnalytics(): Promise<Analytics> {
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
    const conversationsByDay: Record<string, number> = {};
    for (const conv of conversationsArray) {
      const date = new Date(conv.createdAt).toISOString().split('T')[0];
      conversationsByDay[date] = (conversationsByDay[date] || 0) + 1;
    }

    // Extract frequent topics from tags
    const topicCounts: Record<string, number> = {};
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
  async clearAll(): Promise<void> {
    this.conversations.clear();
    await this.saveConversations();
  }

  /**
   * Save a scanned document
   */
  async saveScannedDocument(document: ScannedDocument): Promise<void> {
    this.scannedDocuments.set(document.id, document);
    await this.saveScannedDocuments();
  }

  /**
   * Get a scanned document by ID
   */
  async getScannedDocument(documentId: string): Promise<ScannedDocument | null> {
    return this.scannedDocuments.get(documentId) || null;
  }

  /**
   * List all scanned documents
   */
  async listScannedDocuments(): Promise<ScannedDocument[]> {
    return Array.from(this.scannedDocuments.values()).sort(
      (a, b) => b.metadata.uploadedAt - a.metadata.uploadedAt
    );
  }

  /**
   * Search scanned documents
   */
  async searchScannedDocuments(query: string): Promise<ScannedDocument[]> {
    const results: ScannedDocument[] = [];
    const lowerQuery = query.toLowerCase();

    for (const doc of this.scannedDocuments.values()) {
      if (
        doc.content.toLowerCase().includes(lowerQuery) ||
        doc.filename.toLowerCase().includes(lowerQuery) ||
        doc.extractedData.names?.some(n => n.toLowerCase().includes(lowerQuery)) ||
        doc.extractedData.dates?.some(d => d.toLowerCase().includes(lowerQuery)) ||
        doc.extractedData.keywords?.some(k => k.toLowerCase().includes(lowerQuery))
      ) {
        results.push(doc);
      }
    }

    return results;
  }

  /**
   * Delete a scanned document
   */
  async deleteScannedDocument(documentId: string): Promise<boolean> {
    const deleted = this.scannedDocuments.delete(documentId);
    if (deleted) {
      await this.saveScannedDocuments();
    }
    return deleted;
  }

  /**
   * Link a scanned document to a conversation
   */
  async linkScannedDocumentToConversation(
    documentId: string,
    conversationId: string
  ): Promise<boolean> {
    const document = this.scannedDocuments.get(documentId);
    if (!document) return false;

    if (!document.relatedConversationIds) {
      document.relatedConversationIds = [];
    }

    if (!document.relatedConversationIds.includes(conversationId)) {
      document.relatedConversationIds.push(conversationId);
      await this.saveScannedDocuments();
    }

    return true;
  }

  /**
   * Get scanned documents related to a conversation
   */
  async getScannedDocumentsByConversation(
    conversationId: string
  ): Promise<ScannedDocument[]> {
    return Array.from(this.scannedDocuments.values()).filter(
      doc => doc.relatedConversationIds?.includes(conversationId)
    );
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}

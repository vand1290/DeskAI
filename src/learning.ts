import * as fs from 'fs';
import * as path from 'path';

export interface UserAction {
  id: string;
  type: 'message' | 'search' | 'filter' | 'view_analytics' | 'conversation_start' | 'conversation_continue';
  timestamp: number;
  context?: Record<string, unknown>;
}

export interface ToolUsagePattern {
  toolName: string;
  usageCount: number;
  lastUsed: number;
  contexts: string[];
}

export interface WorkflowPattern {
  id: string;
  sequence: string[];
  frequency: number;
  lastOccurred: number;
}

export interface AdaptiveSuggestion {
  id: string;
  type: 'tool' | 'workflow' | 'shortcut' | 'topic';
  content: string;
  confidence: number;
  reasoning: string;
}

export interface LearningData {
  enabled: boolean;
  actions: UserAction[];
  toolUsage: Record<string, ToolUsagePattern>;
  workflows: WorkflowPattern[];
  frequentTopics: Record<string, number>;
  preferences: Record<string, unknown>;
  lastAnalyzed: number;
}

/**
 * LearningManager handles learning mode functionality
 * Tracks user behavior and generates adaptive suggestions
 * All data is stored locally for privacy
 */
export class LearningManager {
  private learningPath: string;
  private data: LearningData;
  private initialized: boolean = false;
  private maxActions: number = 1000; // Limit stored actions for performance

  constructor(dataDir: string = './out') {
    this.learningPath = path.join(dataDir, 'learning.json');
    this.data = this.getDefaultData();
  }

  private getDefaultData(): LearningData {
    return {
      enabled: true,
      actions: [],
      toolUsage: {},
      workflows: [],
      frequentTopics: {},
      preferences: {},
      lastAnalyzed: Date.now()
    };
  }

  /**
   * Initialize the learning manager by loading existing data
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure the output directory exists
      const dir = path.dirname(this.learningPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Load existing learning data if the file exists
      if (fs.existsSync(this.learningPath)) {
        const data = fs.readFileSync(this.learningPath, 'utf-8');
        this.data = JSON.parse(data);
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize learning manager:', error);
      throw error;
    }
  }

  /**
   * Save learning data to disk
   */
  private async saveData(): Promise<void> {
    try {
      const data = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(this.learningPath, data, 'utf-8');
    } catch (error) {
      console.error('Failed to save learning data:', error);
      throw error;
    }
  }

  /**
   * Check if learning mode is enabled
   */
  isEnabled(): boolean {
    return this.data.enabled;
  }

  /**
   * Enable or disable learning mode
   */
  async setEnabled(enabled: boolean): Promise<void> {
    this.data.enabled = enabled;
    await this.saveData();
  }

  /**
   * Track a user action
   */
  async trackAction(type: UserAction['type'], context?: Record<string, unknown>): Promise<void> {
    if (!this.data.enabled) return;

    const action: UserAction = {
      id: this.generateId(),
      type,
      timestamp: Date.now(),
      context
    };

    this.data.actions.push(action);

    // Limit stored actions to prevent unbounded growth
    if (this.data.actions.length > this.maxActions) {
      this.data.actions = this.data.actions.slice(-this.maxActions);
    }

    // Update tool usage patterns
    await this.updateToolUsage(type, context);

    // Detect workflows periodically
    if (this.data.actions.length % 10 === 0) {
      await this.detectWorkflows();
    }

    await this.saveData();
  }

  /**
   * Update tool usage statistics
   */
  private async updateToolUsage(type: string, context?: Record<string, unknown>): Promise<void> {
    const toolName = type;
    
    if (!this.data.toolUsage[toolName]) {
      this.data.toolUsage[toolName] = {
        toolName,
        usageCount: 0,
        lastUsed: Date.now(),
        contexts: []
      };
    }

    const tool = this.data.toolUsage[toolName];
    tool.usageCount++;
    tool.lastUsed = Date.now();

    // Track contexts for better suggestions
    if (context?.topic && typeof context.topic === 'string') {
      if (!tool.contexts.includes(context.topic)) {
        tool.contexts.push(context.topic);
        if (tool.contexts.length > 10) {
          tool.contexts = tool.contexts.slice(-10);
        }
      }
    }
  }

  /**
   * Detect workflow patterns from recent actions
   */
  private async detectWorkflows(): Promise<void> {
    const recentActions = this.data.actions.slice(-20);
    if (recentActions.length < 3) return;

    // Look for sequences of 3 actions
    for (let i = 0; i <= recentActions.length - 3; i++) {
      const sequence = recentActions.slice(i, i + 3).map(a => a.type);
      const sequenceKey = sequence.join('->');

      // Find or create workflow pattern
      let workflow = this.data.workflows.find(w => w.sequence.join('->') === sequenceKey);
      if (!workflow) {
        workflow = {
          id: this.generateId(),
          sequence,
          frequency: 0,
          lastOccurred: Date.now()
        };
        this.data.workflows.push(workflow);
      }

      workflow.frequency++;
      workflow.lastOccurred = Date.now();
    }

    // Keep only top 20 most frequent workflows
    this.data.workflows.sort((a, b) => b.frequency - a.frequency);
    if (this.data.workflows.length > 20) {
      this.data.workflows = this.data.workflows.slice(0, 20);
    }
  }

  /**
   * Update frequent topics based on conversation tags
   */
  async updateTopics(tags: string[]): Promise<void> {
    if (!this.data.enabled) return;

    for (const tag of tags) {
      this.data.frequentTopics[tag] = (this.data.frequentTopics[tag] || 0) + 1;
    }

    await this.saveData();
  }

  /**
   * Generate adaptive suggestions based on learned patterns
   */
  async generateSuggestions(limit: number = 5): Promise<AdaptiveSuggestion[]> {
    if (!this.data.enabled) return [];

    const suggestions: AdaptiveSuggestion[] = [];

    // Suggest most used tools
    const toolSuggestions = this.generateToolSuggestions();
    suggestions.push(...toolSuggestions);

    // Suggest common workflows
    const workflowSuggestions = this.generateWorkflowSuggestions();
    suggestions.push(...workflowSuggestions);

    // Suggest frequent topics
    const topicSuggestions = this.generateTopicSuggestions();
    suggestions.push(...topicSuggestions);

    // Sort by confidence and return top suggestions
    suggestions.sort((a, b) => b.confidence - a.confidence);
    return suggestions.slice(0, limit);
  }

  /**
   * Generate tool usage suggestions
   */
  private generateToolSuggestions(): AdaptiveSuggestion[] {
    const suggestions: AdaptiveSuggestion[] = [];
    const tools = Object.values(this.data.toolUsage);
    
    // Sort by usage count
    tools.sort((a, b) => b.usageCount - a.usageCount);

    // Take top 2 tools
    for (const tool of tools.slice(0, 2)) {
      if (tool.usageCount < 3) continue; // Only suggest if used at least 3 times

      const toolLabels: Record<string, string> = {
        'view_analytics': 'View Analytics',
        'search': 'Search Conversations',
        'filter': 'Filter by Tags',
        'message': 'Start Chatting'
      };

      suggestions.push({
        id: this.generateId(),
        type: 'tool',
        content: `You frequently use "${toolLabels[tool.toolName] || tool.toolName}"`,
        confidence: Math.min(tool.usageCount / 10, 1.0),
        reasoning: `Used ${tool.usageCount} times`
      });
    }

    return suggestions;
  }

  /**
   * Generate workflow suggestions
   */
  private generateWorkflowSuggestions(): AdaptiveSuggestion[] {
    const suggestions: AdaptiveSuggestion[] = [];
    
    // Find most frequent workflows
    for (const workflow of this.data.workflows.slice(0, 2)) {
      if (workflow.frequency < 2) continue; // Only suggest if occurred at least twice

      const actionLabels: Record<string, string> = {
        'message': 'chat',
        'view_analytics': 'view analytics',
        'search': 'search',
        'filter': 'filter',
        'conversation_start': 'start conversation',
        'conversation_continue': 'continue conversation'
      };

      const sequenceStr = workflow.sequence
        .map(s => actionLabels[s] || s)
        .join(' → ');

      suggestions.push({
        id: this.generateId(),
        type: 'workflow',
        content: `Common workflow: ${sequenceStr}`,
        confidence: Math.min(workflow.frequency / 5, 1.0),
        reasoning: `Occurred ${workflow.frequency} times`
      });
    }

    return suggestions;
  }

  /**
   * Generate topic suggestions
   */
  private generateTopicSuggestions(): AdaptiveSuggestion[] {
    const suggestions: AdaptiveSuggestion[] = [];
    const topics = Object.entries(this.data.frequentTopics);
    
    // Sort by frequency
    topics.sort((a, b) => b[1] - a[1]);

    // Take top topic
    if (topics.length > 0 && topics[0][1] >= 2) {
      const [topic, count] = topics[0];
      suggestions.push({
        id: this.generateId(),
        type: 'topic',
        content: `You often discuss "${topic}"`,
        confidence: Math.min(count / 5, 1.0),
        reasoning: `Appeared in ${count} conversations`
      });
    }

    return suggestions;
  }

  /**
   * Get learning statistics
   */
  async getStatistics(): Promise<{
    enabled: boolean;
    totalActions: number;
    toolsTracked: number;
    workflowsDetected: number;
    topicsTracked: number;
    lastAnalyzed: number;
  }> {
    return {
      enabled: this.data.enabled,
      totalActions: this.data.actions.length,
      toolsTracked: Object.keys(this.data.toolUsage).length,
      workflowsDetected: this.data.workflows.length,
      topicsTracked: Object.keys(this.data.frequentTopics).length,
      lastAnalyzed: this.data.lastAnalyzed
    };
  }

  /**
   * Get detailed learning data for review
   */
  async getLearningData(): Promise<{
    toolUsage: ToolUsagePattern[];
    workflows: WorkflowPattern[];
    frequentTopics: Array<{ topic: string; count: number }>;
  }> {
    const toolUsage = Object.values(this.data.toolUsage)
      .sort((a, b) => b.usageCount - a.usageCount);

    const workflows = [...this.data.workflows]
      .sort((a, b) => b.frequency - a.frequency);

    const frequentTopics = Object.entries(this.data.frequentTopics)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count);

    return {
      toolUsage,
      workflows,
      frequentTopics
    };
  }

  /**
   * Reset all learning data
   */
  async reset(): Promise<void> {
    const wasEnabled = this.data.enabled;
    this.data = this.getDefaultData();
    this.data.enabled = wasEnabled; // Preserve enabled state
    await this.saveData();
  }

  /**
   * Clear old actions to maintain performance
   */
  async clearOldActions(daysToKeep: number = 30): Promise<void> {
    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
    this.data.actions = this.data.actions.filter(a => a.timestamp > cutoffTime);
    await this.saveData();
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}

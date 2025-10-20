/**
 * PreferenceManager - Manages learned user preferences and patterns
 * All data is stored locally for privacy
 */
class PreferenceManager {
  constructor() {
    this.storageKey = 'deskai_learned_preferences';
    this.preferences = this.loadPreferences();
  }

  /**
   * Load preferences from local storage
   * @returns {Object} Loaded preferences or default structure
   */
  loadPreferences() {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {
          console.error('Error parsing preferences:', e);
        }
      }
    }
    return this.getDefaultPreferences();
  }

  /**
   * Get default preferences structure
   * @returns {Object} Default preferences
   */
  getDefaultPreferences() {
    return {
      toolUsage: {},
      workflowPatterns: [],
      shortcuts: {},
      timePatterns: {},
      lastUpdated: new Date().toISOString(),
      learningEnabled: true
    };
  }

  /**
   * Save preferences to local storage
   */
  savePreferences() {
    if (typeof localStorage !== 'undefined') {
      this.preferences.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
    }
  }

  /**
   * Record tool usage
   * @param {string} toolName - Name of the tool used
   * @param {Object} context - Context information (time, related tools, etc.)
   */
  recordToolUsage(toolName, context = {}) {
    if (!this.preferences.learningEnabled) return;

    if (!this.preferences.toolUsage[toolName]) {
      this.preferences.toolUsage[toolName] = {
        count: 0,
        lastUsed: null,
        contexts: []
      };
    }

    this.preferences.toolUsage[toolName].count++;
    this.preferences.toolUsage[toolName].lastUsed = new Date().toISOString();
    
    // Store context with limit to prevent excessive storage
    if (this.preferences.toolUsage[toolName].contexts.length < 50) {
      this.preferences.toolUsage[toolName].contexts.push({
        timestamp: new Date().toISOString(),
        ...context
      });
    }

    this.savePreferences();
  }

  /**
   * Record workflow pattern
   * @param {Array} toolSequence - Sequence of tools used
   */
  recordWorkflowPattern(toolSequence) {
    if (!this.preferences.learningEnabled || toolSequence.length < 2) return;

    const pattern = {
      sequence: toolSequence,
      timestamp: new Date().toISOString(),
      frequency: 1
    };

    // Check if pattern already exists
    const existingIndex = this.preferences.workflowPatterns.findIndex(
      p => JSON.stringify(p.sequence) === JSON.stringify(toolSequence)
    );

    if (existingIndex >= 0) {
      this.preferences.workflowPatterns[existingIndex].frequency++;
      this.preferences.workflowPatterns[existingIndex].timestamp = pattern.timestamp;
    } else {
      this.preferences.workflowPatterns.push(pattern);
    }

    // Keep only top 20 patterns
    this.preferences.workflowPatterns.sort((a, b) => b.frequency - a.frequency);
    if (this.preferences.workflowPatterns.length > 20) {
      this.preferences.workflowPatterns = this.preferences.workflowPatterns.slice(0, 20);
    }

    this.savePreferences();
  }

  /**
   * Record time-based usage pattern
   * @param {string} toolName - Tool name
   * @param {Date} timestamp - Time of usage
   */
  recordTimePattern(toolName, timestamp = new Date()) {
    if (!this.preferences.learningEnabled) return;

    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();

    if (!this.preferences.timePatterns[toolName]) {
      this.preferences.timePatterns[toolName] = {
        hourly: Array(24).fill(0),
        daily: Array(7).fill(0)
      };
    }

    this.preferences.timePatterns[toolName].hourly[hour]++;
    this.preferences.timePatterns[toolName].daily[dayOfWeek]++;

    this.savePreferences();
  }

  /**
   * Get most used tools
   * @param {number} limit - Number of tools to return
   * @returns {Array} Array of most used tools
   */
  getMostUsedTools(limit = 5) {
    const tools = Object.entries(this.preferences.toolUsage)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return tools;
  }

  /**
   * Get suggested next tools based on current tool
   * @param {string} currentTool - Current tool being used
   * @returns {Array} Suggested tools
   */
  getSuggestedNextTools(currentTool) {
    const suggestions = [];
    
    // Analyze workflow patterns
    for (const pattern of this.preferences.workflowPatterns) {
      const index = pattern.sequence.indexOf(currentTool);
      if (index >= 0 && index < pattern.sequence.length - 1) {
        const nextTool = pattern.sequence[index + 1];
        const existing = suggestions.find(s => s.tool === nextTool);
        if (existing) {
          existing.confidence += pattern.frequency;
        } else {
          suggestions.push({
            tool: nextTool,
            confidence: pattern.frequency,
            reason: 'workflow_pattern'
          });
        }
      }
    }

    // Sort by confidence
    suggestions.sort((a, b) => b.confidence - a.confidence);
    return suggestions.slice(0, 3);
  }

  /**
   * Get time-based suggestions
   * @returns {Array} Tools suggested based on current time
   */
  getTimeBasedSuggestions() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    const suggestions = [];

    for (const [toolName, patterns] of Object.entries(this.preferences.timePatterns)) {
      const hourScore = patterns.hourly[hour] || 0;
      const dayScore = patterns.daily[dayOfWeek] || 0;
      const totalScore = hourScore * 2 + dayScore; // Weight hour more heavily

      if (totalScore > 0) {
        suggestions.push({
          tool: toolName,
          score: totalScore,
          reason: 'time_pattern'
        });
      }
    }

    suggestions.sort((a, b) => b.score - a.score);
    return suggestions.slice(0, 3);
  }

  /**
   * Enable or disable learning mode
   * @param {boolean} enabled - Whether learning should be enabled
   */
  setLearningEnabled(enabled) {
    this.preferences.learningEnabled = enabled;
    this.savePreferences();
  }

  /**
   * Check if learning is enabled
   * @returns {boolean} Learning status
   */
  isLearningEnabled() {
    return this.preferences.learningEnabled;
  }

  /**
   * Reset all learned preferences
   */
  resetPreferences() {
    this.preferences = this.getDefaultPreferences();
    this.savePreferences();
  }

  /**
   * Get all preferences for review
   * @returns {Object} All preferences
   */
  getAllPreferences() {
    return JSON.parse(JSON.stringify(this.preferences));
  }

  /**
   * Get statistics about learned data
   * @returns {Object} Statistics
   */
  getStatistics() {
    return {
      totalToolsTracked: Object.keys(this.preferences.toolUsage).length,
      totalInteractions: Object.values(this.preferences.toolUsage)
        .reduce((sum, tool) => sum + tool.count, 0),
      workflowPatternsLearned: this.preferences.workflowPatterns.length,
      learningEnabled: this.preferences.learningEnabled,
      lastUpdated: this.preferences.lastUpdated
    };
  }
}

module.exports = PreferenceManager;

/**
 * LearningMode - Main controller for adaptive learning features
 * Coordinates preference management and interaction tracking
 */
class LearningMode {
  constructor(preferenceManager, interactionTracker) {
    this.preferenceManager = preferenceManager;
    this.interactionTracker = interactionTracker;
  }

  /**
   * Initialize learning mode
   */
  initialize() {
    console.log('Learning Mode initialized');
    console.log('Learning enabled:', this.preferenceManager.isLearningEnabled());
  }

  /**
   * Track a user action
   * @param {string} toolName - Name of the tool/action
   * @param {Object} metadata - Additional context
   */
  trackAction(toolName, metadata = {}) {
    if (this.preferenceManager.isLearningEnabled()) {
      this.interactionTracker.trackInteraction(toolName, metadata);
    }
  }

  /**
   * Get adaptive suggestions based on context
   * @param {Object} context - Current context (current tool, time, etc.)
   * @returns {Object} Suggestions object
   */
  getSuggestions(context = {}) {
    const suggestions = {
      mostUsed: [],
      nextTools: [],
      timeBased: [],
      combined: []
    };

    if (!this.preferenceManager.isLearningEnabled()) {
      return suggestions;
    }

    // Get most used tools
    suggestions.mostUsed = this.preferenceManager.getMostUsedTools(5);

    // Get suggested next tools if context has current tool
    if (context.currentTool) {
      suggestions.nextTools = this.preferenceManager.getSuggestedNextTools(context.currentTool);
    }

    // Get time-based suggestions
    suggestions.timeBased = this.preferenceManager.getTimeBasedSuggestions();

    // Combine and rank all suggestions
    suggestions.combined = this.combineAndRankSuggestions(
      suggestions.mostUsed,
      suggestions.nextTools,
      suggestions.timeBased
    );

    return suggestions;
  }

  /**
   * Combine and rank suggestions from different sources
   * @param {Array} mostUsed - Most used tools
   * @param {Array} nextTools - Suggested next tools
   * @param {Array} timeBased - Time-based suggestions
   * @returns {Array} Combined and ranked suggestions
   */
  combineAndRankSuggestions(mostUsed, nextTools, timeBased) {
    const combined = new Map();

    // Add most used tools (weight: 1)
    mostUsed.forEach(tool => {
      combined.set(tool.name, {
        tool: tool.name,
        score: tool.count * 0.5,
        reasons: ['frequently_used']
      });
    });

    // Add next tools (weight: 3 - highest priority)
    nextTools.forEach(suggestion => {
      const existing = combined.get(suggestion.tool);
      if (existing) {
        existing.score += suggestion.confidence * 3;
        existing.reasons.push('workflow_pattern');
      } else {
        combined.set(suggestion.tool, {
          tool: suggestion.tool,
          score: suggestion.confidence * 3,
          reasons: ['workflow_pattern']
        });
      }
    });

    // Add time-based suggestions (weight: 2)
    timeBased.forEach(suggestion => {
      const existing = combined.get(suggestion.tool);
      if (existing) {
        existing.score += suggestion.score * 2;
        existing.reasons.push('time_pattern');
      } else {
        combined.set(suggestion.tool, {
          tool: suggestion.tool,
          score: suggestion.score * 2,
          reasons: ['time_pattern']
        });
      }
    });

    // Convert to array and sort by score
    return Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  /**
   * Enable or disable learning mode
   * @param {boolean} enabled - Enable/disable status
   */
  setEnabled(enabled) {
    this.preferenceManager.setLearningEnabled(enabled);
    if (!enabled) {
      this.interactionTracker.clearSession();
    }
  }

  /**
   * Check if learning mode is enabled
   * @returns {boolean} Enabled status
   */
  isEnabled() {
    return this.preferenceManager.isLearningEnabled();
  }

  /**
   * Reset all learned data
   */
  resetLearning() {
    this.preferenceManager.resetPreferences();
    this.interactionTracker.clearSession();
  }

  /**
   * Get statistics about learned data
   * @returns {Object} Statistics
   */
  getStatistics() {
    return this.preferenceManager.getStatistics();
  }

  /**
   * Get all learned preferences for review
   * @returns {Object} All preferences
   */
  getLearnedData() {
    return this.preferenceManager.getAllPreferences();
  }

  /**
   * Export learned data for backup
   * @returns {string} JSON string of learned data
   */
  exportData() {
    return JSON.stringify(this.preferenceManager.getAllPreferences(), null, 2);
  }

  /**
   * Import learned data from backup
   * @param {string} jsonData - JSON string of learned data
   * @returns {boolean} Success status
   */
  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      // Validate data structure
      if (data.toolUsage && data.workflowPatterns && data.timePatterns) {
        this.preferenceManager.preferences = data;
        this.preferenceManager.savePreferences();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Error importing data:', e);
      return false;
    }
  }
}

module.exports = LearningMode;

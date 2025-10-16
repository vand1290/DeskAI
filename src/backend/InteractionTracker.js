/**
 * InteractionTracker - Tracks user interactions with tools and UI
 * Provides session-based tracking for workflow pattern detection
 */
class InteractionTracker {
  constructor(preferenceManager) {
    this.preferenceManager = preferenceManager;
    this.currentSession = [];
    this.sessionTimeout = 5 * 60 * 1000; // 5 minutes
    this.lastInteractionTime = null;
    this.sessionStartTime = null;
  }

  /**
   * Track a tool interaction
   * @param {string} toolName - Name of the tool
   * @param {Object} metadata - Additional metadata about the interaction
   */
  trackInteraction(toolName, metadata = {}) {
    const now = Date.now();

    // Check if we should start a new session
    if (this.lastInteractionTime && (now - this.lastInteractionTime) > this.sessionTimeout) {
      this.endSession();
    }

    // Start new session if needed
    if (!this.sessionStartTime) {
      this.sessionStartTime = now;
    }

    // Add interaction to current session
    this.currentSession.push({
      tool: toolName,
      timestamp: new Date().toISOString(),
      metadata
    });

    this.lastInteractionTime = now;

    // Record in preference manager
    this.preferenceManager.recordToolUsage(toolName, metadata);
    this.preferenceManager.recordTimePattern(toolName);

    // Detect and record patterns if session has enough interactions
    if (this.currentSession.length >= 2) {
      const recentSequence = this.currentSession
        .slice(-5)
        .map(interaction => interaction.tool);
      this.preferenceManager.recordWorkflowPattern(recentSequence);
    }
  }

  /**
   * End the current session
   */
  endSession() {
    if (this.currentSession.length > 0) {
      // Record the complete session as a workflow pattern
      const fullSequence = this.currentSession.map(i => i.tool);
      if (fullSequence.length >= 2) {
        this.preferenceManager.recordWorkflowPattern(fullSequence);
      }

      this.currentSession = [];
      this.sessionStartTime = null;
    }
  }

  /**
   * Get current session information
   * @returns {Object} Session information
   */
  getSessionInfo() {
    return {
      interactions: this.currentSession.length,
      startTime: this.sessionStartTime,
      duration: this.sessionStartTime ? Date.now() - this.sessionStartTime : 0,
      tools: this.currentSession.map(i => i.tool)
    };
  }

  /**
   * Clear current session without recording
   */
  clearSession() {
    this.currentSession = [];
    this.sessionStartTime = null;
    this.lastInteractionTime = null;
  }
}

module.exports = InteractionTracker;

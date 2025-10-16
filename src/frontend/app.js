// Import backend classes for browser use
// In a real application, these would be bundled or loaded as modules

// Simplified PreferenceManager for browser context
class PreferenceManager {
  constructor() {
    this.storageKey = 'deskai_learned_preferences';
    this.preferences = this.loadPreferences();
  }

  loadPreferences() {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing preferences:', e);
      }
    }
    return this.getDefaultPreferences();
  }

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

  savePreferences() {
    this.preferences.lastUpdated = new Date().toISOString();
    localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
  }

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
    
    if (this.preferences.toolUsage[toolName].contexts.length < 50) {
      this.preferences.toolUsage[toolName].contexts.push({
        timestamp: new Date().toISOString(),
        ...context
      });
    }

    this.savePreferences();
  }

  recordWorkflowPattern(toolSequence) {
    if (!this.preferences.learningEnabled || toolSequence.length < 2) return;

    const pattern = {
      sequence: toolSequence,
      timestamp: new Date().toISOString(),
      frequency: 1
    };

    const existingIndex = this.preferences.workflowPatterns.findIndex(
      p => JSON.stringify(p.sequence) === JSON.stringify(toolSequence)
    );

    if (existingIndex >= 0) {
      this.preferences.workflowPatterns[existingIndex].frequency++;
      this.preferences.workflowPatterns[existingIndex].timestamp = pattern.timestamp;
    } else {
      this.preferences.workflowPatterns.push(pattern);
    }

    this.preferences.workflowPatterns.sort((a, b) => b.frequency - a.frequency);
    if (this.preferences.workflowPatterns.length > 20) {
      this.preferences.workflowPatterns = this.preferences.workflowPatterns.slice(0, 20);
    }

    this.savePreferences();
  }

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

  getMostUsedTools(limit = 5) {
    const tools = Object.entries(this.preferences.toolUsage)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
    
    return tools;
  }

  getSuggestedNextTools(currentTool) {
    const suggestions = [];
    
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

    suggestions.sort((a, b) => b.confidence - a.confidence);
    return suggestions.slice(0, 3);
  }

  getTimeBasedSuggestions() {
    const now = new Date();
    const hour = now.getHours();
    const dayOfWeek = now.getDay();

    const suggestions = [];

    for (const [toolName, patterns] of Object.entries(this.preferences.timePatterns)) {
      const hourScore = patterns.hourly[hour] || 0;
      const dayScore = patterns.daily[dayOfWeek] || 0;
      const totalScore = hourScore * 2 + dayScore;

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

  setLearningEnabled(enabled) {
    this.preferences.learningEnabled = enabled;
    this.savePreferences();
  }

  isLearningEnabled() {
    return this.preferences.learningEnabled;
  }

  resetPreferences() {
    this.preferences = this.getDefaultPreferences();
    this.savePreferences();
  }

  getAllPreferences() {
    return JSON.parse(JSON.stringify(this.preferences));
  }

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

// InteractionTracker
class InteractionTracker {
  constructor(preferenceManager) {
    this.preferenceManager = preferenceManager;
    this.currentSession = [];
    this.sessionTimeout = 5 * 60 * 1000;
    this.lastInteractionTime = null;
    this.sessionStartTime = null;
  }

  trackInteraction(toolName, metadata = {}) {
    const now = Date.now();

    if (this.lastInteractionTime && (now - this.lastInteractionTime) > this.sessionTimeout) {
      this.endSession();
    }

    if (!this.sessionStartTime) {
      this.sessionStartTime = now;
    }

    this.currentSession.push({
      tool: toolName,
      timestamp: new Date().toISOString(),
      metadata
    });

    this.lastInteractionTime = now;

    this.preferenceManager.recordToolUsage(toolName, metadata);
    this.preferenceManager.recordTimePattern(toolName);

    if (this.currentSession.length >= 2) {
      const recentSequence = this.currentSession
        .slice(-5)
        .map(interaction => interaction.tool);
      this.preferenceManager.recordWorkflowPattern(recentSequence);
    }
  }

  endSession() {
    if (this.currentSession.length > 0) {
      const fullSequence = this.currentSession.map(i => i.tool);
      if (fullSequence.length >= 2) {
        this.preferenceManager.recordWorkflowPattern(fullSequence);
      }

      this.currentSession = [];
      this.sessionStartTime = null;
    }
  }

  clearSession() {
    this.currentSession = [];
    this.sessionStartTime = null;
    this.lastInteractionTime = null;
  }
}

// LearningMode
class LearningMode {
  constructor(preferenceManager, interactionTracker) {
    this.preferenceManager = preferenceManager;
    this.interactionTracker = interactionTracker;
  }

  initialize() {
    console.log('Learning Mode initialized');
    console.log('Learning enabled:', this.preferenceManager.isLearningEnabled());
  }

  trackAction(toolName, metadata = {}) {
    if (this.preferenceManager.isLearningEnabled()) {
      this.interactionTracker.trackInteraction(toolName, metadata);
    }
  }

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

    suggestions.mostUsed = this.preferenceManager.getMostUsedTools(5);

    if (context.currentTool) {
      suggestions.nextTools = this.preferenceManager.getSuggestedNextTools(context.currentTool);
    }

    suggestions.timeBased = this.preferenceManager.getTimeBasedSuggestions();

    suggestions.combined = this.combineAndRankSuggestions(
      suggestions.mostUsed,
      suggestions.nextTools,
      suggestions.timeBased
    );

    return suggestions;
  }

  combineAndRankSuggestions(mostUsed, nextTools, timeBased) {
    const combined = new Map();

    mostUsed.forEach(tool => {
      combined.set(tool.name, {
        tool: tool.name,
        score: tool.count * 0.5,
        reasons: ['frequently_used']
      });
    });

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

    return Array.from(combined.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  setEnabled(enabled) {
    this.preferenceManager.setLearningEnabled(enabled);
    if (!enabled) {
      this.interactionTracker.clearSession();
    }
  }

  isEnabled() {
    return this.preferenceManager.isLearningEnabled();
  }

  resetLearning() {
    this.preferenceManager.resetPreferences();
    this.interactionTracker.clearSession();
  }

  getStatistics() {
    return this.preferenceManager.getStatistics();
  }

  getLearnedData() {
    return this.preferenceManager.getAllPreferences();
  }

  exportData() {
    return JSON.stringify(this.preferenceManager.getAllPreferences(), null, 2);
  }

  importData(jsonData) {
    try {
      const data = JSON.parse(jsonData);
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

// Initialize the application
const preferenceManager = new PreferenceManager();
const interactionTracker = new InteractionTracker(preferenceManager);
const learningMode = new LearningMode(preferenceManager, interactionTracker);

learningMode.initialize();

// UI Functions
function updateUI() {
  updateStatistics();
  updateSuggestions();
  updateLearningStatus();
}

function updateStatistics() {
  const stats = learningMode.getStatistics();
  
  document.getElementById('totalTools').textContent = stats.totalToolsTracked;
  document.getElementById('totalInteractions').textContent = stats.totalInteractions;
  document.getElementById('workflowPatterns').textContent = stats.workflowPatternsLearned;
  
  if (stats.lastUpdated) {
    const date = new Date(stats.lastUpdated);
    document.getElementById('lastUpdated').textContent = date.toLocaleString();
  }
}

function updateSuggestions() {
  const suggestions = learningMode.getSuggestions();
  const container = document.getElementById('suggestionsContainer');
  
  if (suggestions.combined.length === 0) {
    container.innerHTML = '<p class="empty-state">Start using tools to see personalized suggestions!</p>';
    return;
  }

  container.innerHTML = suggestions.combined.map(suggestion => {
    const reasons = suggestion.reasons.map(reason => {
      const labels = {
        'frequently_used': '🔥 Frequently Used',
        'workflow_pattern': '🔄 Workflow Pattern',
        'time_pattern': '⏰ Time-based'
      };
      return `<span class="reason-badge">${labels[reason] || reason}</span>`;
    }).join('');

    return `
      <div class="suggestion-item">
        <div>
          <div class="suggestion-tool">${suggestion.tool}</div>
          <div class="suggestion-reasons">${reasons}</div>
        </div>
        <button class="btn btn-secondary" onclick="useTool('${suggestion.tool}')">Use</button>
      </div>
    `;
  }).join('');
}

function updateLearningStatus() {
  const enabled = learningMode.isEnabled();
  document.getElementById('learningToggle').checked = enabled;
  document.getElementById('learningStatus').textContent = 
    `Learning Mode: ${enabled ? 'Enabled' : 'Disabled'}`;
}

// Tool interaction
function useTool(toolName) {
  learningMode.trackAction(toolName);
  showNotification(`Used: ${toolName}`);
  updateUI();
}

// Learning controls
document.getElementById('learningToggle').addEventListener('change', function() {
  learningMode.setEnabled(this.checked);
  updateLearningStatus();
  showNotification(this.checked ? 'Learning Mode Enabled' : 'Learning Mode Disabled');
});

// Review learned data
function showLearnedData() {
  const container = document.getElementById('learnedDataContainer');
  const data = learningMode.getLearnedData();
  
  if (container.classList.contains('hidden')) {
    container.classList.remove('hidden');
    container.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
  } else {
    container.classList.add('hidden');
  }
}

// Export data
function exportData() {
  const data = learningMode.exportData();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'deskai-learned-data.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showNotification('Data exported successfully!');
}

// Reset learning
function confirmReset() {
  document.getElementById('modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
}

function resetLearning() {
  learningMode.resetLearning();
  closeModal();
  updateUI();
  showNotification('Learning data reset successfully!');
}

// Notifications
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Initialize UI on page load
document.addEventListener('DOMContentLoaded', function() {
  updateUI();
});

// Update suggestions periodically
setInterval(updateSuggestions, 10000);

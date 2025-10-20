const PreferenceManager = require('../src/backend/PreferenceManager');

// Mock localStorage
global.localStorage = {
  store: {},
  getItem(key) {
    return this.store[key] || null;
  },
  setItem(key, value) {
    this.store[key] = value;
  },
  clear() {
    this.store = {};
  }
};

describe('PreferenceManager', () => {
  let preferenceManager;

  beforeEach(() => {
    global.localStorage.clear();
    preferenceManager = new PreferenceManager();
  });

  describe('Initialization', () => {
    test('should initialize with default preferences', () => {
      const prefs = preferenceManager.getAllPreferences();
      expect(prefs.toolUsage).toEqual({});
      expect(prefs.workflowPatterns).toEqual([]);
      expect(prefs.learningEnabled).toBe(true);
    });

    test('should load existing preferences from localStorage', () => {
      const testData = {
        toolUsage: { 'Test Tool': { count: 5 } },
        workflowPatterns: [],
        shortcuts: {},
        timePatterns: {},
        learningEnabled: true,
        lastUpdated: new Date().toISOString()
      };
      global.localStorage.setItem('deskai_learned_preferences', JSON.stringify(testData));
      
      const pm = new PreferenceManager();
      expect(pm.preferences.toolUsage['Test Tool'].count).toBe(5);
    });
  });

  describe('Tool Usage Recording', () => {
    test('should record tool usage', () => {
      preferenceManager.recordToolUsage('Create Ticket');
      
      const stats = preferenceManager.getStatistics();
      expect(stats.totalToolsTracked).toBe(1);
      expect(stats.totalInteractions).toBe(1);
    });

    test('should increment count for repeated tool usage', () => {
      preferenceManager.recordToolUsage('Create Ticket');
      preferenceManager.recordToolUsage('Create Ticket');
      preferenceManager.recordToolUsage('Create Ticket');
      
      const tools = preferenceManager.getMostUsedTools();
      expect(tools[0].count).toBe(3);
    });

    test('should not record when learning is disabled', () => {
      preferenceManager.setLearningEnabled(false);
      preferenceManager.recordToolUsage('Create Ticket');
      
      const stats = preferenceManager.getStatistics();
      expect(stats.totalInteractions).toBe(0);
    });

    test('should store context with tool usage', () => {
      const context = { priority: 'high', category: 'support' };
      preferenceManager.recordToolUsage('Create Ticket', context);
      
      const prefs = preferenceManager.getAllPreferences();
      expect(prefs.toolUsage['Create Ticket'].contexts[0].priority).toBe('high');
    });
  });

  describe('Workflow Pattern Recording', () => {
    test('should record workflow patterns', () => {
      const pattern = ['Create Ticket', 'Search Knowledge Base', 'Send Email'];
      preferenceManager.recordWorkflowPattern(pattern);
      
      const prefs = preferenceManager.getAllPreferences();
      expect(prefs.workflowPatterns.length).toBe(1);
      expect(prefs.workflowPatterns[0].sequence).toEqual(pattern);
    });

    test('should increment frequency for repeated patterns', () => {
      const pattern = ['Create Ticket', 'Send Email'];
      preferenceManager.recordWorkflowPattern(pattern);
      preferenceManager.recordWorkflowPattern(pattern);
      
      const prefs = preferenceManager.getAllPreferences();
      expect(prefs.workflowPatterns[0].frequency).toBe(2);
    });

    test('should not record patterns with less than 2 tools', () => {
      preferenceManager.recordWorkflowPattern(['Create Ticket']);
      
      const prefs = preferenceManager.getAllPreferences();
      expect(prefs.workflowPatterns.length).toBe(0);
    });

    test('should limit workflow patterns to top 20', () => {
      for (let i = 0; i < 25; i++) {
        preferenceManager.recordWorkflowPattern([`Tool ${i}`, `Tool ${i + 1}`]);
      }
      
      const prefs = preferenceManager.getAllPreferences();
      expect(prefs.workflowPatterns.length).toBe(20);
    });
  });

  describe('Time Pattern Recording', () => {
    test('should record time patterns', () => {
      const testDate = new Date('2024-01-15T14:30:00');
      preferenceManager.recordTimePattern('Create Ticket', testDate);
      
      const prefs = preferenceManager.getAllPreferences();
      expect(prefs.timePatterns['Create Ticket']).toBeDefined();
      expect(prefs.timePatterns['Create Ticket'].hourly[14]).toBe(1);
    });

    test('should accumulate time patterns', () => {
      const testDate = new Date('2024-01-15T14:30:00');
      preferenceManager.recordTimePattern('Create Ticket', testDate);
      preferenceManager.recordTimePattern('Create Ticket', testDate);
      
      const prefs = preferenceManager.getAllPreferences();
      expect(prefs.timePatterns['Create Ticket'].hourly[14]).toBe(2);
    });
  });

  describe('Suggestions', () => {
    test('should get most used tools', () => {
      preferenceManager.recordToolUsage('Tool A');
      preferenceManager.recordToolUsage('Tool A');
      preferenceManager.recordToolUsage('Tool B');
      
      const mostUsed = preferenceManager.getMostUsedTools(2);
      expect(mostUsed[0].name).toBe('Tool A');
      expect(mostUsed[0].count).toBe(2);
      expect(mostUsed[1].name).toBe('Tool B');
    });

    test('should suggest next tools based on workflow patterns', () => {
      const pattern = ['Create Ticket', 'Search Knowledge Base', 'Send Email'];
      preferenceManager.recordWorkflowPattern(pattern);
      
      const suggestions = preferenceManager.getSuggestedNextTools('Create Ticket');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].tool).toBe('Search Knowledge Base');
    });

    test('should get time-based suggestions', () => {
      const now = new Date();
      preferenceManager.recordTimePattern('Morning Tool', now);
      
      const suggestions = preferenceManager.getTimeBasedSuggestions();
      expect(suggestions.length).toBeGreaterThan(0);
    });
  });

  describe('Learning Mode Control', () => {
    test('should enable and disable learning', () => {
      expect(preferenceManager.isLearningEnabled()).toBe(true);
      
      preferenceManager.setLearningEnabled(false);
      expect(preferenceManager.isLearningEnabled()).toBe(false);
      
      preferenceManager.setLearningEnabled(true);
      expect(preferenceManager.isLearningEnabled()).toBe(true);
    });
  });

  describe('Reset Functionality', () => {
    test('should reset all preferences', () => {
      preferenceManager.recordToolUsage('Tool A');
      preferenceManager.recordWorkflowPattern(['Tool A', 'Tool B']);
      
      preferenceManager.resetPreferences();
      
      const stats = preferenceManager.getStatistics();
      expect(stats.totalToolsTracked).toBe(0);
      expect(stats.workflowPatternsLearned).toBe(0);
    });
  });

  describe('Statistics', () => {
    test('should provide accurate statistics', () => {
      preferenceManager.recordToolUsage('Tool A');
      preferenceManager.recordToolUsage('Tool A');
      preferenceManager.recordToolUsage('Tool B');
      preferenceManager.recordWorkflowPattern(['Tool A', 'Tool B']);
      
      const stats = preferenceManager.getStatistics();
      expect(stats.totalToolsTracked).toBe(2);
      expect(stats.totalInteractions).toBe(3);
      expect(stats.workflowPatternsLearned).toBe(1);
      expect(stats.learningEnabled).toBe(true);
    });
  });
});

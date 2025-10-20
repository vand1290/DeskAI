const LearningMode = require('../src/backend/LearningMode');
const PreferenceManager = require('../src/backend/PreferenceManager');
const InteractionTracker = require('../src/backend/InteractionTracker');

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

describe('LearningMode', () => {
  let preferenceManager;
  let interactionTracker;
  let learningMode;

  beforeEach(() => {
    global.localStorage.clear();
    preferenceManager = new PreferenceManager();
    interactionTracker = new InteractionTracker(preferenceManager);
    learningMode = new LearningMode(preferenceManager, interactionTracker);
  });

  describe('Initialization', () => {
    test('should initialize learning mode', () => {
      learningMode.initialize();
      expect(learningMode.isEnabled()).toBe(true);
    });
  });

  describe('Action Tracking', () => {
    test('should track actions when enabled', () => {
      learningMode.trackAction('Tool A');
      
      const stats = learningMode.getStatistics();
      expect(stats.totalInteractions).toBe(1);
    });

    test('should not track actions when disabled', () => {
      learningMode.setEnabled(false);
      learningMode.trackAction('Tool A');
      
      const stats = learningMode.getStatistics();
      expect(stats.totalInteractions).toBe(0);
    });
  });

  describe('Suggestions', () => {
    test('should return empty suggestions when disabled', () => {
      learningMode.setEnabled(false);
      const suggestions = learningMode.getSuggestions();
      
      expect(suggestions.mostUsed).toEqual([]);
      expect(suggestions.combined).toEqual([]);
    });

    test('should return suggestions when enabled', () => {
      learningMode.trackAction('Tool A');
      learningMode.trackAction('Tool A');
      learningMode.trackAction('Tool B');
      
      const suggestions = learningMode.getSuggestions();
      expect(suggestions.mostUsed.length).toBeGreaterThan(0);
    });

    test('should combine suggestions from multiple sources', () => {
      // Create usage pattern
      learningMode.trackAction('Tool A');
      learningMode.trackAction('Tool A');
      
      // Create workflow pattern
      learningMode.trackAction('Tool B');
      learningMode.trackAction('Tool C');
      
      const suggestions = learningMode.getSuggestions({ currentTool: 'Tool B' });
      expect(suggestions.combined.length).toBeGreaterThan(0);
    });
  });

  describe('Enable/Disable', () => {
    test('should enable and disable learning mode', () => {
      expect(learningMode.isEnabled()).toBe(true);
      
      learningMode.setEnabled(false);
      expect(learningMode.isEnabled()).toBe(false);
      
      learningMode.setEnabled(true);
      expect(learningMode.isEnabled()).toBe(true);
    });

    test('should clear session when disabled', () => {
      learningMode.trackAction('Tool A');
      learningMode.trackAction('Tool B');
      
      learningMode.setEnabled(false);
      
      const sessionInfo = interactionTracker.getSessionInfo();
      expect(sessionInfo.interactions).toBe(0);
    });
  });

  describe('Reset Functionality', () => {
    test('should reset all learning data', () => {
      learningMode.trackAction('Tool A');
      learningMode.trackAction('Tool B');
      
      learningMode.resetLearning();
      
      const stats = learningMode.getStatistics();
      expect(stats.totalInteractions).toBe(0);
      expect(stats.totalToolsTracked).toBe(0);
    });
  });

  describe('Data Export/Import', () => {
    test('should export learned data', () => {
      learningMode.trackAction('Tool A');
      
      const exported = learningMode.exportData();
      expect(typeof exported).toBe('string');
      
      const parsed = JSON.parse(exported);
      expect(parsed.toolUsage).toBeDefined();
    });

    test('should import valid data', () => {
      const testData = {
        toolUsage: { 'Test Tool': { count: 5, lastUsed: null, contexts: [] } },
        workflowPatterns: [],
        shortcuts: {},
        timePatterns: {},
        learningEnabled: true,
        lastUpdated: new Date().toISOString()
      };
      
      const success = learningMode.importData(JSON.stringify(testData));
      expect(success).toBe(true);
      
      const stats = learningMode.getStatistics();
      expect(stats.totalInteractions).toBe(5);
    });

    test('should reject invalid data', () => {
      const success = learningMode.importData('invalid json');
      expect(success).toBe(false);
    });
  });

  describe('Statistics', () => {
    test('should provide learning statistics', () => {
      learningMode.trackAction('Tool A');
      learningMode.trackAction('Tool B');
      
      const stats = learningMode.getStatistics();
      expect(stats.totalToolsTracked).toBeGreaterThan(0);
      expect(stats.totalInteractions).toBeGreaterThan(0);
      expect(stats.learningEnabled).toBe(true);
    });
  });

  describe('Learned Data Retrieval', () => {
    test('should get all learned data', () => {
      learningMode.trackAction('Tool A');
      
      const data = learningMode.getLearnedData();
      expect(data.toolUsage).toBeDefined();
      expect(data.workflowPatterns).toBeDefined();
      expect(data.timePatterns).toBeDefined();
    });
  });
});

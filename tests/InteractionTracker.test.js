const InteractionTracker = require('../src/backend/InteractionTracker');
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

describe('InteractionTracker', () => {
  let preferenceManager;
  let interactionTracker;

  beforeEach(() => {
    global.localStorage.clear();
    preferenceManager = new PreferenceManager();
    interactionTracker = new InteractionTracker(preferenceManager);
  });

  describe('Session Management', () => {
    test('should start a new session on first interaction', () => {
      interactionTracker.trackInteraction('Tool A');
      
      const sessionInfo = interactionTracker.getSessionInfo();
      expect(sessionInfo.interactions).toBe(1);
      expect(sessionInfo.tools).toEqual(['Tool A']);
    });

    test('should add interactions to current session', () => {
      interactionTracker.trackInteraction('Tool A');
      interactionTracker.trackInteraction('Tool B');
      interactionTracker.trackInteraction('Tool C');
      
      const sessionInfo = interactionTracker.getSessionInfo();
      expect(sessionInfo.interactions).toBe(3);
      expect(sessionInfo.tools).toEqual(['Tool A', 'Tool B', 'Tool C']);
    });

    test('should end session after timeout', () => {
      interactionTracker.trackInteraction('Tool A');
      
      // Simulate timeout by manually setting time in the past
      interactionTracker.lastInteractionTime = Date.now() - (6 * 60 * 1000); // 6 minutes ago
      
      interactionTracker.trackInteraction('Tool B');
      
      const sessionInfo = interactionTracker.getSessionInfo();
      expect(sessionInfo.interactions).toBe(1);
      expect(sessionInfo.tools).toEqual(['Tool B']);
    });

    test('should clear session', () => {
      interactionTracker.trackInteraction('Tool A');
      interactionTracker.trackInteraction('Tool B');
      
      interactionTracker.clearSession();
      
      const sessionInfo = interactionTracker.getSessionInfo();
      expect(sessionInfo.interactions).toBe(0);
      expect(sessionInfo.tools).toEqual([]);
    });
  });

  describe('Integration with PreferenceManager', () => {
    test('should record tool usage in preference manager', () => {
      interactionTracker.trackInteraction('Tool A');
      
      const stats = preferenceManager.getStatistics();
      expect(stats.totalInteractions).toBe(1);
    });

    test('should record workflow patterns', () => {
      interactionTracker.trackInteraction('Tool A');
      interactionTracker.trackInteraction('Tool B');
      
      const prefs = preferenceManager.getAllPreferences();
      expect(prefs.workflowPatterns.length).toBeGreaterThan(0);
    });

    test('should record time patterns', () => {
      interactionTracker.trackInteraction('Tool A');
      
      const prefs = preferenceManager.getAllPreferences();
      expect(prefs.timePatterns['Tool A']).toBeDefined();
    });
  });

  describe('Metadata Tracking', () => {
    test('should track interaction metadata', () => {
      const metadata = { priority: 'high', category: 'support' };
      interactionTracker.trackInteraction('Tool A', metadata);
      
      const sessionInfo = interactionTracker.getSessionInfo();
      expect(sessionInfo.interactions).toBe(1);
    });
  });
});

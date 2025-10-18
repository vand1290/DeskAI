import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { LearningManager } from '../learning';

const TEST_DATA_DIR = '/tmp/deskai-learning-test-data';

describe('LearningManager', () => {
  let learningManager: LearningManager;

  beforeEach(async () => {
    // Create a fresh test directory
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true });
    }
    fs.mkdirSync(TEST_DATA_DIR, { recursive: true });

    learningManager = new LearningManager(TEST_DATA_DIR);
    await learningManager.initialize();
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true });
    }
  });

  describe('initialization', () => {
    it('should create the data directory if it does not exist', async () => {
      const newDir = path.join(TEST_DATA_DIR, 'subdir');
      const newLearning = new LearningManager(newDir);
      await newLearning.initialize();

      expect(fs.existsSync(newDir)).toBe(true);
    });

    it('should load existing learning data from file', async () => {
      // Create test learning data
      const testData = {
        enabled: false,
        actions: [],
        toolUsage: {},
        workflows: [],
        frequentTopics: { 'test-topic': 5 },
        preferences: {},
        lastAnalyzed: Date.now()
      };

      const learningPath = path.join(TEST_DATA_DIR, 'learning.json');
      fs.writeFileSync(learningPath, JSON.stringify(testData));

      // Initialize a new learning manager
      const newLearning = new LearningManager(TEST_DATA_DIR);
      await newLearning.initialize();

      expect(newLearning.isEnabled()).toBe(false);
      const data = await newLearning.getLearningData();
      expect(data.frequentTopics).toContainEqual({ topic: 'test-topic', count: 5 });
    });

    it('should start with learning enabled by default', async () => {
      expect(learningManager.isEnabled()).toBe(true);
    });
  });

  describe('enable/disable', () => {
    it('should enable learning mode', async () => {
      await learningManager.setEnabled(true);
      expect(learningManager.isEnabled()).toBe(true);
    });

    it('should disable learning mode', async () => {
      await learningManager.setEnabled(false);
      expect(learningManager.isEnabled()).toBe(false);
    });

    it('should persist enabled state to disk', async () => {
      await learningManager.setEnabled(false);

      const learningPath = path.join(TEST_DATA_DIR, 'learning.json');
      const data = JSON.parse(fs.readFileSync(learningPath, 'utf-8'));
      expect(data.enabled).toBe(false);
    });
  });

  describe('trackAction', () => {
    it('should track a user action', async () => {
      await learningManager.trackAction('message', { messageLength: 10 });
      
      const stats = await learningManager.getStatistics();
      expect(stats.totalActions).toBe(1);
    });

    it('should not track actions when learning is disabled', async () => {
      await learningManager.setEnabled(false);
      await learningManager.trackAction('message');
      
      const stats = await learningManager.getStatistics();
      expect(stats.totalActions).toBe(0);
    });

    it('should limit stored actions to maximum', async () => {
      // Track more than the max
      for (let i = 0; i < 1100; i++) {
        await learningManager.trackAction('message');
      }
      
      const stats = await learningManager.getStatistics();
      expect(stats.totalActions).toBeLessThanOrEqual(1000);
    });

    it('should update tool usage when tracking actions', async () => {
      await learningManager.trackAction('view_analytics');
      await learningManager.trackAction('view_analytics');
      
      const data = await learningManager.getLearningData();
      const analytics = data.toolUsage.find(t => t.toolName === 'view_analytics');
      expect(analytics).toBeTruthy();
      expect(analytics?.usageCount).toBe(2);
    });

    it('should detect workflows after multiple actions', async () => {
      // Create a pattern: message -> view_analytics -> search
      // Need at least 10 actions to trigger workflow detection
      for (let i = 0; i < 4; i++) {
        await learningManager.trackAction('message');
        await learningManager.trackAction('view_analytics');
        await learningManager.trackAction('search');
      }
      // One more to reach 12 actions and trigger detection
      await learningManager.trackAction('message');
      
      const stats = await learningManager.getStatistics();
      expect(stats.workflowsDetected).toBeGreaterThan(0);
    });
  });

  describe('updateTopics', () => {
    it('should track frequent topics', async () => {
      await learningManager.updateTopics(['work', 'urgent']);
      await learningManager.updateTopics(['work']);
      
      const data = await learningManager.getLearningData();
      const workTopic = data.frequentTopics.find(t => t.topic === 'work');
      expect(workTopic?.count).toBe(2);
    });

    it('should not track topics when learning is disabled', async () => {
      await learningManager.setEnabled(false);
      await learningManager.updateTopics(['test']);
      
      const data = await learningManager.getLearningData();
      expect(data.frequentTopics).toHaveLength(0);
    });
  });

  describe('generateSuggestions', () => {
    it('should return empty array when learning is disabled', async () => {
      await learningManager.setEnabled(false);
      const suggestions = await learningManager.generateSuggestions();
      expect(suggestions).toEqual([]);
    });

    it('should generate tool suggestions based on usage', async () => {
      // Use view_analytics frequently
      for (let i = 0; i < 5; i++) {
        await learningManager.trackAction('view_analytics');
      }
      
      const suggestions = await learningManager.generateSuggestions();
      const toolSuggestion = suggestions.find(s => s.type === 'tool');
      expect(toolSuggestion).toBeTruthy();
      expect(toolSuggestion?.content).toContain('View Analytics');
    });

    it('should generate workflow suggestions', async () => {
      // Create a frequent workflow pattern
      for (let i = 0; i < 5; i++) {
        await learningManager.trackAction('message');
        await learningManager.trackAction('view_analytics');
        await learningManager.trackAction('search');
      }
      
      const suggestions = await learningManager.generateSuggestions();
      const workflowSuggestion = suggestions.find(s => s.type === 'workflow');
      expect(workflowSuggestion).toBeTruthy();
    });

    it('should generate topic suggestions', async () => {
      await learningManager.updateTopics(['work']);
      await learningManager.updateTopics(['work']);
      await learningManager.updateTopics(['work']);
      
      const suggestions = await learningManager.generateSuggestions();
      const topicSuggestion = suggestions.find(s => s.type === 'topic');
      expect(topicSuggestion).toBeTruthy();
      expect(topicSuggestion?.content).toContain('work');
    });

    it('should limit suggestions to requested amount', async () => {
      // Create many patterns
      for (let i = 0; i < 10; i++) {
        await learningManager.trackAction('message');
        await learningManager.trackAction('view_analytics');
      }
      
      const suggestions = await learningManager.generateSuggestions(3);
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('should include confidence scores in suggestions', async () => {
      for (let i = 0; i < 5; i++) {
        await learningManager.trackAction('view_analytics');
      }
      
      const suggestions = await learningManager.generateSuggestions();
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].confidence).toBeGreaterThan(0);
      expect(suggestions[0].confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('getStatistics', () => {
    it('should return learning statistics', async () => {
      await learningManager.trackAction('message');
      await learningManager.updateTopics(['work']);
      
      const stats = await learningManager.getStatistics();
      
      expect(stats.enabled).toBe(true);
      expect(stats.totalActions).toBe(1);
      expect(stats.toolsTracked).toBeGreaterThan(0);
      expect(stats.topicsTracked).toBe(1);
      expect(stats.lastAnalyzed).toBeTruthy();
    });
  });

  describe('getLearningData', () => {
    it('should return detailed learning data', async () => {
      await learningManager.trackAction('view_analytics');
      await learningManager.updateTopics(['work', 'urgent']);
      
      const data = await learningManager.getLearningData();
      
      expect(data.toolUsage).toBeTruthy();
      expect(data.workflows).toBeTruthy();
      expect(data.frequentTopics).toBeTruthy();
      expect(Array.isArray(data.toolUsage)).toBe(true);
      expect(Array.isArray(data.workflows)).toBe(true);
      expect(Array.isArray(data.frequentTopics)).toBe(true);
    });

    it('should sort tool usage by count', async () => {
      await learningManager.trackAction('message');
      await learningManager.trackAction('view_analytics');
      await learningManager.trackAction('view_analytics');
      
      const data = await learningManager.getLearningData();
      expect(data.toolUsage[0].usageCount).toBeGreaterThanOrEqual(data.toolUsage[1].usageCount);
    });

    it('should sort workflows by frequency', async () => {
      for (let i = 0; i < 10; i++) {
        await learningManager.trackAction('message');
        await learningManager.trackAction('search');
        await learningManager.trackAction('filter');
      }
      
      const data = await learningManager.getLearningData();
      if (data.workflows.length > 1) {
        expect(data.workflows[0].frequency).toBeGreaterThanOrEqual(data.workflows[1].frequency);
      }
    });

    it('should sort topics by count', async () => {
      await learningManager.updateTopics(['work']);
      await learningManager.updateTopics(['work']);
      await learningManager.updateTopics(['personal']);
      
      const data = await learningManager.getLearningData();
      expect(data.frequentTopics[0].count).toBeGreaterThanOrEqual(data.frequentTopics[1].count);
    });
  });

  describe('reset', () => {
    it('should clear all learning data', async () => {
      await learningManager.trackAction('message');
      await learningManager.updateTopics(['work']);
      
      await learningManager.reset();
      
      const stats = await learningManager.getStatistics();
      expect(stats.totalActions).toBe(0);
      expect(stats.toolsTracked).toBe(0);
      expect(stats.topicsTracked).toBe(0);
    });

    it('should preserve enabled state after reset', async () => {
      await learningManager.setEnabled(false);
      await learningManager.reset();
      
      expect(learningManager.isEnabled()).toBe(false);
    });

    it('should persist reset to disk', async () => {
      await learningManager.trackAction('message');
      await learningManager.reset();
      
      const learningPath = path.join(TEST_DATA_DIR, 'learning.json');
      const data = JSON.parse(fs.readFileSync(learningPath, 'utf-8'));
      expect(data.actions).toEqual([]);
      expect(data.toolUsage).toEqual({});
    });
  });

  describe('clearOldActions', () => {
    it('should remove actions older than specified days', async () => {
      // Track some actions
      await learningManager.trackAction('message');
      
      // Clear actions older than 0 days (all actions)
      await learningManager.clearOldActions(0);
      
      const stats = await learningManager.getStatistics();
      expect(stats.totalActions).toBe(0);
    });

    it('should keep recent actions', async () => {
      await learningManager.trackAction('message');
      
      // Clear actions older than 30 days (should keep recent ones)
      await learningManager.clearOldActions(30);
      
      const stats = await learningManager.getStatistics();
      expect(stats.totalActions).toBe(1);
    });
  });

  describe('persistence', () => {
    it('should persist learning data to disk', async () => {
      await learningManager.trackAction('message');
      await learningManager.updateTopics(['work']);
      
      const learningPath = path.join(TEST_DATA_DIR, 'learning.json');
      expect(fs.existsSync(learningPath)).toBe(true);
      
      const data = JSON.parse(fs.readFileSync(learningPath, 'utf-8'));
      expect(data.actions.length).toBeGreaterThan(0);
      expect(data.frequentTopics.work).toBe(1);
    });

    it('should reload persisted data correctly', async () => {
      await learningManager.trackAction('view_analytics');
      await learningManager.updateTopics(['urgent']);
      
      // Create new learning manager with same directory
      const newLearning = new LearningManager(TEST_DATA_DIR);
      await newLearning.initialize();
      
      const stats = await newLearning.getStatistics();
      expect(stats.totalActions).toBeGreaterThan(0);
      expect(stats.topicsTracked).toBe(1);
    });
  });
});

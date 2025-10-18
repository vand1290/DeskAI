import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { TaskChainManager, TaskChain, ChainTool } from '../taskChain';

const TEST_DATA_DIR = '/tmp/deskai-test-chains';

describe('TaskChainManager', () => {
  let taskChainManager: TaskChainManager;

  beforeEach(async () => {
    // Create a fresh test directory
    if (fs.existsSync(TEST_DATA_DIR)) {
      fs.rmSync(TEST_DATA_DIR, { recursive: true });
    }
    fs.mkdirSync(TEST_DATA_DIR, { recursive: true });

    taskChainManager = new TaskChainManager(TEST_DATA_DIR);
    await taskChainManager.initialize();
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
      const newManager = new TaskChainManager(newDir);
      await newManager.initialize();

      expect(fs.existsSync(newDir)).toBe(true);
    });

    it('should load existing chains from file', async () => {
      // Create a test chain file
      const testChains: TaskChain[] = [
        {
          id: 'test-1',
          name: 'Test Chain',
          steps: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          tags: []
        }
      ];

      const chainsPath = path.join(TEST_DATA_DIR, 'task-chains.json');
      fs.writeFileSync(chainsPath, JSON.stringify(testChains));

      // Initialize a new manager
      const newManager = new TaskChainManager(TEST_DATA_DIR);
      await newManager.initialize();

      const chain = await newManager.getChain('test-1');
      expect(chain).toBeTruthy();
      expect(chain?.name).toBe('Test Chain');
    });

    it('should register default tools on initialization', async () => {
      const tools = taskChainManager.getAvailableTools();
      
      expect(tools.length).toBeGreaterThan(0);
      expect(tools.some(t => t.type === 'scan')).toBe(true);
      expect(tools.some(t => t.type === 'ocr')).toBe(true);
      expect(tools.some(t => t.type === 'summarize')).toBe(true);
      expect(tools.some(t => t.type === 'save')).toBe(true);
    });
  });

  describe('createChain', () => {
    it('should create a new task chain', async () => {
      const chain = await taskChainManager.createChain('My Workflow');

      expect(chain.id).toBeTruthy();
      expect(chain.name).toBe('My Workflow');
      expect(chain.steps).toEqual([]);
      expect(chain.createdAt).toBeTruthy();
      expect(chain.updatedAt).toBeTruthy();
    });

    it('should create a chain with description and tags', async () => {
      const chain = await taskChainManager.createChain(
        'Document Processing',
        'Process and save documents',
        ['document', 'ocr']
      );

      expect(chain.name).toBe('Document Processing');
      expect(chain.description).toBe('Process and save documents');
      expect(chain.tags).toEqual(['document', 'ocr']);
    });

    it('should persist the chain to disk', async () => {
      await taskChainManager.createChain('Persisted Chain');

      const chainsPath = path.join(TEST_DATA_DIR, 'task-chains.json');
      const data = fs.readFileSync(chainsPath, 'utf-8');
      const chains = JSON.parse(data);

      expect(chains).toHaveLength(1);
      expect(chains[0].name).toBe('Persisted Chain');
    });
  });

  describe('addStep', () => {
    it('should add a step to a task chain', async () => {
      const chain = await taskChainManager.createChain('Test Chain');
      const step = await taskChainManager.addStep(chain.id, 'scan', 'Scan Document');

      expect(step.id).toBeTruthy();
      expect(step.type).toBe('scan');
      expect(step.name).toBe('Scan Document');
      expect(step.order).toBe(0);
    });

    it('should add a step with config', async () => {
      const chain = await taskChainManager.createChain('Test Chain');
      const config = { filename: 'output.pdf', quality: 'high' };
      const step = await taskChainManager.addStep(chain.id, 'save', 'Save File', config);

      expect(step.config).toEqual(config);
    });

    it('should throw error for non-existent chain', async () => {
      await expect(
        taskChainManager.addStep('non-existent', 'scan', 'Test')
      ).rejects.toThrow();
    });

    it('should throw error for unregistered tool type', async () => {
      const chain = await taskChainManager.createChain('Test Chain');
      
      await expect(
        taskChainManager.addStep(chain.id, 'invalid-tool' as TaskStep['type'], 'Test')
      ).rejects.toThrow();
    });

    it('should maintain correct order for multiple steps', async () => {
      const chain = await taskChainManager.createChain('Test Chain');
      const step1 = await taskChainManager.addStep(chain.id, 'scan', 'Step 1');
      const step2 = await taskChainManager.addStep(chain.id, 'ocr', 'Step 2');
      const step3 = await taskChainManager.addStep(chain.id, 'save', 'Step 3');

      expect(step1.order).toBe(0);
      expect(step2.order).toBe(1);
      expect(step3.order).toBe(2);
    });

    it('should persist steps to disk', async () => {
      const chain = await taskChainManager.createChain('Test Chain');
      await taskChainManager.addStep(chain.id, 'scan', 'Scan');
      await taskChainManager.addStep(chain.id, 'ocr', 'OCR');

      const chainsPath = path.join(TEST_DATA_DIR, 'task-chains.json');
      const data = fs.readFileSync(chainsPath, 'utf-8');
      const chains = JSON.parse(data);

      expect(chains[0].steps).toHaveLength(2);
    });
  });

  describe('updateStep', () => {
    it('should update a step in a chain', async () => {
      const chain = await taskChainManager.createChain('Test Chain');
      const step = await taskChainManager.addStep(chain.id, 'scan', 'Original Name');

      const updated = await taskChainManager.updateStep(chain.id, step.id, {
        name: 'Updated Name',
        config: { quality: 'high' }
      });

      expect(updated.name).toBe('Updated Name');
      expect(updated.config).toEqual({ quality: 'high' });
    });

    it('should throw error for non-existent chain', async () => {
      await expect(
        taskChainManager.updateStep('non-existent', 'step-id', { name: 'Test' })
      ).rejects.toThrow();
    });

    it('should throw error for non-existent step', async () => {
      const chain = await taskChainManager.createChain('Test Chain');
      
      await expect(
        taskChainManager.updateStep(chain.id, 'non-existent', { name: 'Test' })
      ).rejects.toThrow();
    });
  });

  describe('removeStep', () => {
    it('should remove a step from a chain', async () => {
      const chain = await taskChainManager.createChain('Test Chain');
      const step = await taskChainManager.addStep(chain.id, 'scan', 'Scan');

      const removed = await taskChainManager.removeStep(chain.id, step.id);
      expect(removed).toBe(true);

      const updatedChain = await taskChainManager.getChain(chain.id);
      expect(updatedChain?.steps).toHaveLength(0);
    });

    it('should reorder remaining steps after removal', async () => {
      const chain = await taskChainManager.createChain('Test Chain');
      await taskChainManager.addStep(chain.id, 'scan', 'Step 1');
      const step2 = await taskChainManager.addStep(chain.id, 'ocr', 'Step 2');
      await taskChainManager.addStep(chain.id, 'save', 'Step 3');

      await taskChainManager.removeStep(chain.id, step2.id);

      const updatedChain = await taskChainManager.getChain(chain.id);
      expect(updatedChain?.steps).toHaveLength(2);
      expect(updatedChain?.steps[0].order).toBe(0);
      expect(updatedChain?.steps[1].order).toBe(1);
    });

    it('should return false for non-existent step', async () => {
      const chain = await taskChainManager.createChain('Test Chain');
      const removed = await taskChainManager.removeStep(chain.id, 'non-existent');
      
      expect(removed).toBe(false);
    });
  });

  describe('reorderSteps', () => {
    it('should reorder steps in a chain', async () => {
      const chain = await taskChainManager.createChain('Test Chain');
      const step1 = await taskChainManager.addStep(chain.id, 'scan', 'Step 1');
      const step2 = await taskChainManager.addStep(chain.id, 'ocr', 'Step 2');
      const step3 = await taskChainManager.addStep(chain.id, 'save', 'Step 3');

      await taskChainManager.reorderSteps(chain.id, [step3.id, step1.id, step2.id]);

      const updatedChain = await taskChainManager.getChain(chain.id);
      expect(updatedChain?.steps[0].id).toBe(step3.id);
      expect(updatedChain?.steps[0].order).toBe(0);
      expect(updatedChain?.steps[1].id).toBe(step1.id);
      expect(updatedChain?.steps[1].order).toBe(1);
      expect(updatedChain?.steps[2].id).toBe(step2.id);
      expect(updatedChain?.steps[2].order).toBe(2);
    });

    it('should throw error for invalid step IDs', async () => {
      const chain = await taskChainManager.createChain('Test Chain');
      await taskChainManager.addStep(chain.id, 'scan', 'Step 1');

      await expect(
        taskChainManager.reorderSteps(chain.id, ['invalid-id'])
      ).rejects.toThrow();
    });
  });

  describe('getChain', () => {
    it('should retrieve an existing chain', async () => {
      const created = await taskChainManager.createChain('Test Chain');
      const retrieved = await taskChainManager.getChain(created.id);

      expect(retrieved).toBeTruthy();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Test Chain');
    });

    it('should return null for non-existent chain', async () => {
      const result = await taskChainManager.getChain('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('listChains', () => {
    it('should return an empty array when no chains exist', async () => {
      const list = await taskChainManager.listChains();
      expect(list).toEqual([]);
    });

    it('should list all chains', async () => {
      await taskChainManager.createChain('Chain 1');
      await taskChainManager.createChain('Chain 2');

      const list = await taskChainManager.listChains();
      expect(list).toHaveLength(2);
    });

    it('should sort chains by most recent first', async () => {
      const chain1 = await taskChainManager.createChain('Chain 1');
      await new Promise(resolve => setTimeout(resolve, 10));
      const chain2 = await taskChainManager.createChain('Chain 2');

      const list = await taskChainManager.listChains();
      expect(list[0].id).toBe(chain2.id);
      expect(list[1].id).toBe(chain1.id);
    });

    it('should filter chains by tags', async () => {
      await taskChainManager.createChain('Chain 1', undefined, ['tag1']);
      await taskChainManager.createChain('Chain 2', undefined, ['tag2']);
      await taskChainManager.createChain('Chain 3', undefined, ['tag1', 'tag2']);

      const filtered = await taskChainManager.listChains(['tag1']);
      expect(filtered).toHaveLength(2);
    });
  });

  describe('deleteChain', () => {
    it('should delete an existing chain', async () => {
      const chain = await taskChainManager.createChain('To Delete');
      const deleted = await taskChainManager.deleteChain(chain.id);

      expect(deleted).toBe(true);

      const retrieved = await taskChainManager.getChain(chain.id);
      expect(retrieved).toBeNull();
    });

    it('should return false for non-existent chain', async () => {
      const deleted = await taskChainManager.deleteChain('non-existent');
      expect(deleted).toBe(false);
    });

    it('should persist deletion to disk', async () => {
      const chain = await taskChainManager.createChain('To Delete');
      await taskChainManager.deleteChain(chain.id);

      const chainsPath = path.join(TEST_DATA_DIR, 'task-chains.json');
      const data = fs.readFileSync(chainsPath, 'utf-8');
      const chains = JSON.parse(data);

      expect(chains).toHaveLength(0);
    });
  });

  describe('executeChain', () => {
    it('should execute a simple chain', async () => {
      const chain = await taskChainManager.createChain('Simple Chain');
      await taskChainManager.addStep(chain.id, 'scan', 'Scan');
      await taskChainManager.addStep(chain.id, 'ocr', 'OCR');

      const result = await taskChainManager.executeChain(chain.id, 'test-input');

      expect(result.success).toBe(true);
      expect(result.stepResults).toHaveLength(2);
      expect(result.stepResults[0].success).toBe(true);
      expect(result.stepResults[1].success).toBe(true);
    });

    it('should pass output from one step to the next', async () => {
      const chain = await taskChainManager.createChain('Chained Chain');
      await taskChainManager.addStep(chain.id, 'scan', 'Scan');
      await taskChainManager.addStep(chain.id, 'ocr', 'OCR');
      await taskChainManager.addStep(chain.id, 'summarize', 'Summarize');

      const result = await taskChainManager.executeChain(chain.id, 'initial-input');

      expect(result.success).toBe(true);
      expect(result.stepResults).toHaveLength(3);
      // Each step should have output
      result.stepResults.forEach(stepResult => {
        expect(stepResult.output).toBeTruthy();
      });
    });

    it('should stop execution on error', async () => {
      const chain = await taskChainManager.createChain('Error Chain');
      await taskChainManager.addStep(chain.id, 'scan', 'Scan');
      
      // Register a tool that will fail
      taskChainManager.registerTool({
        type: 'failing-tool',
        name: 'Failing Tool',
        description: 'A tool that always fails',
        execute: async () => {
          throw new Error('Tool execution failed');
        }
      });
      
      await taskChainManager.addStep(chain.id, 'failing-tool' as TaskStep['type'], 'Failing Step');
      await taskChainManager.addStep(chain.id, 'save', 'Save');

      const result = await taskChainManager.executeChain(chain.id);

      expect(result.success).toBe(false);
      expect(result.stepResults).toHaveLength(2); // Only 2 steps executed before failure
      expect(result.stepResults[0].success).toBe(true);
      expect(result.stepResults[1].success).toBe(false);
      expect(result.stepResults[1].error).toBeTruthy();
    });

    it('should throw error for non-existent chain', async () => {
      await expect(
        taskChainManager.executeChain('non-existent')
      ).rejects.toThrow();
    });

    it('should record execution times', async () => {
      const chain = await taskChainManager.createChain('Timed Chain');
      await taskChainManager.addStep(chain.id, 'scan', 'Scan');

      const result = await taskChainManager.executeChain(chain.id);

      expect(result.startTime).toBeTruthy();
      expect(result.endTime).toBeTruthy();
      expect(result.endTime).toBeGreaterThanOrEqual(result.startTime);
      
      result.stepResults.forEach(stepResult => {
        expect(stepResult.startTime).toBeTruthy();
        expect(stepResult.endTime).toBeTruthy();
        expect(stepResult.endTime).toBeGreaterThanOrEqual(stepResult.startTime);
      });
    });
  });

  describe('registerTool', () => {
    it('should allow registering custom tools', () => {
      const customTool: ChainTool = {
        type: 'custom-tool',
        name: 'Custom Tool',
        description: 'A custom tool for testing',
        execute: async (input: unknown) => {
          return { result: 'custom output', input };
        }
      };

      taskChainManager.registerTool(customTool);

      const tools = taskChainManager.getAvailableTools();
      expect(tools.some(t => t.type === 'custom-tool')).toBe(true);
    });

    it('should allow using custom tools in chains', async () => {
      const customTool: ChainTool = {
        type: 'custom-tool',
        name: 'Custom Tool',
        description: 'A custom tool',
        execute: async (input: unknown) => {
          return { result: 'custom', input };
        }
      };

      taskChainManager.registerTool(customTool);

      const chain = await taskChainManager.createChain('Custom Chain');
      await taskChainManager.addStep(chain.id, 'custom-tool' as TaskStep['type'], 'Custom Step');

      const result = await taskChainManager.executeChain(chain.id, 'test');

      expect(result.success).toBe(true);
      expect(result.stepResults[0].output).toEqual({ result: 'custom', input: 'test' });
    });
  });

  describe('exportChains', () => {
    it('should export all chains', async () => {
      await taskChainManager.createChain('Chain 1');
      await taskChainManager.createChain('Chain 2');

      const exported = await taskChainManager.exportChains();

      expect(exported).toHaveLength(2);
      expect(exported[0].name).toBeTruthy();
      expect(exported[1].name).toBeTruthy();
    });

    it('should include full chain data with steps', async () => {
      const chain = await taskChainManager.createChain('Full Chain');
      await taskChainManager.addStep(chain.id, 'scan', 'Scan');
      await taskChainManager.addStep(chain.id, 'ocr', 'OCR');

      const exported = await taskChainManager.exportChains();

      expect(exported[0].steps).toHaveLength(2);
    });
  });

  describe('clearAll', () => {
    it('should clear all chains', async () => {
      await taskChainManager.createChain('Chain 1');
      await taskChainManager.createChain('Chain 2');

      await taskChainManager.clearAll();

      const list = await taskChainManager.listChains();
      expect(list).toEqual([]);
    });

    it('should persist clear to disk', async () => {
      await taskChainManager.createChain('Test Chain');
      await taskChainManager.clearAll();

      const chainsPath = path.join(TEST_DATA_DIR, 'task-chains.json');
      const data = fs.readFileSync(chainsPath, 'utf-8');
      const chains = JSON.parse(data);

      expect(chains).toEqual([]);
    });
  });
});

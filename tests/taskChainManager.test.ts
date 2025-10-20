import { TaskChainManager } from '../src/main/taskChainManager';
import { ToolRegistry } from '../src/main/toolRegistry';
import { TaskChain, Tool } from '../src/shared/types';

describe('TaskChainManager', () => {
  let manager: TaskChainManager;
  let registry: ToolRegistry;

  beforeEach(() => {
    manager = new TaskChainManager();
    registry = new ToolRegistry();
  });

  const mockSuccessTool: Tool = {
    type: 'success',
    name: 'Success Tool',
    description: 'Always succeeds',
    execute: async (input: any) => ({ result: 'success', input }),
  };

  const mockFailureTool: Tool = {
    type: 'failure',
    name: 'Failure Tool',
    description: 'Always fails',
    execute: async () => {
      throw new Error('Tool failed');
    },
  };

  const mockChain: TaskChain = {
    id: 'test-chain-1',
    name: 'Test Chain',
    description: 'A test chain',
    tasks: [
      {
        id: 'task-1',
        name: 'Task 1',
        type: 'success',
        parameters: {},
      },
      {
        id: 'task-2',
        name: 'Task 2',
        type: 'success',
        parameters: { param1: 'value1' },
      },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('executeChain', () => {
    it('should execute all tasks successfully', async () => {
      registry.registerTool(mockSuccessTool);

      // Mock the registry for this test
      const originalRegistry = require('../src/main/toolRegistry').toolRegistry;
      require('../src/main/toolRegistry').toolRegistry = registry;

      const result = await manager.executeChain(mockChain);

      expect(result.success).toBe(true);
      expect(result.chainId).toBe('test-chain-1');
      expect(result.results).toHaveLength(2);
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(true);

      // Restore original registry
      require('../src/main/toolRegistry').toolRegistry = originalRegistry;
    });

    it('should stop execution on first failure', async () => {
      registry.registerTool(mockSuccessTool);
      registry.registerTool(mockFailureTool);

      const failingChain: TaskChain = {
        ...mockChain,
        tasks: [
          {
            id: 'task-1',
            name: 'Task 1',
            type: 'success',
            parameters: {},
          },
          {
            id: 'task-2',
            name: 'Task 2',
            type: 'failure',
            parameters: {},
          },
          {
            id: 'task-3',
            name: 'Task 3',
            type: 'success',
            parameters: {},
          },
        ],
      };

      const originalRegistry = require('../src/main/toolRegistry').toolRegistry;
      require('../src/main/toolRegistry').toolRegistry = registry;

      const result = await manager.executeChain(failingChain);

      expect(result.success).toBe(false);
      expect(result.results).toHaveLength(2); // Only first two tasks
      expect(result.results[0].success).toBe(true);
      expect(result.results[1].success).toBe(false);

      require('../src/main/toolRegistry').toolRegistry = originalRegistry;
    });

    it('should pass output from one task to the next', async () => {
      const chainedTool: Tool = {
        type: 'chained',
        name: 'Chained Tool',
        description: 'Uses input from previous task',
        execute: async (input: any) => {
          return { 
            result: 'processed',
            previousInput: input,
          };
        },
      };

      registry.registerTool(chainedTool);

      const chainedTasks: TaskChain = {
        ...mockChain,
        tasks: [
          {
            id: 'task-1',
            name: 'Task 1',
            type: 'chained',
            parameters: {},
          },
          {
            id: 'task-2',
            name: 'Task 2',
            type: 'chained',
            parameters: {},
          },
        ],
      };

      const originalRegistry = require('../src/main/toolRegistry').toolRegistry;
      require('../src/main/toolRegistry').toolRegistry = registry;

      const result = await manager.executeChain(chainedTasks);

      expect(result.success).toBe(true);
      expect(result.results[1].data.previousInput).toBeDefined();

      require('../src/main/toolRegistry').toolRegistry = originalRegistry;
    });
  });

  describe('validateChain', () => {
    it('should validate a correct chain', () => {
      registry.registerTool(mockSuccessTool);

      const originalRegistry = require('../src/main/toolRegistry').toolRegistry;
      require('../src/main/toolRegistry').toolRegistry = registry;

      const validation = manager.validateChain(mockChain);

      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);

      require('../src/main/toolRegistry').toolRegistry = originalRegistry;
    });

    it('should reject chain with no tasks', () => {
      const emptyChain: TaskChain = {
        ...mockChain,
        tasks: [],
      };

      const validation = manager.validateChain(emptyChain);

      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Chain must contain at least one task');
    });

    it('should reject chain with unknown tool type', () => {
      const invalidChain: TaskChain = {
        ...mockChain,
        tasks: [
          {
            id: 'task-1',
            name: 'Task 1',
            type: 'unknown-tool',
            parameters: {},
          },
        ],
      };

      const validation = manager.validateChain(invalidChain);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Unknown tool type'))).toBe(true);
    });

    it('should reject task with missing id or type', () => {
      const invalidChain: TaskChain = {
        ...mockChain,
        tasks: [
          {
            id: '',
            name: 'Task 1',
            type: 'success',
            parameters: {},
          },
        ],
      };

      const validation = manager.validateChain(invalidChain);

      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('Invalid task'))).toBe(true);
    });
  });
});

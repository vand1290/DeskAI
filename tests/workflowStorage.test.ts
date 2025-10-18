import * as fs from 'fs';
import * as path from 'path';
import { WorkflowStorage } from '../src/main/workflowStorage';
import { TaskChain } from '../src/shared/types';

describe('WorkflowStorage', () => {
  let storage: WorkflowStorage;
  let testDir: string;

  beforeEach(() => {
    testDir = path.join(process.cwd(), 'test-workflows');
    storage = new WorkflowStorage(testDir);
  });

  afterEach(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(testDir, file));
      });
      fs.rmdirSync(testDir);
    }
  });

  const mockChain: TaskChain = {
    id: 'test-workflow-1',
    name: 'Test Workflow',
    description: 'A test workflow',
    tasks: [
      {
        id: 'task-1',
        name: 'Task 1',
        type: 'test',
        parameters: { param1: 'value1' },
      },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-02'),
  };

  describe('saveWorkflow', () => {
    it('should save workflow to disk', async () => {
      await storage.saveWorkflow(mockChain);

      const filePath = path.join(testDir, `${mockChain.id}.json`);
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it('should save workflow with correct data', async () => {
      await storage.saveWorkflow(mockChain);

      const filePath = path.join(testDir, `${mockChain.id}.json`);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const savedData = JSON.parse(fileContent);

      expect(savedData.id).toBe(mockChain.id);
      expect(savedData.name).toBe(mockChain.name);
      expect(savedData.tasks).toHaveLength(1);
    });
  });

  describe('loadWorkflow', () => {
    it('should load saved workflow', async () => {
      await storage.saveWorkflow(mockChain);

      const loaded = await storage.loadWorkflow(mockChain.id);

      expect(loaded).not.toBeNull();
      expect(loaded?.id).toBe(mockChain.id);
      expect(loaded?.name).toBe(mockChain.name);
      expect(loaded?.tasks).toHaveLength(1);
    });

    it('should return null for non-existent workflow', async () => {
      const loaded = await storage.loadWorkflow('non-existent');
      expect(loaded).toBeNull();
    });

    it('should restore Date objects', async () => {
      await storage.saveWorkflow(mockChain);

      const loaded = await storage.loadWorkflow(mockChain.id);

      expect(loaded?.createdAt).toBeInstanceOf(Date);
      expect(loaded?.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('listWorkflows', () => {
    it('should return empty array when no workflows exist', async () => {
      const workflows = await storage.listWorkflows();
      expect(workflows).toEqual([]);
    });

    it('should list all saved workflows', async () => {
      const chain1 = { ...mockChain, id: 'workflow-1' };
      const chain2 = { ...mockChain, id: 'workflow-2' };

      await storage.saveWorkflow(chain1);
      await storage.saveWorkflow(chain2);

      const workflows = await storage.listWorkflows();

      expect(workflows).toHaveLength(2);
      expect(workflows.map(w => w.id)).toContain('workflow-1');
      expect(workflows.map(w => w.id)).toContain('workflow-2');
    });
  });

  describe('deleteWorkflow', () => {
    it('should delete existing workflow', async () => {
      await storage.saveWorkflow(mockChain);

      const deleted = await storage.deleteWorkflow(mockChain.id);

      expect(deleted).toBe(true);
      
      const exists = await storage.workflowExists(mockChain.id);
      expect(exists).toBe(false);
    });

    it('should return false when deleting non-existent workflow', async () => {
      const deleted = await storage.deleteWorkflow('non-existent');
      expect(deleted).toBe(false);
    });
  });

  describe('workflowExists', () => {
    it('should return true for existing workflow', async () => {
      await storage.saveWorkflow(mockChain);

      const exists = await storage.workflowExists(mockChain.id);
      expect(exists).toBe(true);
    });

    it('should return false for non-existent workflow', async () => {
      const exists = await storage.workflowExists('non-existent');
      expect(exists).toBe(false);
    });
  });
});

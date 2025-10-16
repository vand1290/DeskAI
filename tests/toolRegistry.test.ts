import { ToolRegistry } from '../src/main/toolRegistry';
import { Tool } from '../src/shared/types';

describe('ToolRegistry', () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    registry = new ToolRegistry();
  });

  const mockTool: Tool = {
    type: 'test',
    name: 'Test Tool',
    description: 'A test tool',
    execute: async (input: any) => ({ result: 'test' }),
  };

  describe('registerTool', () => {
    it('should register a new tool', () => {
      registry.registerTool(mockTool);
      expect(registry.hasTool('test')).toBe(true);
    });

    it('should replace existing tool with same type', () => {
      registry.registerTool(mockTool);
      const updatedTool = { ...mockTool, name: 'Updated Test Tool' };
      registry.registerTool(updatedTool);
      
      const retrieved = registry.getTool('test');
      expect(retrieved?.name).toBe('Updated Test Tool');
    });
  });

  describe('getTool', () => {
    it('should return registered tool', () => {
      registry.registerTool(mockTool);
      const tool = registry.getTool('test');
      expect(tool).toBeDefined();
      expect(tool?.type).toBe('test');
    });

    it('should return undefined for non-existent tool', () => {
      const tool = registry.getTool('nonexistent');
      expect(tool).toBeUndefined();
    });
  });

  describe('getAllTools', () => {
    it('should return empty array when no tools registered', () => {
      const tools = registry.getAllTools();
      expect(tools).toEqual([]);
    });

    it('should return all registered tools', () => {
      const tool1 = { ...mockTool, type: 'tool1' };
      const tool2 = { ...mockTool, type: 'tool2' };
      
      registry.registerTool(tool1);
      registry.registerTool(tool2);
      
      const tools = registry.getAllTools();
      expect(tools).toHaveLength(2);
      expect(tools.map(t => t.type)).toContain('tool1');
      expect(tools.map(t => t.type)).toContain('tool2');
    });
  });

  describe('hasTool', () => {
    it('should return true for registered tool', () => {
      registry.registerTool(mockTool);
      expect(registry.hasTool('test')).toBe(true);
    });

    it('should return false for non-registered tool', () => {
      expect(registry.hasTool('test')).toBe(false);
    });
  });

  describe('unregisterTool', () => {
    it('should remove registered tool', () => {
      registry.registerTool(mockTool);
      expect(registry.hasTool('test')).toBe(true);
      
      const result = registry.unregisterTool('test');
      expect(result).toBe(true);
      expect(registry.hasTool('test')).toBe(false);
    });

    it('should return false when removing non-existent tool', () => {
      const result = registry.unregisterTool('nonexistent');
      expect(result).toBe(false);
    });
  });
});

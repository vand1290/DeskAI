import { Tool } from '../shared/types';

/**
 * ToolRegistry manages all available tools/actions that can be used in task chains
 */
export class ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  /**
   * Register a new tool
   */
  registerTool(tool: Tool): void {
    this.tools.set(tool.type, tool);
  }

  /**
   * Get a tool by type
   */
  getTool(type: string): Tool | undefined {
    return this.tools.get(type);
  }

  /**
   * Get all registered tools
   */
  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Check if a tool exists
   */
  hasTool(type: string): boolean {
    return this.tools.has(type);
  }

  /**
   * Unregister a tool
   */
  unregisterTool(type: string): boolean {
    return this.tools.delete(type);
  }
}

// Singleton instance
export const toolRegistry = new ToolRegistry();

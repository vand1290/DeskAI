/**
 * Core meta-agent logic for DeskAI
 * 100% offline operation with deterministic behavior
 */

import { ModelRegistry } from './models';
import { ToolRegistry } from './tools';
import { RequestRouter, AgentRequest, AgentResponse } from './router';

/**
 * Main Agent class that orchestrates everything
 */
export class Agent {
  private modelRegistry: ModelRegistry;
  private toolRegistry: ToolRegistry;
  private router: RequestRouter;

  constructor() {
    this.modelRegistry = new ModelRegistry();
    this.toolRegistry = new ToolRegistry();
    this.router = new RequestRouter(this.modelRegistry, this.toolRegistry);
  }

  /**
   * Process a user request
   * This is the main entry point for the agent
   */
  async processRequest(request: AgentRequest): Promise<AgentResponse> {
    // Validate request
    if (!request.query || request.query.trim().length === 0) {
      throw new Error('Query cannot be empty');
    }

    // Route and process
    try {
      const response = await this.router.route(request);
      return response;
    } catch (error) {
      return {
        result: `Error processing request: ${error}`,
        route: 'error',
        toolsUsed: [],
        deterministic: true
      };
    }
  }

  /**
   * Get available models
   */
  getAvailableModels(): string[] {
    return this.modelRegistry.listModels();
  }

  /**
   * Get available tools
   */
  getAvailableTools(): Array<{ name: string; description: string }> {
    return this.toolRegistry.listTools();
  }

  /**
   * Execute a specific tool directly
   */
  async executeTool(toolName: string, params: any): Promise<any> {
    return await this.toolRegistry.executeTool(toolName, params);
  }

  /**
   * Get routing information for debugging
   */
  getRoutingInfo() {
    return this.router.getRoutingInfo();
  }
}

// Export default instance
export default new Agent();

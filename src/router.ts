/**
 * Request parsing, classification and routing logic
 */

import { ModelRegistry } from './models';
import { ToolRegistry } from './tools';

export interface AgentRequest {
  query: string;
  model?: string;
  context?: any;
}

export interface AgentResponse {
  result: string;
  route: string;
  toolsUsed: string[];
  deterministic: boolean;
}

/**
 * Router for classifying and routing requests
 */
export class RequestRouter {
  private modelRegistry: ModelRegistry;
  private toolRegistry: ToolRegistry;

  constructor(modelRegistry: ModelRegistry, toolRegistry: ToolRegistry) {
    this.modelRegistry = modelRegistry;
    this.toolRegistry = toolRegistry;
  }

  /**
   * Parse and classify the request to determine routing
   */
  classifyRequest(request: AgentRequest): {
    type: 'model' | 'tool' | 'hybrid';
    suggestedModel?: string;
    suggestedTools: string[];
  } {
    const query = request.query.toLowerCase();

    // Check for tool keywords
    const toolKeywords = [
      { keywords: ['write', 'save', 'create file'], tool: 'file_write' },
      { keywords: ['read', 'open', 'load file'], tool: 'file_read' },
      { keywords: ['calculate', 'compute', 'math', 'arithmetic'], tool: 'calculator' },
      { keywords: ['analyze', 'count', 'words', 'characters'], tool: 'text_analysis' }
    ];

    const suggestedTools: string[] = [];
    for (const { keywords, tool } of toolKeywords) {
      if (keywords.some(kw => query.includes(kw))) {
        suggestedTools.push(tool);
      }
    }

    // Determine request type
    let type: 'model' | 'tool' | 'hybrid' = 'model';
    if (suggestedTools.length > 0) {
      type = query.includes('explain') || query.includes('how') || query.includes('what') 
        ? 'hybrid' 
        : 'tool';
    }

    // Determine suggested model
    const suggestedModel = request.model || this.modelRegistry.listModels()[0];

    return {
      type,
      suggestedModel,
      suggestedTools
    };
  }

  /**
   * Route the request to appropriate model/tool
   */
  async route(request: AgentRequest): Promise<AgentResponse> {
    const classification = this.classifyRequest(request);
    const toolsUsed: string[] = [];
    let result = '';

    // Execute tools if needed
    if (classification.type === 'tool' || classification.type === 'hybrid') {
      for (const toolName of classification.suggestedTools) {
        const tool = this.toolRegistry.getTool(toolName);
        if (tool) {
          toolsUsed.push(toolName);
          // Note: In production, would extract params from query
          // For now, this is a stub showing the architecture
          result += `[Tool ${toolName} would be executed here]\n`;
        }
      }
    }

    // Use model if needed
    if (classification.type === 'model' || classification.type === 'hybrid') {
      const modelName = classification.suggestedModel || 'qwen2.5:7b';
      const model = this.modelRegistry.getModel(modelName);
      
      if (model) {
        await model.load();
        const modelResponse = await model.infer(request.query);
        result += modelResponse;
      } else {
        result += `Model ${modelName} not available`;
      }
    }

    return {
      result: result.trim(),
      route: `${classification.type}:${classification.suggestedModel || 'none'}`,
      toolsUsed,
      deterministic: true
    };
  }

  /**
   * Get available routes information
   */
  getRoutingInfo(): {
    availableModels: string[];
    availableTools: Array<{ name: string; description: string }>;
  } {
    return {
      availableModels: this.modelRegistry.listModels(),
      availableTools: this.toolRegistry.listTools()
    };
  }
}

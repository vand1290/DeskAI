import { invoke } from '@tauri-apps/api/core';

export interface ModelRequest {
  prompt: string;
  model: string;
  temperature?: number;
}

export interface ModelResponse {
  response: string;
  model: string;
  tokens_used: number;
}

export interface ToolRequest {
  tool: string;
  parameters: Record<string, string>;
}

export interface ToolResponse {
  result: string;
  tool: string;
}

export interface AvailableModel {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}

/**
 * Route a request to the appropriate local model
 */
export async function routeRequest(request: ModelRequest): Promise<ModelResponse> {
  return invoke<ModelResponse>('route_request', { request });
}

/**
 * Execute a local tool
 */
export async function executeTool(request: ToolRequest): Promise<ToolResponse> {
  return invoke<ToolResponse>('execute_tool', { request });
}

/**
 * Get list of available models
 */
export async function getAvailableModels(): Promise<AvailableModel[]> {
  return invoke<AvailableModel[]>('get_available_models');
}

/**
 * Get list of available tools
 */
export async function getAvailableTools(): Promise<string[]> {
  return invoke<string[]>('get_available_tools');
}

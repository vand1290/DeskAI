/**
 * Task interface representing a single action in the chain
 */
export interface Task {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
}

/**
 * Task chain representing a sequence of tasks
 */
export interface TaskChain {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task execution result
 */
export interface TaskResult {
  taskId: string;
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Task chain execution result
 */
export interface ChainExecutionResult {
  chainId: string;
  success: boolean;
  results: TaskResult[];
  startTime: Date;
  endTime: Date;
}

/**
 * Tool definition for the task registry
 */
export interface Tool {
  type: string;
  name: string;
  description: string;
  execute: (input: any, parameters: Record<string, any>) => Promise<any>;
  parameters?: Record<string, { type: string; required: boolean; description: string }>;
}

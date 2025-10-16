import { TaskChain, Task, ChainExecutionResult, TaskResult } from '../shared/types';
import { toolRegistry } from './toolRegistry';

/**
 * TaskChainManager handles the execution of task chains
 */
export class TaskChainManager {
  /**
   * Execute a task chain
   */
  async executeChain(chain: TaskChain): Promise<ChainExecutionResult> {
    const startTime = new Date();
    const results: TaskResult[] = [];
    let previousOutput: any = null;

    try {
      for (const task of chain.tasks) {
        const result = await this.executeTask(task, previousOutput);
        results.push(result);

        if (!result.success) {
          // Stop execution on first failure
          return {
            chainId: chain.id,
            success: false,
            results,
            startTime,
            endTime: new Date(),
          };
        }

        previousOutput = result.data;
      }

      return {
        chainId: chain.id,
        success: true,
        results,
        startTime,
        endTime: new Date(),
      };
    } catch (error) {
      return {
        chainId: chain.id,
        success: false,
        results,
        startTime,
        endTime: new Date(),
      };
    }
  }

  /**
   * Execute a single task
   */
  private async executeTask(task: Task, input: any): Promise<TaskResult> {
    try {
      const tool = toolRegistry.getTool(task.type);
      
      if (!tool) {
        return {
          taskId: task.id,
          success: false,
          error: `Tool not found: ${task.type}`,
        };
      }

      const data = await tool.execute(input, task.parameters);

      return {
        taskId: task.id,
        success: true,
        data,
      };
    } catch (error) {
      return {
        taskId: task.id,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Validate a task chain before execution
   */
  validateChain(chain: TaskChain): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!chain.tasks || chain.tasks.length === 0) {
      errors.push('Chain must contain at least one task');
    }

    for (const task of chain.tasks) {
      if (!task.id || !task.type) {
        errors.push(`Invalid task: missing id or type`);
      }

      if (!toolRegistry.hasTool(task.type)) {
        errors.push(`Unknown tool type: ${task.type}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export const taskChainManager = new TaskChainManager();

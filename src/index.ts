import { MemoryManager } from './memory.js';
import { Agent } from './agent.js';
import { Router } from './router.js';

/**
 * Initialize and export the DeskAI system
 */
export async function initializeDeskAI(dataDir: string = './out') {
  const memory = new MemoryManager(dataDir);
  await memory.initialize();

  const agent = new Agent(memory, { memoryEnabled: true });
  const router = new Router(memory, agent, dataDir);

  return {
    memory,
    agent,
    router
  };
}

export { MemoryManager, Agent, Router };
export * from './memory.js';
export * from './agent.js';
export * from './router.js';
export * from './tools.js';

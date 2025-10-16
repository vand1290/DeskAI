import { MemoryManager } from './memory';
import { Agent } from './agent';
import { Router } from './router';

/**
 * Initialize and export the DeskAI system
 */
export async function initializeDeskAI(dataDir: string = './out') {
  const memory = new MemoryManager(dataDir);
  await memory.initialize();

  const agent = new Agent(memory, { memoryEnabled: true });
  const router = new Router(memory, agent);

  return {
    memory,
    agent,
    router
  };
}

export { MemoryManager, Agent, Router };
export * from './memory';
export * from './agent';
export * from './router';

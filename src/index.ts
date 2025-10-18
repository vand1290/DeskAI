import { MemoryManager } from './memory.js';
import { Agent } from './agent.js';
import { Router } from './router.js';
import { LearningManager } from './learning.js';

/**
 * Main entry point for the offline meta-agent backend
 */
export async function initializeDeskAI(dataDir: string = './out') {
  const memory = new MemoryManager(dataDir);
  await memory.initialize();

  const learning = new LearningManager(dataDir);
  await learning.initialize();

  const agent = new Agent(memory, { memoryEnabled: true }, learning);
  const router = new Router(memory, agent, learning);

  return {
    memory,
    agent,
    router,
    learning
  };
}

export { MemoryManager, Agent, Router, LearningManager };
export * from './memory.js';
export * from './agent.js';
export * from './router.js';
export * from './learning.js';

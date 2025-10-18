import { MemoryManager } from './memory.js';
import { Agent } from './agent.js';
import { Router } from './router.js';
import { Scanner } from './scanner.js';

/**
 * Main entry point for the offline meta-agent backend
 */
export async function initializeDeskAI(dataDir: string = './out') {
  const memory = new MemoryManager(dataDir);
  await memory.initialize();

  const agent = new Agent(memory, { memoryEnabled: true });
  
  const scanner = new Scanner();
  await scanner.initialize();
  
  const router = new Router(memory, agent, scanner);

  return {
    memory,
    agent,
    router,
    scanner
  };
}

export { MemoryManager, Agent, Router, Scanner };
export * from './memory.js';
export * from './agent.js';
export * from './router.js';
export * from './scanner.js';

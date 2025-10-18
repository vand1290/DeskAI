import { MemoryManager } from './memory.js';
import { Agent } from './agent.js';
import { Router } from './router.js';
import { TaskChainManager } from './taskChain.js';
/**
 * Initialize and export the DeskAI system
 */
export async function initializeDeskAI(dataDir = './out') {
    const memory = new MemoryManager(dataDir);
    await memory.initialize();
    const agent = new Agent(memory, { memoryEnabled: true });
    const taskChainManager = new TaskChainManager(dataDir);
    await taskChainManager.initialize();
    const router = new Router(memory, agent, taskChainManager);
    return {
        memory,
        agent,
        taskChainManager,
        router
    };
}
export { MemoryManager, Agent, Router, TaskChainManager };
export * from './memory.js';
export * from './agent.js';
export * from './router.js';
export * from './taskChain.js';

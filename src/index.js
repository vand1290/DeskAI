import { MemoryManager } from './memory.js';
import { Agent } from './agent.js';
import { Router } from './router.js';
import { ScanProcessor } from './scan-processor.js';
/**
 * Initialize and export the DeskAI system
 */
export async function initializeDeskAI(dataDir = './out') {
    const memory = new MemoryManager(dataDir);
    await memory.initialize();
    const agent = new Agent(memory, { memoryEnabled: true });
    const scanProcessor = new ScanProcessor(dataDir);
    await scanProcessor.initialize();
    const router = new Router(memory, agent, scanProcessor);
    return {
        memory,
        agent,
        scanProcessor,
        router
    };
}
export { MemoryManager, Agent, Router, ScanProcessor };
export * from './memory.js';
export * from './agent.js';
export * from './router.js';
export * from './scan-processor.js';

import * as fs from 'fs';
import * as path from 'path';
/**
 * TaskChainManager handles creation, storage, and execution of task chains
 * All data is stored locally - operates completely offline
 */
export class TaskChainManager {
    constructor(dataDir = './out') {
        this.initialized = false;
        this.chainsPath = path.join(dataDir, 'task-chains.json');
        this.chains = new Map();
        this.tools = new Map();
    }
    /**
     * Initialize the task chain manager by loading existing chains
     */
    async initialize() {
        if (this.initialized)
            return;
        try {
            // Ensure the output directory exists
            const dir = path.dirname(this.chainsPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            // Load existing chains if the file exists
            if (fs.existsSync(this.chainsPath)) {
                const data = fs.readFileSync(this.chainsPath, 'utf-8');
                const chainsArray = JSON.parse(data);
                for (const chain of chainsArray) {
                    this.chains.set(chain.id, chain);
                }
            }
            // Register default tools
            this.registerDefaultTools();
            this.initialized = true;
        }
        catch (error) {
            console.error('Failed to initialize task chain manager:', error);
            throw error;
        }
    }
    /**
     * Register default tools available for task chains
     */
    registerDefaultTools() {
        // Scan tool (placeholder implementation)
        this.registerTool({
            type: 'scan',
            name: 'Document Scanner',
            description: 'Scan a document or image',
            execute: async (input) => {
                // Placeholder: In real implementation, this would integrate with scanning hardware/software
                return {
                    status: 'scanned',
                    data: input,
                    message: 'Document scanned successfully'
                };
            }
        });
        // OCR tool (placeholder implementation)
        this.registerTool({
            type: 'ocr',
            name: 'OCR Text Extraction',
            description: 'Extract text from images using OCR',
            execute: async (input) => {
                // Placeholder: In real implementation, this would use OCR library
                return {
                    status: 'extracted',
                    text: `Extracted text from: ${JSON.stringify(input)}`,
                    message: 'Text extracted successfully'
                };
            }
        });
        // Summarize tool (placeholder implementation)
        this.registerTool({
            type: 'summarize',
            name: 'Text Summarizer',
            description: 'Summarize text content',
            execute: async (input) => {
                // Placeholder: In real implementation, this would use AI/NLP for summarization
                const text = typeof input === 'string' ? input : JSON.stringify(input);
                return {
                    status: 'summarized',
                    summary: `Summary of: ${text.substring(0, 100)}...`,
                    message: 'Text summarized successfully'
                };
            }
        });
        // Save tool (placeholder implementation)
        this.registerTool({
            type: 'save',
            name: 'File Saver',
            description: 'Save content to a file',
            execute: async (input, config) => {
                // Placeholder: In real implementation, this would save to filesystem
                const filename = config?.filename || 'output.pdf';
                return {
                    status: 'saved',
                    filename,
                    data: input,
                    message: `Saved to ${filename}`
                };
            }
        });
    }
    /**
     * Register a custom tool for use in task chains
     */
    registerTool(tool) {
        this.tools.set(tool.type, tool);
    }
    /**
     * Get all registered tools
     */
    getAvailableTools() {
        return Array.from(this.tools.values());
    }
    /**
     * Save chains to disk
     */
    async saveChains() {
        try {
            const chainsArray = Array.from(this.chains.values());
            const data = JSON.stringify(chainsArray, null, 2);
            fs.writeFileSync(this.chainsPath, data, 'utf-8');
        }
        catch (error) {
            console.error('Failed to save task chains:', error);
            throw error;
        }
    }
    /**
     * Create a new task chain
     */
    async createChain(name, description, tags) {
        const chain = {
            id: this.generateId(),
            name,
            description,
            steps: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
            tags: tags || [],
            metadata: {}
        };
        this.chains.set(chain.id, chain);
        await this.saveChains();
        return chain;
    }
    /**
     * Add a step to a task chain
     */
    async addStep(chainId, type, name, config) {
        const chain = this.chains.get(chainId);
        if (!chain) {
            throw new Error(`Task chain ${chainId} not found`);
        }
        // Verify the tool type exists
        if (!this.tools.has(type)) {
            throw new Error(`Tool type '${type}' is not registered`);
        }
        const step = {
            id: this.generateId(),
            type,
            name,
            config,
            order: chain.steps.length
        };
        chain.steps.push(step);
        chain.updatedAt = Date.now();
        await this.saveChains();
        return step;
    }
    /**
     * Update a step in a task chain
     */
    async updateStep(chainId, stepId, updates) {
        const chain = this.chains.get(chainId);
        if (!chain) {
            throw new Error(`Task chain ${chainId} not found`);
        }
        const stepIndex = chain.steps.findIndex(s => s.id === stepId);
        if (stepIndex === -1) {
            throw new Error(`Step ${stepId} not found in chain ${chainId}`);
        }
        chain.steps[stepIndex] = {
            ...chain.steps[stepIndex],
            ...updates
        };
        chain.updatedAt = Date.now();
        await this.saveChains();
        return chain.steps[stepIndex];
    }
    /**
     * Remove a step from a task chain
     */
    async removeStep(chainId, stepId) {
        const chain = this.chains.get(chainId);
        if (!chain) {
            throw new Error(`Task chain ${chainId} not found`);
        }
        const originalLength = chain.steps.length;
        chain.steps = chain.steps.filter(s => s.id !== stepId);
        // Reorder remaining steps
        chain.steps.forEach((step, index) => {
            step.order = index;
        });
        if (chain.steps.length < originalLength) {
            chain.updatedAt = Date.now();
            await this.saveChains();
            return true;
        }
        return false;
    }
    /**
     * Reorder steps in a task chain
     */
    async reorderSteps(chainId, stepIds) {
        const chain = this.chains.get(chainId);
        if (!chain) {
            throw new Error(`Task chain ${chainId} not found`);
        }
        // Verify all step IDs are valid
        const validStepIds = new Set(chain.steps.map(s => s.id));
        if (!stepIds.every(id => validStepIds.has(id))) {
            throw new Error('Invalid step IDs provided');
        }
        // Reorder steps based on provided IDs
        const reorderedSteps = [];
        for (let i = 0; i < stepIds.length; i++) {
            const step = chain.steps.find(s => s.id === stepIds[i]);
            if (step) {
                step.order = i;
                reorderedSteps.push(step);
            }
        }
        chain.steps = reorderedSteps;
        chain.updatedAt = Date.now();
        await this.saveChains();
        return true;
    }
    /**
     * Get a specific task chain by ID
     */
    async getChain(chainId) {
        return this.chains.get(chainId) || null;
    }
    /**
     * List all task chains
     */
    async listChains(tags) {
        let chains = Array.from(this.chains.values());
        // Filter by tags if provided
        if (tags && tags.length > 0) {
            chains = chains.filter(chain => chain.tags && chain.tags.some(tag => tags.includes(tag)));
        }
        // Sort by most recent first
        return chains.sort((a, b) => b.updatedAt - a.updatedAt);
    }
    /**
     * Delete a task chain
     */
    async deleteChain(chainId) {
        const deleted = this.chains.delete(chainId);
        if (deleted) {
            await this.saveChains();
        }
        return deleted;
    }
    /**
     * Execute a task chain
     */
    async executeChain(chainId, initialInput) {
        const chain = this.chains.get(chainId);
        if (!chain) {
            throw new Error(`Task chain ${chainId} not found`);
        }
        const startTime = Date.now();
        const stepResults = [];
        let currentInput = initialInput;
        let chainSuccess = true;
        // Execute steps in order
        for (const step of chain.steps.sort((a, b) => a.order - b.order)) {
            const stepStartTime = Date.now();
            try {
                const tool = this.tools.get(step.type);
                if (!tool) {
                    throw new Error(`Tool type '${step.type}' not found`);
                }
                // Execute the step with the output from the previous step
                const output = await tool.execute(currentInput, step.config);
                stepResults.push({
                    stepId: step.id,
                    success: true,
                    output,
                    startTime: stepStartTime,
                    endTime: Date.now()
                });
                // Pass output to next step
                currentInput = output;
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                stepResults.push({
                    stepId: step.id,
                    success: false,
                    error: errorMessage,
                    startTime: stepStartTime,
                    endTime: Date.now()
                });
                chainSuccess = false;
                break; // Stop execution on error
            }
        }
        return {
            chainId,
            success: chainSuccess,
            stepResults,
            startTime,
            endTime: Date.now(),
            error: chainSuccess ? undefined : 'Chain execution failed'
        };
    }
    /**
     * Export all task chains
     */
    async exportChains() {
        return Array.from(this.chains.values());
    }
    /**
     * Clear all task chains (for testing or user request)
     */
    async clearAll() {
        this.chains.clear();
        await this.saveChains();
    }
    /**
     * Generate a unique ID
     */
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    }
}

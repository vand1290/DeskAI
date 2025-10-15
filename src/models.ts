/**
 * Model reference system for local model runners
 * This provides an interface for plugging in user's local model runners
 */

export interface LocalModel {
  name: string;
  load(): Promise<void>;
  infer(prompt: string): Promise<string>;
}

/**
 * Stub implementation for local model runner
 * In production, this would connect to actual local model inference
 */
export class StubLocalModel implements LocalModel {
  name: string;
  private loaded: boolean = false;

  constructor(name: string) {
    this.name = name;
  }

  async load(): Promise<void> {
    // Simulate model loading (deterministic)
    this.loaded = true;
  }

  async infer(prompt: string): Promise<string> {
    if (!this.loaded) {
      throw new Error(`Model ${this.name} not loaded`);
    }

    // Deterministic stub response
    // In production, this would call actual local model inference
    const deterministicHash = this.hashString(prompt);
    return `[${this.name} response for prompt hash ${deterministicHash}]: This is a deterministic offline response. The model would process: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

/**
 * Model registry for managing available models
 */
export class ModelRegistry {
  private models: Map<string, LocalModel> = new Map();

  constructor() {
    // Register default stub models
    this.registerModel(new StubLocalModel('qwen2.5:7b'));
    this.registerModel(new StubLocalModel('llama2:7b'));
    this.registerModel(new StubLocalModel('mistral:7b'));
  }

  registerModel(model: LocalModel): void {
    this.models.set(model.name, model);
  }

  getModel(name: string): LocalModel | undefined {
    return this.models.get(name);
  }

  listModels(): string[] {
    return Array.from(this.models.keys());
  }

  hasModel(name: string): boolean {
    return this.models.has(name);
  }
}

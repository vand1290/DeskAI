import * as fs from 'fs';
import * as path from 'path';
import { TaskChain } from '../shared/types';

/**
 * WorkflowStorage handles saving and loading task chains to/from disk
 */
export class WorkflowStorage {
  private storageDir: string;

  constructor(storageDir?: string) {
    this.storageDir = storageDir || path.join(process.cwd(), 'workflows');
    this.ensureStorageDir();
  }

  /**
   * Ensure storage directory exists
   */
  private ensureStorageDir(): void {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  /**
   * Save a workflow to disk
   */
  async saveWorkflow(chain: TaskChain): Promise<void> {
    const filePath = path.join(this.storageDir, `${chain.id}.json`);
    const data = JSON.stringify(chain, null, 2);
    
    return new Promise((resolve, reject) => {
      fs.writeFile(filePath, data, 'utf8', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Load a workflow from disk
   */
  async loadWorkflow(id: string): Promise<TaskChain | null> {
    const filePath = path.join(this.storageDir, `${id}.json`);
    
    return new Promise((resolve, reject) => {
      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            resolve(null);
          } else {
            reject(err);
          }
          return;
        }
        
        try {
          const chain = JSON.parse(data);
          // Convert date strings back to Date objects
          chain.createdAt = new Date(chain.createdAt);
          chain.updatedAt = new Date(chain.updatedAt);
          resolve(chain);
        } catch (parseErr) {
          reject(parseErr);
        }
      });
    });
  }

  /**
   * List all saved workflows
   */
  async listWorkflows(): Promise<TaskChain[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(this.storageDir, (err, files) => {
        if (err) {
          reject(err);
          return;
        }

        const workflows: Promise<TaskChain | null>[] = files
          .filter(file => file.endsWith('.json'))
          .map(file => {
            const id = file.replace('.json', '');
            return this.loadWorkflow(id);
          });

        Promise.all(workflows)
          .then(results => resolve(results.filter(w => w !== null) as TaskChain[]))
          .catch(reject);
      });
    });
  }

  /**
   * Delete a workflow from disk
   */
  async deleteWorkflow(id: string): Promise<boolean> {
    const filePath = path.join(this.storageDir, `${id}.json`);
    
    return new Promise((resolve) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }

  /**
   * Check if a workflow exists
   */
  async workflowExists(id: string): Promise<boolean> {
    const filePath = path.join(this.storageDir, `${id}.json`);
    return fs.existsSync(filePath);
  }
}

export const workflowStorage = new WorkflowStorage();

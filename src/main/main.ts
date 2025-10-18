import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { toolRegistry } from './toolRegistry';
import { taskChainManager } from './taskChainManager';
import { workflowStorage } from './workflowStorage';
import { scanTool, ocrTool, summarizeTool, savePdfTool, fileManagementTool } from './tools';
import { TaskChain } from '../shared/types';

let mainWindow: BrowserWindow | null = null;

// Register all available tools
function registerTools() {
  toolRegistry.registerTool(scanTool);
  toolRegistry.registerTool(ocrTool);
  toolRegistry.registerTool(summarizeTool);
  toolRegistry.registerTool(savePdfTool);
  toolRegistry.registerTool(fileManagementTool);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // In development, load from webpack dev server
  // In production, load from local file
  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC handlers for communication between renderer and main process
function setupIpcHandlers() {
  // Get all available tools
  ipcMain.handle('get-tools', async () => {
    return toolRegistry.getAllTools().map(tool => ({
      type: tool.type,
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    }));
  });

  // Save workflow
  ipcMain.handle('save-workflow', async (event, chain: TaskChain) => {
    try {
      await workflowStorage.saveWorkflow(chain);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // Load workflow
  ipcMain.handle('load-workflow', async (event, id: string) => {
    try {
      const workflow = await workflowStorage.loadWorkflow(id);
      return { success: true, workflow };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // List all workflows
  ipcMain.handle('list-workflows', async () => {
    try {
      const workflows = await workflowStorage.listWorkflows();
      return { success: true, workflows };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // Delete workflow
  ipcMain.handle('delete-workflow', async (event, id: string) => {
    try {
      const deleted = await workflowStorage.deleteWorkflow(id);
      return { success: deleted };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // Execute workflow
  ipcMain.handle('execute-workflow', async (event, chain: TaskChain) => {
    try {
      // Validate chain first
      const validation = taskChainManager.validateChain(chain);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', '),
        };
      }

      // Execute the chain
      const result = await taskChainManager.executeChain(chain);
      return { success: true, result };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });

  // Validate workflow
  ipcMain.handle('validate-workflow', async (event, chain: TaskChain) => {
    try {
      const validation = taskChainManager.validateChain(chain);
      return { success: true, validation };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  });
}

app.on('ready', () => {
  registerTools();
  setupIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

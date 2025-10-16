import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  getTools: () => ipcRenderer.invoke('get-tools'),
  saveWorkflow: (chain: any) => ipcRenderer.invoke('save-workflow', chain),
  loadWorkflow: (id: string) => ipcRenderer.invoke('load-workflow', id),
  listWorkflows: () => ipcRenderer.invoke('list-workflows'),
  deleteWorkflow: (id: string) => ipcRenderer.invoke('delete-workflow', id),
  executeWorkflow: (chain: any) => ipcRenderer.invoke('execute-workflow', chain),
  validateWorkflow: (chain: any) => ipcRenderer.invoke('validate-workflow', chain),
});

import React, { useState, useEffect } from 'react';
import { TaskChain, Task, Tool } from '../shared/types';
import WorkflowBuilder from './components/WorkflowBuilder';
import WorkflowList from './components/WorkflowList';
import WorkflowExecutor from './components/WorkflowExecutor';
import './App.css';

declare global {
  interface Window {
    electronAPI: {
      getTools: () => Promise<Tool[]>;
      saveWorkflow: (chain: TaskChain) => Promise<{ success: boolean; error?: string }>;
      loadWorkflow: (id: string) => Promise<{ success: boolean; workflow?: TaskChain; error?: string }>;
      listWorkflows: () => Promise<{ success: boolean; workflows?: TaskChain[]; error?: string }>;
      deleteWorkflow: (id: string) => Promise<{ success: boolean; error?: string }>;
      executeWorkflow: (chain: TaskChain) => Promise<{ success: boolean; result?: any; error?: string }>;
      validateWorkflow: (chain: TaskChain) => Promise<{ success: boolean; validation?: any; error?: string }>;
    };
  }
}

const App: React.FC = () => {
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);
  const [workflows, setWorkflows] = useState<TaskChain[]>([]);
  const [currentWorkflow, setCurrentWorkflow] = useState<TaskChain | null>(null);
  const [activeTab, setActiveTab] = useState<'builder' | 'list' | 'executor'>('list');

  useEffect(() => {
    loadTools();
    loadWorkflows();
  }, []);

  const loadTools = async () => {
    try {
      const tools = await window.electronAPI.getTools();
      setAvailableTools(tools);
    } catch (error) {
      console.error('Failed to load tools:', error);
    }
  };

  const loadWorkflows = async () => {
    try {
      const response = await window.electronAPI.listWorkflows();
      if (response.success && response.workflows) {
        setWorkflows(response.workflows);
      }
    } catch (error) {
      console.error('Failed to load workflows:', error);
    }
  };

  const handleSaveWorkflow = async (workflow: TaskChain) => {
    try {
      const response = await window.electronAPI.saveWorkflow(workflow);
      if (response.success) {
        await loadWorkflows();
        setActiveTab('list');
        alert('Workflow saved successfully!');
      } else {
        alert(`Failed to save workflow: ${response.error}`);
      }
    } catch (error) {
      console.error('Failed to save workflow:', error);
      alert('Failed to save workflow');
    }
  };

  const handleEditWorkflow = (workflow: TaskChain) => {
    setCurrentWorkflow(workflow);
    setActiveTab('builder');
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) {
      return;
    }

    try {
      const response = await window.electronAPI.deleteWorkflow(id);
      if (response.success) {
        await loadWorkflows();
      } else {
        alert(`Failed to delete workflow: ${response.error}`);
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      alert('Failed to delete workflow');
    }
  };

  const handleExecuteWorkflow = (workflow: TaskChain) => {
    setCurrentWorkflow(workflow);
    setActiveTab('executor');
  };

  const handleNewWorkflow = () => {
    setCurrentWorkflow(null);
    setActiveTab('builder');
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>DeskAI - Task Chain Manager</h1>
        <nav className="tabs">
          <button 
            className={activeTab === 'list' ? 'active' : ''} 
            onClick={() => setActiveTab('list')}
          >
            Workflows
          </button>
          <button 
            className={activeTab === 'builder' ? 'active' : ''} 
            onClick={handleNewWorkflow}
          >
            New Workflow
          </button>
          <button 
            className={activeTab === 'executor' ? 'active' : ''} 
            onClick={() => setActiveTab('executor')}
            disabled={!currentWorkflow}
          >
            Execute
          </button>
        </nav>
      </header>

      <main className="app-content">
        {activeTab === 'list' && (
          <WorkflowList
            workflows={workflows}
            onEdit={handleEditWorkflow}
            onDelete={handleDeleteWorkflow}
            onExecute={handleExecuteWorkflow}
          />
        )}

        {activeTab === 'builder' && (
          <WorkflowBuilder
            availableTools={availableTools}
            workflow={currentWorkflow}
            onSave={handleSaveWorkflow}
            onCancel={() => setActiveTab('list')}
          />
        )}

        {activeTab === 'executor' && currentWorkflow && (
          <WorkflowExecutor
            workflow={currentWorkflow}
            onComplete={() => setActiveTab('list')}
          />
        )}
      </main>
    </div>
  );
};

export default App;

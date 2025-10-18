import React, { useState, useEffect } from 'react';
import { TaskChain, TaskStep, ChainTool } from '../../src/taskChain';

interface WorkflowBuilderProps {
  chainId?: string;
  onSave?: (chain: TaskChain) => void;
  onCancel?: () => void;
}

export const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  chainId,
  onSave,
  onCancel
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [steps, setSteps] = useState<TaskStep[]>([]);
  const [availableTools, setAvailableTools] = useState<ChainTool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    success: boolean;
    startTime: number;
    endTime: number;
    stepResults: Array<{
      success: boolean;
      error?: string;
    }>;
  } | null>(null);

  // Load available tools on mount
  useEffect(() => {
    loadAvailableTools();
  }, []);

  // Load chain if editing
  useEffect(() => {
    if (chainId) {
      loadChain(chainId);
    }
  }, [chainId]);

  const loadAvailableTools = async () => {
    try {
      const response = await fetch('/api/workflows/tools');
      if (response.ok) {
        const data = await response.json();
        setAvailableTools(data.tools || []);
      }
    } catch (err) {
      console.error('Failed to load tools:', err);
    }
  };

  const loadChain = async (id: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workflows/${id}`);
      if (response.ok) {
        const data = await response.json();
        const chain = data.chain;
        setName(chain.name);
        setDescription(chain.description || '');
        setTags(chain.tags?.join(', ') || '');
        setSteps(chain.steps || []);
      }
    } catch (err) {
      setError('Failed to load workflow');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStep = (toolType: string) => {
    const tool = availableTools.find(t => t.type === toolType);
    if (!tool) return;

    const newStep: TaskStep = {
      id: `temp-${Date.now()}`,
      type: toolType as TaskStep['type'],
      name: tool.name,
      order: steps.length,
      config: {}
    };

    setSteps([...steps, newStep]);
  };

  const handleRemoveStep = (stepId: string) => {
    setSteps(steps.filter(s => s.id !== stepId).map((s, index) => ({
      ...s,
      order: index
    })));
  };

  const handleMoveStep = (stepId: string, direction: 'up' | 'down') => {
    const index = steps.findIndex(s => s.id === stepId);
    if (index === -1) return;

    if (direction === 'up' && index > 0) {
      const newSteps = [...steps];
      [newSteps[index - 1], newSteps[index]] = [newSteps[index], newSteps[index - 1]];
      setSteps(newSteps.map((s, i) => ({ ...s, order: i })));
    } else if (direction === 'down' && index < steps.length - 1) {
      const newSteps = [...steps];
      [newSteps[index], newSteps[index + 1]] = [newSteps[index + 1], newSteps[index]];
      setSteps(newSteps.map((s, i) => ({ ...s, order: i })));
    }
  };

  const handleUpdateStepName = (stepId: string, newName: string) => {
    setSteps(steps.map(s => s.id === stepId ? { ...s, name: newName } : s));
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Workflow name is required');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);

      if (chainId) {
        // Update existing chain
        const response = await fetch(`/api/workflows/${chainId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, tags: tagsArray, steps })
        });

        if (response.ok) {
          const data = await response.json();
          onSave?.(data.chain);
        } else {
          throw new Error('Failed to update workflow');
        }
      } else {
        // Create new chain
        const createResponse = await fetch('/api/workflows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, description, tags: tagsArray })
        });

        if (createResponse.ok) {
          const createData = await createResponse.json();
          const newChainId = createData.chain.id;

          // Add steps
          for (const step of steps) {
            await fetch(`/api/workflows/${newChainId}/steps`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: step.type,
                name: step.name,
                config: step.config
              })
            });
          }

          // Load the complete chain
          const finalResponse = await fetch(`/api/workflows/${newChainId}`);
          if (finalResponse.ok) {
            const finalData = await finalResponse.json();
            onSave?.(finalData.chain);
          }
        } else {
          throw new Error('Failed to create workflow');
        }
      }
    } catch (err) {
      setError('Failed to save workflow');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleExecute = async () => {
    if (!chainId) {
      setError('Please save the workflow before executing');
      return;
    }

    setExecuting(true);
    setExecutionResult(null);
    setError(null);

    try {
      const response = await fetch(`/api/workflows/${chainId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialInput: null })
      });

      if (response.ok) {
        const data = await response.json();
        setExecutionResult(data.result);
      } else {
        throw new Error('Failed to execute workflow');
      }
    } catch (err) {
      setError('Failed to execute workflow');
      console.error(err);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return <div className="workflow-builder loading">Loading workflow...</div>;
  }

  return (
    <div className="workflow-builder">
      <div className="builder-header">
        <h2>{chainId ? 'Edit Workflow' : 'Create New Workflow'}</h2>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="builder-form">
        <div className="form-group">
          <label>Workflow Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Document Scanner & OCR Pipeline"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this workflow does..."
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Tags (comma-separated)</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="e.g., document, ocr, automation"
          />
        </div>
      </div>

      <div className="steps-section">
        <div className="steps-header">
          <h3>Workflow Steps</h3>
          <div className="add-step-dropdown">
            <label>Add Step:</label>
            <select onChange={(e) => {
              if (e.target.value) {
                handleAddStep(e.target.value);
                e.target.value = '';
              }
            }}>
              <option value="">Select a tool...</option>
              {availableTools.map(tool => (
                <option key={tool.type} value={tool.type}>
                  {tool.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {steps.length === 0 ? (
          <div className="empty-steps">
            <p>No steps added yet. Select a tool above to add your first step.</p>
          </div>
        ) : (
          <div className="steps-list">
            {steps.map((step, index) => (
              <div key={step.id} className="step-item">
                <div className="step-number">{index + 1}</div>
                <div className="step-content">
                  <input
                    type="text"
                    value={step.name}
                    onChange={(e) => handleUpdateStepName(step.id, e.target.value)}
                    className="step-name-input"
                  />
                  <div className="step-type">{step.type}</div>
                </div>
                <div className="step-actions">
                  <button
                    onClick={() => handleMoveStep(step.id, 'up')}
                    disabled={index === 0}
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    onClick={() => handleMoveStep(step.id, 'down')}
                    disabled={index === steps.length - 1}
                    title="Move down"
                  >
                    ↓
                  </button>
                  <button
                    onClick={() => handleRemoveStep(step.id)}
                    className="delete-btn"
                    title="Remove step"
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {executionResult && (
        <div className="execution-result">
          <h3>Execution Result</h3>
          <div className={`result-status ${executionResult.success ? 'success' : 'error'}`}>
            Status: {executionResult.success ? 'Success' : 'Failed'}
          </div>
          <div className="result-details">
            <div>Duration: {executionResult.endTime - executionResult.startTime}ms</div>
            <div>Steps Completed: {executionResult.stepResults.length}</div>
          </div>
          <div className="step-results">
            {executionResult.stepResults.map((result: { success: boolean; error?: string }, index: number) => (
              <div key={index} className={`step-result ${result.success ? 'success' : 'error'}`}>
                <strong>Step {index + 1}:</strong> {result.success ? 'Success' : result.error}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="builder-actions">
        <button onClick={onCancel} disabled={saving || executing}>
          Cancel
        </button>
        <button onClick={handleSave} disabled={saving || executing || !name.trim()}>
          {saving ? 'Saving...' : chainId ? 'Update Workflow' : 'Save Workflow'}
        </button>
        {chainId && (
          <button
            onClick={handleExecute}
            disabled={executing || saving}
            className="execute-btn"
          >
            {executing ? 'Executing...' : 'Execute Workflow'}
          </button>
        )}
      </div>

      <style>{`
        .workflow-builder {
          padding: 20px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .workflow-builder.loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          color: #666;
        }

        .builder-header h2 {
          margin: 0 0 20px 0;
          color: #2c3e50;
        }

        .error-message {
          background: #fee;
          color: #c00;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #fcc;
        }

        .builder-form {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2c3e50;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
        }

        .steps-section {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .steps-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .steps-header h3 {
          margin: 0;
          color: #2c3e50;
        }

        .add-step-dropdown {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .add-step-dropdown label {
          font-weight: 600;
          color: #2c3e50;
        }

        .add-step-dropdown select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
        }

        .empty-steps {
          text-align: center;
          padding: 40px;
          color: #666;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .steps-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .step-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          background: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .step-number {
          width: 32px;
          height: 32px;
          background: #007bff;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          flex-shrink: 0;
        }

        .step-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .step-name-input {
          padding: 6px 10px;
          border: 1px solid #ccc;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
        }

        .step-type {
          font-size: 12px;
          color: #666;
          font-family: monospace;
        }

        .step-actions {
          display: flex;
          gap: 4px;
        }

        .step-actions button {
          width: 32px;
          height: 32px;
          padding: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .step-actions button:hover:not(:disabled) {
          background: #f0f0f0;
        }

        .step-actions button:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .step-actions .delete-btn {
          color: #dc3545;
          font-size: 24px;
          font-weight: bold;
        }

        .step-actions .delete-btn:hover:not(:disabled) {
          background: #fee;
          border-color: #fcc;
        }

        .execution-result {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .execution-result h3 {
          margin: 0 0 15px 0;
          color: #2c3e50;
        }

        .result-status {
          padding: 10px;
          border-radius: 4px;
          font-weight: 600;
          margin-bottom: 15px;
        }

        .result-status.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .result-status.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .result-details {
          display: flex;
          gap: 20px;
          margin-bottom: 15px;
          color: #666;
          font-size: 14px;
        }

        .step-results {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .step-result {
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 14px;
        }

        .step-result.success {
          background: #d4edda;
          color: #155724;
        }

        .step-result.error {
          background: #f8d7da;
          color: #721c24;
        }

        .builder-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .builder-actions button {
          padding: 10px 24px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .builder-actions button:first-child {
          background: #6c757d;
          color: white;
        }

        .builder-actions button:first-child:hover:not(:disabled) {
          background: #5a6268;
        }

        .builder-actions button:nth-child(2) {
          background: #28a745;
          color: white;
        }

        .builder-actions button:nth-child(2):hover:not(:disabled) {
          background: #218838;
        }

        .builder-actions button.execute-btn {
          background: #007bff;
          color: white;
        }

        .builder-actions button.execute-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .builder-actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

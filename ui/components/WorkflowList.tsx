import React, { useState, useEffect } from 'react';
import { TaskChain } from '../../src/taskChain';

interface WorkflowListProps {
  onSelectWorkflow?: (chainId: string) => void;
  onCreateNew?: () => void;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({
  onSelectWorkflow,
  onCreateNew
}) => {
  const [workflows, setWorkflows] = useState<TaskChain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState('');
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    loadWorkflows();
  }, []);

  useEffect(() => {
    // Extract all unique tags
    const tags = new Set<string>();
    workflows.forEach(w => {
      w.tags?.forEach(tag => tags.add(tag));
    });
    setAllTags(Array.from(tags).sort());
  }, [workflows]);

  const loadWorkflows = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/workflows');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.chains || []);
      } else {
        throw new Error('Failed to load workflows');
      }
    } catch (err) {
      setError('Failed to load workflows');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (chainId: string, workflowName: string) => {
    if (!confirm(`Are you sure you want to delete "${workflowName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/workflows/${chainId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setWorkflows(workflows.filter(w => w.id !== chainId));
      } else {
        throw new Error('Failed to delete workflow');
      }
    } catch (err) {
      setError('Failed to delete workflow');
      console.error(err);
    }
  };

  const handleExecute = async (chainId: string, workflowName: string) => {
    if (!confirm(`Execute workflow "${workflowName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/workflows/${chainId}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialInput: null })
      });

      if (response.ok) {
        const data = await response.json();
        const result = data.result;
        
        if (result.success) {
          alert(`Workflow executed successfully!\nDuration: ${result.endTime - result.startTime}ms`);
        } else {
          alert(`Workflow execution failed:\n${result.error}`);
        }
      } else {
        throw new Error('Failed to execute workflow');
      }
    } catch (err) {
      setError('Failed to execute workflow');
      console.error(err);
    }
  };

  const filteredWorkflows = filterTag
    ? workflows.filter(w => w.tags?.includes(filterTag))
    : workflows;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="workflow-list">
      <div className="list-header">
        <h2>Workflows</h2>
        <button onClick={onCreateNew} className="create-btn">
          + Create New Workflow
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {allTags.length > 0 && (
        <div className="filter-section">
          <label>Filter by tag:</label>
          <select value={filterTag} onChange={(e) => setFilterTag(e.target.value)}>
            <option value="">All workflows</option>
            {allTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="loading-state">Loading workflows...</div>
      ) : filteredWorkflows.length === 0 ? (
        <div className="empty-state">
          <h3>No workflows yet</h3>
          <p>Create your first workflow to automate tasks like scanning documents, extracting text, and more!</p>
          <button onClick={onCreateNew} className="empty-create-btn">
            Create Your First Workflow
          </button>
        </div>
      ) : (
        <div className="workflows-grid">
          {filteredWorkflows.map((workflow) => (
            <div key={workflow.id} className="workflow-card">
              <div className="card-header">
                <h3>{workflow.name}</h3>
                <div className="card-actions">
                  <button
                    onClick={() => onSelectWorkflow?.(workflow.id)}
                    title="Edit workflow"
                    className="edit-btn"
                  >
                    ✎
                  </button>
                  <button
                    onClick={() => handleDelete(workflow.id, workflow.name)}
                    title="Delete workflow"
                    className="delete-btn"
                  >
                    🗑
                  </button>
                </div>
              </div>

              {workflow.description && (
                <p className="workflow-description">{workflow.description}</p>
              )}

              <div className="workflow-meta">
                <div className="meta-item">
                  <span className="meta-label">Steps:</span>
                  <span className="meta-value">{workflow.steps.length}</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Updated:</span>
                  <span className="meta-value">{formatDate(workflow.updatedAt)}</span>
                </div>
              </div>

              {workflow.tags && workflow.tags.length > 0 && (
                <div className="workflow-tags">
                  {workflow.tags.map((tag, idx) => (
                    <span key={idx} className="tag">{tag}</span>
                  ))}
                </div>
              )}

              <div className="workflow-steps-preview">
                {workflow.steps.length > 0 ? (
                  <div className="steps-flow">
                    {workflow.steps.slice(0, 4).map((step, idx) => (
                      <React.Fragment key={step.id}>
                        <div className="step-badge" title={step.name}>
                          {step.type}
                        </div>
                        {idx < Math.min(workflow.steps.length - 1, 3) && (
                          <div className="step-arrow">→</div>
                        )}
                      </React.Fragment>
                    ))}
                    {workflow.steps.length > 4 && (
                      <div className="step-more">+{workflow.steps.length - 4}</div>
                    )}
                  </div>
                ) : (
                  <div className="no-steps">No steps configured</div>
                )}
              </div>

              <button
                onClick={() => handleExecute(workflow.id, workflow.name)}
                className="execute-btn"
                disabled={workflow.steps.length === 0}
              >
                ▶ Execute Workflow
              </button>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .workflow-list {
          padding: 20px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .list-header h2 {
          margin: 0;
          color: #2c3e50;
        }

        .create-btn {
          padding: 10px 20px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .create-btn:hover {
          background: #218838;
        }

        .error-message {
          background: #fee;
          color: #c00;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #fcc;
        }

        .filter-section {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-section label {
          font-weight: 600;
          color: #2c3e50;
        }

        .filter-section select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
        }

        .loading-state {
          text-align: center;
          padding: 60px 20px;
          color: #666;
          font-size: 16px;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border: 2px dashed #ddd;
          border-radius: 8px;
        }

        .empty-state h3 {
          margin: 0 0 10px 0;
          color: #2c3e50;
        }

        .empty-state p {
          margin: 0 0 20px 0;
          color: #666;
        }

        .empty-create-btn {
          padding: 12px 24px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .empty-create-btn:hover {
          background: #218838;
        }

        .workflows-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .workflow-card {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: box-shadow 0.2s;
        }

        .workflow-card:hover {
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .card-header h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 18px;
          flex: 1;
        }

        .card-actions {
          display: flex;
          gap: 4px;
        }

        .card-actions button {
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

        .card-actions button:hover {
          background: #f0f0f0;
        }

        .card-actions .edit-btn {
          color: #007bff;
        }

        .card-actions .delete-btn {
          color: #dc3545;
        }

        .workflow-description {
          margin: 0;
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }

        .workflow-meta {
          display: flex;
          gap: 20px;
          font-size: 13px;
          color: #666;
        }

        .meta-item {
          display: flex;
          gap: 5px;
        }

        .meta-label {
          font-weight: 600;
        }

        .workflow-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .tag {
          padding: 4px 10px;
          background: #e3f2fd;
          color: #1976d2;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .workflow-steps-preview {
          padding: 12px;
          background: #f8f9fa;
          border-radius: 4px;
          min-height: 50px;
          display: flex;
          align-items: center;
        }

        .steps-flow {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .step-badge {
          padding: 6px 12px;
          background: #007bff;
          color: white;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          font-family: monospace;
        }

        .step-arrow {
          color: #666;
          font-size: 16px;
        }

        .step-more {
          padding: 6px 12px;
          background: #6c757d;
          color: white;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .no-steps {
          color: #999;
          font-size: 13px;
          font-style: italic;
        }

        .workflow-card .execute-btn {
          width: 100%;
          padding: 10px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 8px;
        }

        .workflow-card .execute-btn:hover:not(:disabled) {
          background: #0056b3;
        }

        .workflow-card .execute-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

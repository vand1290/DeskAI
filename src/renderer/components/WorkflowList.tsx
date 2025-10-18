import React from 'react';
import { TaskChain } from '../../shared/types';
import './WorkflowList.css';

interface WorkflowListProps {
  workflows: TaskChain[];
  onEdit: (workflow: TaskChain) => void;
  onDelete: (id: string) => void;
  onExecute: (workflow: TaskChain) => void;
}

const WorkflowList: React.FC<WorkflowListProps> = ({
  workflows,
  onEdit,
  onDelete,
  onExecute,
}) => {
  if (workflows.length === 0) {
    return (
      <div className="workflow-list empty">
        <p>No workflows yet. Create your first workflow!</p>
      </div>
    );
  }

  return (
    <div className="workflow-list">
      <h2>Saved Workflows</h2>
      <div className="workflow-grid">
        {workflows.map((workflow) => (
          <div key={workflow.id} className="workflow-card">
            <div className="workflow-header">
              <h3>{workflow.name}</h3>
              <span className="task-count">{workflow.tasks.length} tasks</span>
            </div>
            <p className="workflow-description">{workflow.description}</p>
            <div className="workflow-tasks">
              {workflow.tasks.map((task, index) => (
                <span key={task.id} className="task-badge">
                  {index + 1}. {task.name}
                </span>
              ))}
            </div>
            <div className="workflow-footer">
              <span className="workflow-date">
                Updated: {new Date(workflow.updatedAt).toLocaleDateString()}
              </span>
              <div className="workflow-actions">
                <button 
                  className="btn btn-primary"
                  onClick={() => onExecute(workflow)}
                >
                  Execute
                </button>
                <button 
                  className="btn btn-secondary"
                  onClick={() => onEdit(workflow)}
                >
                  Edit
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => onDelete(workflow.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkflowList;

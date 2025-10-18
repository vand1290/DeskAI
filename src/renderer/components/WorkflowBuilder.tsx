import React, { useState, useEffect } from 'react';
import { TaskChain, Task, Tool } from '../../shared/types';
import './WorkflowBuilder.css';

interface WorkflowBuilderProps {
  availableTools: Tool[];
  workflow: TaskChain | null;
  onSave: (workflow: TaskChain) => void;
  onCancel: () => void;
}

const WorkflowBuilder: React.FC<WorkflowBuilderProps> = ({
  availableTools,
  workflow,
  onSave,
  onCancel,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedTool, setSelectedTool] = useState<string>('');
  const [taskParameters, setTaskParameters] = useState<Record<string, any>>({});

  useEffect(() => {
    if (workflow) {
      setName(workflow.name);
      setDescription(workflow.description);
      setTasks(workflow.tasks);
    } else {
      setName('');
      setDescription('');
      setTasks([]);
    }
  }, [workflow]);

  const handleAddTask = () => {
    if (!selectedTool) return;

    const tool = availableTools.find(t => t.type === selectedTool);
    if (!tool) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      name: tool.name,
      type: tool.type,
      parameters: { ...taskParameters },
    };

    setTasks([...tasks, newTask]);
    setSelectedTool('');
    setTaskParameters({});
  };

  const handleRemoveTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const handleMoveTask = (index: number, direction: 'up' | 'down') => {
    const newTasks = [...tasks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newTasks.length) return;

    [newTasks[index], newTasks[targetIndex]] = [newTasks[targetIndex], newTasks[index]];
    setTasks(newTasks);
  };

  const handleSave = () => {
    if (!name.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    if (tasks.length === 0) {
      alert('Please add at least one task');
      return;
    }

    const chain: TaskChain = {
      id: workflow?.id || `workflow_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      tasks,
      createdAt: workflow?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    onSave(chain);
  };

  const handleParameterChange = (paramName: string, value: any) => {
    setTaskParameters({
      ...taskParameters,
      [paramName]: value,
    });
  };

  const selectedToolDef = availableTools.find(t => t.type === selectedTool);

  return (
    <div className="workflow-builder">
      <h2>{workflow ? 'Edit Workflow' : 'Create New Workflow'}</h2>
      
      <div className="form-section">
        <div className="form-group">
          <label htmlFor="workflow-name">Workflow Name</label>
          <input
            id="workflow-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter workflow name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="workflow-description">Description</label>
          <textarea
            id="workflow-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this workflow does"
            rows={3}
          />
        </div>
      </div>

      <div className="builder-container">
        <div className="tool-selector">
          <h3>Available Tools</h3>
          <select
            value={selectedTool}
            onChange={(e) => setSelectedTool(e.target.value)}
          >
            <option value="">Select a tool...</option>
            {availableTools.map((tool) => (
              <option key={tool.type} value={tool.type}>
                {tool.name}
              </option>
            ))}
          </select>

          {selectedToolDef && selectedToolDef.parameters && (
            <div className="tool-parameters">
              <h4>Parameters</h4>
              {Object.entries(selectedToolDef.parameters).map(([paramName, paramDef]) => (
                <div key={paramName} className="form-group">
                  <label htmlFor={`param-${paramName}`}>
                    {paramName}
                    {paramDef.required && <span className="required">*</span>}
                  </label>
                  <input
                    id={`param-${paramName}`}
                    type={paramDef.type === 'number' ? 'number' : 'text'}
                    value={taskParameters[paramName] || ''}
                    onChange={(e) => handleParameterChange(paramName, e.target.value)}
                    placeholder={paramDef.description}
                  />
                  <small>{paramDef.description}</small>
                </div>
              ))}
            </div>
          )}

          <button
            className="btn btn-primary"
            onClick={handleAddTask}
            disabled={!selectedTool}
          >
            Add Task
          </button>
        </div>

        <div className="task-chain">
          <h3>Task Chain ({tasks.length} tasks)</h3>
          {tasks.length === 0 ? (
            <p className="empty-message">Add tasks from the tool selector</p>
          ) : (
            <div className="task-list">
              {tasks.map((task, index) => (
                <div key={task.id} className="task-item">
                  <div className="task-order">{index + 1}</div>
                  <div className="task-info">
                    <strong>{task.name}</strong>
                    <small>{task.type}</small>
                    {Object.keys(task.parameters).length > 0 && (
                      <div className="task-params">
                        {Object.entries(task.parameters).map(([key, value]) => (
                          <span key={key} className="param-badge">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="task-controls">
                    <button
                      onClick={() => handleMoveTask(index, 'up')}
                      disabled={index === 0}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveTask(index, 'down')}
                      disabled={index === tasks.length - 1}
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      className="btn-danger"
                      onClick={() => handleRemoveTask(task.id)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                  {index < tasks.length - 1 && <div className="task-arrow">↓</div>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn btn-primary" onClick={handleSave}>
          Save Workflow
        </button>
      </div>
    </div>
  );
};

export default WorkflowBuilder;

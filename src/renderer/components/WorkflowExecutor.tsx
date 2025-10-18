import React, { useState } from 'react';
import { TaskChain, ChainExecutionResult } from '../../shared/types';
import './WorkflowExecutor.css';

interface WorkflowExecutorProps {
  workflow: TaskChain;
  onComplete: () => void;
}

const WorkflowExecutor: React.FC<WorkflowExecutorProps> = ({
  workflow,
  onComplete,
}) => {
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState<ChainExecutionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExecute = async () => {
    setExecuting(true);
    setError(null);
    setResult(null);

    try {
      const response = await window.electronAPI.executeWorkflow(workflow);
      
      if (response.success && response.result) {
        setResult(response.result);
      } else {
        setError(response.error || 'Execution failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setExecuting(false);
    }
  };

  const formatDuration = (start: Date, end: Date) => {
    const duration = new Date(end).getTime() - new Date(start).getTime();
    return `${(duration / 1000).toFixed(2)}s`;
  };

  return (
    <div className="workflow-executor">
      <h2>Execute Workflow</h2>

      <div className="workflow-info">
        <h3>{workflow.name}</h3>
        <p>{workflow.description}</p>
      </div>

      <div className="task-preview">
        <h4>Task Chain:</h4>
        <ol>
          {workflow.tasks.map((task) => (
            <li key={task.id}>
              <strong>{task.name}</strong>
              <small> ({task.type})</small>
            </li>
          ))}
        </ol>
      </div>

      {!executing && !result && (
        <button
          className="btn btn-primary btn-large"
          onClick={handleExecute}
        >
          Execute Workflow
        </button>
      )}

      {executing && (
        <div className="execution-status">
          <div className="spinner"></div>
          <p>Executing workflow...</p>
        </div>
      )}

      {error && (
        <div className="execution-error">
          <h4>Error</h4>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="execution-result">
          <div className={`result-header ${result.success ? 'success' : 'failure'}`}>
            <h4>{result.success ? '✓ Success' : '✗ Failed'}</h4>
            <span>Duration: {formatDuration(result.startTime, result.endTime)}</span>
          </div>

          <div className="task-results">
            <h4>Task Results:</h4>
            {result.results.map((taskResult, index) => (
              <div
                key={taskResult.taskId}
                className={`task-result ${taskResult.success ? 'success' : 'failure'}`}
              >
                <div className="task-result-header">
                  <span className="task-number">{index + 1}</span>
                  <span className="task-id">{workflow.tasks[index]?.name || taskResult.taskId}</span>
                  <span className={`status-badge ${taskResult.success ? 'success' : 'failure'}`}>
                    {taskResult.success ? '✓' : '✗'}
                  </span>
                </div>
                {taskResult.error && (
                  <div className="task-error">
                    <strong>Error:</strong> {taskResult.error}
                  </div>
                )}
                {taskResult.data && (
                  <div className="task-data">
                    <strong>Output:</strong>
                    <pre>{JSON.stringify(taskResult.data, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="btn btn-primary" onClick={onComplete}>
            Done
          </button>
        </div>
      )}
    </div>
  );
};

export default WorkflowExecutor;

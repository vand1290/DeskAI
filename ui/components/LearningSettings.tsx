import React, { useState, useEffect } from 'react';

interface LearningStatistics {
  enabled: boolean;
  totalActions: number;
  toolsTracked: number;
  workflowsDetected: number;
  topicsTracked: number;
  lastAnalyzed: number;
}

interface ToolUsagePattern {
  toolName: string;
  usageCount: number;
  lastUsed: number;
  contexts: string[];
}

interface WorkflowPattern {
  id: string;
  sequence: string[];
  frequency: number;
  lastOccurred: number;
}

interface LearningData {
  toolUsage: ToolUsagePattern[];
  workflows: WorkflowPattern[];
  frequentTopics: Array<{ topic: string; count: number }>;
}

export const LearningSettings: React.FC = () => {
  const [statistics, setStatistics] = useState<LearningStatistics | null>(null);
  const [learningData, setLearningData] = useState<LearningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/learning/statistics');
      if (response.ok) {
        const data = await response.json();
        setStatistics(data.statistics);
      }
    } catch (err) {
      console.error('Failed to load learning statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadLearningData = async () => {
    try {
      const response = await fetch('/api/learning/data');
      if (response.ok) {
        const data = await response.json();
        setLearningData(data);
      }
    } catch (err) {
      console.error('Failed to load learning data:', err);
    }
  };

  const handleToggleLearning = async () => {
    if (!statistics) return;

    try {
      const response = await fetch('/api/learning/enabled', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !statistics.enabled })
      });

      if (response.ok) {
        setStatistics({ ...statistics, enabled: !statistics.enabled });
      }
    } catch (err) {
      console.error('Failed to toggle learning mode:', err);
    }
  };

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all learning data? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/learning/reset', { method: 'POST' });
      if (response.ok) {
        await loadStatistics();
        setLearningData(null);
        setShowDetails(false);
      }
    } catch (err) {
      console.error('Failed to reset learning data:', err);
    }
  };

  const handleViewDetails = async () => {
    if (!showDetails) {
      await loadLearningData();
    }
    setShowDetails(!showDetails);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatActionType = (type: string): string => {
    const labels: Record<string, string> = {
      'message': 'Chat',
      'view_analytics': 'View Analytics',
      'search': 'Search',
      'filter': 'Filter',
      'conversation_start': 'Start Conversation',
      'conversation_continue': 'Continue Conversation'
    };
    return labels[type] || type;
  };

  if (loading) {
    return <div className="learning-settings">Loading...</div>;
  }

  if (!statistics) {
    return <div className="learning-settings">Failed to load learning settings.</div>;
  }

  return (
    <div className="learning-settings">
      <div className="settings-header">
        <h2>Learning Mode Settings</h2>
        <p className="privacy-notice">
          🔒 All learning happens locally on your device. No data is sent to the cloud.
        </p>
      </div>

      <div className="settings-section">
        <div className="setting-row">
          <div className="setting-info">
            <h3>Learning Mode</h3>
            <p>
              When enabled, DeskAI analyzes your usage patterns to provide adaptive suggestions
              and personalized recommendations.
            </p>
          </div>
          <button
            className={`toggle-button ${statistics.enabled ? 'enabled' : 'disabled'}`}
            onClick={handleToggleLearning}
          >
            {statistics.enabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      <div className="settings-section">
        <h3>Learning Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">Actions Tracked</div>
            <div className="stat-value">{statistics.totalActions}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Tools Monitored</div>
            <div className="stat-value">{statistics.toolsTracked}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Workflows Detected</div>
            <div className="stat-value">{statistics.workflowsDetected}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Topics Tracked</div>
            <div className="stat-value">{statistics.topicsTracked}</div>
          </div>
        </div>
        {statistics.lastAnalyzed && (
          <p className="last-analyzed">
            Last analyzed: {formatDate(statistics.lastAnalyzed)}
          </p>
        )}
      </div>

      <div className="settings-section">
        <div className="actions-row">
          <button className="secondary-button" onClick={handleViewDetails}>
            {showDetails ? 'Hide Details' : 'View Detailed Data'}
          </button>
          <button className="danger-button" onClick={handleReset}>
            Reset Learning Data
          </button>
        </div>
      </div>

      {showDetails && learningData && (
        <div className="settings-section detailed-data">
          <h3>Detailed Learning Data</h3>
          
          {learningData.toolUsage.length > 0 && (
            <div className="data-section">
              <h4>Tool Usage Patterns</h4>
              <div className="data-list">
                {learningData.toolUsage.slice(0, 10).map((tool, idx) => (
                  <div key={idx} className="data-item">
                    <div className="data-name">{formatActionType(tool.toolName)}</div>
                    <div className="data-info">
                      <span className="usage-count">{tool.usageCount} uses</span>
                      <span className="last-used">Last: {formatDate(tool.lastUsed)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {learningData.workflows.length > 0 && (
            <div className="data-section">
              <h4>Common Workflows</h4>
              <div className="data-list">
                {learningData.workflows.slice(0, 5).map((workflow) => (
                  <div key={workflow.id} className="data-item">
                    <div className="workflow-sequence">
                      {workflow.sequence.map(s => formatActionType(s)).join(' → ')}
                    </div>
                    <div className="workflow-info">
                      <span className="frequency">Occurred {workflow.frequency} times</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {learningData.frequentTopics.length > 0 && (
            <div className="data-section">
              <h4>Frequent Topics</h4>
              <div className="topics-grid">
                {learningData.frequentTopics.slice(0, 10).map((topic, idx) => (
                  <div key={idx} className="topic-tag">
                    <span className="topic-name">{topic.topic}</span>
                    <span className="topic-count">{topic.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .learning-settings {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .settings-header {
          margin-bottom: 30px;
        }

        .settings-header h2 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .privacy-notice {
          color: #28a745;
          font-weight: 500;
          margin: 10px 0;
        }

        .settings-section {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .settings-section h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 18px;
        }

        .settings-section h4 {
          margin: 0 0 10px 0;
          color: #555;
          font-size: 16px;
        }

        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .setting-info {
          flex: 1;
        }

        .setting-info h3 {
          margin: 0 0 5px 0;
          font-size: 16px;
        }

        .setting-info p {
          margin: 0;
          color: #666;
          font-size: 14px;
          line-height: 1.5;
        }

        .toggle-button {
          padding: 10px 24px;
          border: none;
          border-radius: 4px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 100px;
        }

        .toggle-button.enabled {
          background: #28a745;
          color: white;
        }

        .toggle-button.enabled:hover {
          background: #218838;
        }

        .toggle-button.disabled {
          background: #6c757d;
          color: white;
        }

        .toggle-button.disabled:hover {
          background: #5a6268;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 15px;
        }

        .stat-item {
          text-align: center;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: bold;
          color: #007bff;
        }

        .last-analyzed {
          text-align: center;
          color: #666;
          font-size: 14px;
          margin: 10px 0 0 0;
        }

        .actions-row {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }

        .secondary-button {
          padding: 10px 20px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .secondary-button:hover {
          background: #0056b3;
        }

        .danger-button {
          padding: 10px 20px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .danger-button:hover {
          background: #c82333;
        }

        .detailed-data {
          background: #f8f9fa;
        }

        .data-section {
          margin-bottom: 20px;
        }

        .data-section:last-child {
          margin-bottom: 0;
        }

        .data-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .data-item {
          background: white;
          padding: 12px 15px;
          border-radius: 4px;
          border: 1px solid #e0e0e0;
        }

        .data-name {
          font-weight: 600;
          margin-bottom: 5px;
          color: #333;
        }

        .data-info {
          display: flex;
          gap: 15px;
          font-size: 13px;
          color: #666;
        }

        .workflow-sequence {
          font-weight: 500;
          margin-bottom: 5px;
          color: #555;
          font-size: 14px;
        }

        .workflow-info {
          font-size: 13px;
          color: #666;
        }

        .topics-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .topic-tag {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: white;
          border: 1px solid #ddd;
          border-radius: 16px;
          font-size: 14px;
        }

        .topic-name {
          color: #333;
          font-weight: 500;
        }

        .topic-count {
          background: #007bff;
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

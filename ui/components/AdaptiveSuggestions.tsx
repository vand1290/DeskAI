import React, { useState, useEffect } from 'react';

interface AdaptiveSuggestion {
  id: string;
  type: 'tool' | 'workflow' | 'shortcut' | 'topic';
  content: string;
  confidence: number;
  reasoning: string;
}

interface AdaptiveSuggestionsProps {
  onClose?: () => void;
}

export const AdaptiveSuggestions: React.FC<AdaptiveSuggestionsProps> = ({ onClose }) => {
  const [suggestions, setSuggestions] = useState<AdaptiveSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    loadSuggestions();
    checkLearningEnabled();
  }, []);

  const checkLearningEnabled = async () => {
    try {
      const response = await fetch('/api/learning/enabled');
      if (response.ok) {
        const data = await response.json();
        setEnabled(data.enabled);
      }
    } catch (err) {
      console.error('Failed to check learning enabled:', err);
    }
  };

  const loadSuggestions = async () => {
    try {
      const response = await fetch('/api/learning/suggestions?limit=5');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
      }
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type: string): string => {
    const icons: Record<string, string> = {
      'tool': '🛠️',
      'workflow': '🔄',
      'shortcut': '⚡',
      'topic': '📌'
    };
    return icons[type] || '💡';
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return 'High';
    if (confidence >= 0.5) return 'Medium';
    return 'Low';
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return '#28a745';
    if (confidence >= 0.5) return '#ffc107';
    return '#6c757d';
  };

  if (!enabled) {
    return (
      <div className="adaptive-suggestions disabled">
        <div className="suggestions-header">
          <h3>Adaptive Suggestions</h3>
          {onClose && <button className="close-button" onClick={onClose}>×</button>}
        </div>
        <div className="disabled-message">
          <p>Learning mode is disabled. Enable it in Learning Settings to see personalized suggestions.</p>
        </div>
        <style>{getSuggestionsStyles()}</style>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="adaptive-suggestions">
        <div className="suggestions-header">
          <h3>Adaptive Suggestions</h3>
          {onClose && <button className="close-button" onClick={onClose}>×</button>}
        </div>
        <div className="loading">Loading suggestions...</div>
        <style>{getSuggestionsStyles()}</style>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="adaptive-suggestions empty">
        <div className="suggestions-header">
          <h3>Adaptive Suggestions</h3>
          {onClose && <button className="close-button" onClick={onClose}>×</button>}
        </div>
        <div className="empty-message">
          <p>Keep using DeskAI and suggestions will appear here based on your patterns.</p>
        </div>
        <style>{getSuggestionsStyles()}</style>
      </div>
    );
  }

  return (
    <div className="adaptive-suggestions">
      <div className="suggestions-header">
        <h3>💡 Adaptive Suggestions</h3>
        {onClose && <button className="close-button" onClick={onClose}>×</button>}
      </div>
      <p className="suggestions-intro">
        Based on your usage patterns, here are some personalized recommendations:
      </p>
      <div className="suggestions-list">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="suggestion-card">
            <div className="suggestion-header">
              <span className="suggestion-icon">{getIconForType(suggestion.type)}</span>
              <span className="suggestion-type">{suggestion.type}</span>
              <span 
                className="confidence-badge"
                style={{ backgroundColor: getConfidenceColor(suggestion.confidence) }}
              >
                {getConfidenceLabel(suggestion.confidence)} confidence
              </span>
            </div>
            <div className="suggestion-content">
              {suggestion.content}
            </div>
            <div className="suggestion-reasoning">
              {suggestion.reasoning}
            </div>
          </div>
        ))}
      </div>
      <style>{getSuggestionsStyles()}</style>
    </div>
  );
};

function getSuggestionsStyles(): string {
  return `
    .adaptive-suggestions {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .adaptive-suggestions.disabled,
    .adaptive-suggestions.empty {
      text-align: center;
    }

    .suggestions-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .suggestions-header h3 {
      margin: 0;
      font-size: 20px;
      color: #333;
    }

    .close-button {
      background: none;
      border: none;
      font-size: 28px;
      color: #999;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .close-button:hover {
      color: #333;
    }

    .suggestions-intro {
      margin: 0 0 15px 0;
      color: #666;
      font-size: 14px;
    }

    .disabled-message,
    .empty-message {
      padding: 40px 20px;
      color: #666;
    }

    .disabled-message p,
    .empty-message p {
      margin: 0;
      line-height: 1.6;
    }

    .loading {
      text-align: center;
      padding: 40px 20px;
      color: #666;
    }

    .suggestions-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .suggestion-card {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      padding: 15px;
      transition: all 0.2s;
    }

    .suggestion-card:hover {
      border-color: #007bff;
      box-shadow: 0 2px 8px rgba(0,123,255,0.1);
    }

    .suggestion-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
    }

    .suggestion-icon {
      font-size: 20px;
    }

    .suggestion-type {
      font-size: 12px;
      text-transform: uppercase;
      color: #666;
      font-weight: 600;
      letter-spacing: 0.5px;
      flex: 1;
    }

    .confidence-badge {
      font-size: 11px;
      padding: 3px 8px;
      border-radius: 10px;
      color: white;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .suggestion-content {
      font-size: 15px;
      color: #333;
      font-weight: 500;
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .suggestion-reasoning {
      font-size: 13px;
      color: #666;
      font-style: italic;
    }
  `;
}

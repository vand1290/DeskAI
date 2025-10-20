import React, { useState } from 'react';

interface RequestInputProps {
  onSubmit: (query: string, model: string) => void;
  availableModels: string[];
  disabled?: boolean;
}

const RequestInput: React.FC<RequestInputProps> = ({
  onSubmit,
  availableModels,
  disabled = false
}) => {
  const [query, setQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState(availableModels[0] || 'qwen2.5:7b');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (query.trim()) {
      onSubmit(query, selectedModel);
    }
  };

  return (
    <div className="request-input">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="model-select">Model:</label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            disabled={disabled}
            className="model-select"
          >
            {availableModels.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label htmlFor="query-input">Your Request:</label>
          <textarea
            id="query-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your request here... (e.g., 'Calculate 2+2' or 'Explain quantum computing')"
            disabled={disabled}
            rows={4}
            className="query-input"
          />
        </div>

        <button
          type="submit"
          disabled={disabled || !query.trim()}
          className="submit-button"
        >
          {disabled ? 'Processing...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default RequestInput;

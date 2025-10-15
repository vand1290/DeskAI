interface Model {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}

interface ModelSelectorProps {
  models: Model[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}

function ModelSelector({ models, selectedModel, onSelectModel }: ModelSelectorProps) {
  return (
    <div className="model-selector">
      <h3>Models</h3>
      <div className="model-list">
        {models.map((model) => (
          <button
            key={model.id}
            className={`model-item ${selectedModel === model.id ? 'selected' : ''}`}
            onClick={() => onSelectModel(model.id)}
          >
            <div className="model-name">{model.name}</div>
            <div className="model-description">{model.description}</div>
            <div className="model-capabilities">
              {model.capabilities.map((cap) => (
                <span key={cap} className="capability-badge">
                  {cap}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ModelSelector;

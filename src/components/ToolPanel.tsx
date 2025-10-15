interface ToolPanelProps {
  tools: string[];
  onExecuteTool: (tool: string) => void;
}

function ToolPanel({ tools, onExecuteTool }: ToolPanelProps) {
  return (
    <div className="tool-panel">
      <h3>Tools</h3>
      <div className="tool-list">
        {tools.map((tool) => (
          <button
            key={tool}
            className="tool-item"
            onClick={() => onExecuteTool(tool)}
          >
            <span className="tool-icon">🔧</span>
            <span className="tool-name">{tool}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default ToolPanel;

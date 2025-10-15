import React from 'react';

interface AgentResponse {
  result: string;
  route: string;
  toolsUsed: string[];
  deterministic: boolean;
}

interface ResponseDisplayProps {
  response: AgentResponse;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ response }) => {
  return (
    <div className="response-display">
      <h2>Response</h2>
      
      <div className="response-metadata">
        <div className="metadata-item">
          <strong>Route:</strong> <code>{response.route}</code>
        </div>
        
        {response.toolsUsed.length > 0 && (
          <div className="metadata-item">
            <strong>Tools Used:</strong>{' '}
            {response.toolsUsed.map((tool, index) => (
              <span key={tool}>
                <code>{tool}</code>
                {index < response.toolsUsed.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}
        
        <div className="metadata-item">
          <strong>Deterministic:</strong>{' '}
          <span className={response.deterministic ? 'badge-success' : 'badge-warning'}>
            {response.deterministic ? '✓ Yes' : '✗ No'}
          </span>
        </div>
      </div>

      <div className="response-content">
        <pre>{response.result}</pre>
      </div>
    </div>
  );
};

export default ResponseDisplay;

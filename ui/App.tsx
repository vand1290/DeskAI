import React, { useState } from 'react';
import RequestInput from './components/RequestInput';
import ResponseDisplay from './components/ResponseDisplay';

interface AgentResponse {
  result: string;
  route: string;
  toolsUsed: string[];
  deterministic: boolean;
}

const App: React.FC = () => {
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available models (in production, this would come from backend)
  const availableModels = ['qwen2.5:7b', 'llama2:7b', 'mistral:7b'];

  const handleSubmit = async (query: string, model: string) => {
    setLoading(true);
    setError(null);

    try {
      // In production, this would call the backend API via Tauri
      // For now, simulate with deterministic response
      await new Promise(resolve => setTimeout(resolve, 500));

      const mockResponse: AgentResponse = {
        result: `[${model}] Processing: "${query}"\n\nThis is an offline deterministic response. In production, this would connect to your local model runner.`,
        route: `model:${model}`,
        toolsUsed: query.toLowerCase().includes('calculate') ? ['calculator'] : [],
        deterministic: true
      };

      setResponse(mockResponse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 DeskAI</h1>
        <p className="subtitle">100% Offline Meta-Agent</p>
      </header>

      <main className="app-main">
        <RequestInput
          onSubmit={handleSubmit}
          availableModels={availableModels}
          disabled={loading}
        />

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="loading-message">
            Processing request...
          </div>
        )}

        {response && !loading && (
          <ResponseDisplay response={response} />
        )}
      </main>

      <footer className="app-footer">
        <p>🔒 All processing happens locally on your device</p>
      </footer>
    </div>
  );
};

export default App;

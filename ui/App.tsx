import React, { useState } from 'react';
import RequestInput from './components/RequestInput';
import ResponseDisplay from './components/ResponseDisplay';
import SecretaryDashboard from './components/SecretaryDashboard';
import WritingEditor from './components/WritingEditor';
import DocumentProcessor from './components/DocumentProcessor';
import FileManager from './components/FileManager';
import OCRViewer from './components/OCRViewer';
import HandwritingRecognizer from './components/HandwritingRecognizer';

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
  const [activeView, setActiveView] = useState<'agent' | 'secretary'>('agent');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

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

  const handleToolExecution = async (toolName: string, params: any): Promise<any> => {
    // In production, this would call the backend via Tauri
    // For now, return mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Tool executed (mock)' });
      }, 500);
    });
  };

  const renderSecretaryTool = () => {
    switch (selectedTool) {
      case 'writing':
        return <WritingEditor onExecute={handleToolExecution} />;
      case 'document_processor':
        return <DocumentProcessor onExecute={handleToolExecution} />;
      case 'file_manager':
        return <FileManager onExecute={handleToolExecution} />;
      case 'ocr':
        return <OCRViewer onExecute={handleToolExecution} />;
      case 'handwriting':
        return <HandwritingRecognizer onExecute={handleToolExecution} />;
      default:
        return <SecretaryDashboard onToolSelect={setSelectedTool} />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🤖 DeskAI</h1>
        <p className="subtitle">100% Offline Meta-Agent with Personal Secretary</p>
        
        <div className="view-switcher">
          <button 
            className={activeView === 'agent' ? 'active' : ''}
            onClick={() => setActiveView('agent')}
          >
            Agent
          </button>
          <button 
            className={activeView === 'secretary' ? 'active' : ''}
            onClick={() => setActiveView('secretary')}
          >
            Secretary Tools
          </button>
        </div>
      </header>

      <main className="app-main">
        {activeView === 'agent' ? (
          <>
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
          </>
        ) : (
          <div className="secretary-view">
            {selectedTool && (
              <button 
                className="back-button"
                onClick={() => setSelectedTool(null)}
              >
                ← Back to Dashboard
              </button>
            )}
            {renderSecretaryTool()}
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>🔒 All processing happens locally on your device</p>
      </footer>
    </div>
  );
};

export default App;

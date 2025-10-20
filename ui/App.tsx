import React, { useState } from 'react';
<<<<<<< HEAD
import { invoke } from '@tauri-apps/api/tauri';
import './App.css';
=======
import RequestInput from './components/RequestInput';
import ResponseDisplay from './components/ResponseDisplay';
import SecretaryDashboard from './components/SecretaryDashboard';
import WritingEditor from './components/WritingEditor';
import DocumentProcessor from './components/DocumentProcessor';
import FileManager from './components/FileManager';
import OCRViewer from './components/OCRViewer';
import HandwritingRecognizer from './components/HandwritingRecognizer';
>>>>>>> 4548ebb8f1fa32802dbc65903bff956d62fd4c28

interface AgentResponse {
  result: string;
  route: string;
  toolsUsed: string[];
  deterministic: boolean;
}

<<<<<<< HEAD
interface FileResult {
  name: string;
  path: string;
  is_dir: boolean;
  size?: number;
}

=======
>>>>>>> 4548ebb8f1fa32802dbc65903bff956d62fd4c28
const App: React.FC = () => {
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'agent' | 'secretary'>('agent');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
<<<<<<< HEAD
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileResult[]>([]);
  const [ocrResults, setOcrResults] = useState<Map<string, string>>(new Map());
  const [ocrSearchQuery, setOcrSearchQuery] = useState('');

  const handleFileSearch = async () => {
    setLoading(true);
    try {
      const results = await invoke<FileResult[]>('search_files', { query: searchQuery });
      setSearchResults(results);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  const handleFileOpen = async (filePath: string) => {
    try {
      const content = await invoke<string>('read_file', { filePath });
      alert(`File content:\n\n${content.substring(0, 500)}...`);
    } catch (err) {
      setError(err as string);
    }
  };

  const handleOCR = async () => {
    try {
      // Open file picker
      const { open } = await import('@tauri-apps/api/dialog');
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Images',
          extensions: ['png', 'jpg', 'jpeg', 'bmp', 'gif']
        }]
      });

      if (selected && typeof selected === 'string') {
        setLoading(true);
        const result = await invoke<string>('extract_text_from_image', { imagePath: selected });
        setResponse({
          result,
          route: 'ocr',
          toolsUsed: ['ocr'],
          deterministic: true
        });
        setLoading(false);
      }
    } catch (err) {
      setError(err as string);
      setLoading(false);
    }
  };

  const handleOCRSearch = async () => {
    setLoading(true);
    setOcrResults(new Map());
    
    try {
      // Search for image files
      const imageExtensions = ['png', 'jpg', 'jpeg', 'bmp', 'gif'];
      const allResults: FileResult[] = [];
      
      for (const ext of imageExtensions) {
        const results = await invoke<FileResult[]>('search_files', { query: `.${ext}` });
        allResults.push(...results.filter((r: FileResult) => !r.is_dir));
      }
      
      setSearchResults(allResults);
      
      // Process OCR on found images
      const newOcrResults = new Map<string, string>();
      
      for (const file of allResults.slice(0, 20)) { // Limit to first 20 images
        try {
          const text = await invoke<string>('extract_text_from_image', { imagePath: file.path });
          newOcrResults.set(file.path, text);
        } catch (err) {
          console.error(`OCR failed for ${file.path}:`, err);
        }
      }
      
      setOcrResults(newOcrResults);
      
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  const handleOCROnFile = async (filePath: string) => {
    setLoading(true);
    try {
      const text = await invoke<string>('extract_text_from_image', { imagePath: filePath });
      const newOcrResults = new Map(ocrResults);
      newOcrResults.set(filePath, text);
      setOcrResults(newOcrResults);
      
      setResponse({
        result: text,
        route: 'ocr',
        toolsUsed: ['ocr'],
        deterministic: true
      });
    } catch (err) {
      setError(err as string);
=======

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
>>>>>>> 4548ebb8f1fa32802dbc65903bff956d62fd4c28
    } finally {
      setLoading(false);
    }
  };

<<<<<<< HEAD
  const filteredOCRResults = () => {
    if (!ocrSearchQuery) return Array.from(ocrResults.entries());
    
    return Array.from(ocrResults.entries()).filter(([_, text]) =>
      text.toLowerCase().includes(ocrSearchQuery.toLowerCase())
    );
=======
  const handleToolExecution = async (toolName: string, params: any): Promise<any> => {
    // In production, this would call the backend via Tauri
    // For now, return mock response
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: 'Tool executed (mock)' });
      }, 500);
    });
>>>>>>> 4548ebb8f1fa32802dbc65903bff956d62fd4c28
  };

  const renderSecretaryTool = () => {
    switch (selectedTool) {
<<<<<<< HEAD
      case 'file_search':
        return (
          <div className="tool-panel">
            <h3>File Search</h3>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter filename to search..."
              className="search-input"
            />
            <button onClick={handleFileSearch} disabled={loading}>
              {loading ? 'Searching...' : 'Search Files'}
            </button>
            {searchResults.length > 0 && (
              <div className="search-results">
                <h4>Results: {searchResults.length} files</h4>
                <ul>
                  {searchResults.map((file, idx) => (
                    <li key={idx} onClick={() => !file.is_dir && handleFileOpen(file.path)}>
                      {file.is_dir ? '📁' : '📄'} {file.name}
                      <br />
                      <small>{file.path}</small>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      
      case 'ocr':
        return (
          <div className="tool-panel">
            <h3>OCR - Extract Text from Images</h3>
            
            <div className="ocr-actions">
              <button onClick={handleOCR} disabled={loading}>
                📷 Select Single Image
              </button>
              
              <button onClick={handleOCRSearch} disabled={loading}>
                🔍 Search & Scan All Images
              </button>
            </div>

            {ocrResults.size > 0 && (
              <div className="ocr-search">
                <h4>Search in extracted text:</h4>
                <input
                  type="text"
                  value={ocrSearchQuery}
                  onChange={(e) => setOcrSearchQuery(e.target.value)}
                  placeholder="Search in OCR results..."
                  className="search-input"
                />
              </div>
            )}

            {loading && <p>Processing images... This may take a while.</p>}

            {filteredOCRResults().length > 0 && (
              <div className="ocr-results">
                <h4>Extracted Text ({filteredOCRResults().length} results):</h4>
                {filteredOCRResults().map(([path, text]) => (
                  <div key={path} className="ocr-result-item">
                    <strong>📄 {path.split('\\').pop()}</strong>
                    <small>{path}</small>
                    <pre>{text}</pre>
                  </div>
                ))}
              </div>
            )}

            {searchResults.length > 0 && ocrResults.size === 0 && !loading && (
              <div className="image-results">
                <h4>Found {searchResults.length} images (click to OCR):</h4>
                <ul>
                  {searchResults.map((file, idx) => (
                    <li key={idx} onClick={() => handleOCROnFile(file.path)}>
                      🖼️ {file.name}
                      <br />
                      <small>{file.path}</small>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {response && response.route === 'ocr' && (
              <div className="ocr-single-result">
                <h4>Extracted Text:</h4>
                <pre>{response.result}</pre>
              </div>
            )}
          </div>
        );
      
      case 'calendar':
        return (
          <div className="tool-panel">
            <h3>Calendar</h3>
            <p>Calendar integration coming soon...</p>
          </div>
        );
      
      case 'email':
        return (
          <div className="tool-panel">
            <h3>Email</h3>
            <p>Email integration coming soon...</p>
          </div>
        );

      default:
        return <p>Select a tool from the left</p>;
=======
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
>>>>>>> 4548ebb8f1fa32802dbc65903bff956d62fd4c28
    }
  };

  return (
    <div className="app">
<<<<<<< HEAD
      <header>
        <h1>DeskAI</h1>
        <nav>
          <button onClick={() => setActiveView('agent')}>Agent</button>
          <button onClick={() => setActiveView('secretary')}>Secretary</button>
        </nav>
      </header>

      <main>
        {activeView === 'agent' ? (
          <div className="agent-view">
            {/* Agent interface */}
            <p>Agent view - Query your AI models</p>
          </div>
        ) : (
          <div className="secretary-view">
            <aside className="tools-sidebar">
              <h3>Tools</h3>
              <ul>
                <li onClick={() => setSelectedTool('file_search')}>📁 File Search</li>
                <li onClick={() => setSelectedTool('ocr')}>📷 OCR</li>
                <li onClick={() => setSelectedTool('calendar')}>📅 Calendar</li>
                <li onClick={() => setSelectedTool('email')}>📧 Email</li>
              </ul>
            </aside>
            <div className="tool-content">
              {renderSecretaryTool()}
            </div>
          </div>
        )}

        {error && <div className="error">{error}</div>}
      </main>
=======
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
>>>>>>> 4548ebb8f1fa32802dbc65903bff956d62fd4c28
    </div>
  );
};

export default App;

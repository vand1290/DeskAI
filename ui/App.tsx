import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import './app.css';

interface AgentResponse {
  result: string;
  route: string;
  toolsUsed: string[];
  deterministic: boolean;
}

interface FileResult {
  name: string;
  path: string;
  is_dir: boolean;
  size?: number;
}

interface OllamaStatus {
  installed: boolean;
  running: boolean;
  message: string;
}

const App: React.FC = () => {
  const [response, setResponse] = useState<AgentResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'agent' | 'secretary'>('agent');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileResult[]>([]);
  const [ocrResults, setOcrResults] = useState<Map<string, string>>(new Map());
  const [ocrSearchQuery, setOcrSearchQuery] = useState('');
  const [ollamaStatus, setOllamaStatus] = useState<OllamaStatus | null>(null);
  const [query, setQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState('qwen2.5:7b');

  // Check Ollama status on startup
  useEffect(() => {
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    try {
      const status = await invoke<OllamaStatus>('check_ollama_status');
      setOllamaStatus(status);
    } catch (err) {
      console.error('Failed to check Ollama status:', err);
    }
  };

  const startOllama = async () => {
    try {
      setLoading(true);
      await invoke<string>('start_ollama');
      setTimeout(checkOllamaStatus, 3000);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setResponse(null);
    
    // Safety timeout - force stop loading after 2 minutes
    const safetyTimeout = setTimeout(() => {
      setLoading(false);
      setError('Query timed out after 2 minutes. Please try again with a simpler question.');
    }, 120000);
    
    try {
      const resultString = await invoke<string>('process_request', { 
        query,
        model: selectedModel 
      });
      clearTimeout(safetyTimeout);
      const result = JSON.parse(resultString) as AgentResponse;
      setResponse(result);
      setQuery(''); // Clear input after successful query
    } catch (err) {
      clearTimeout(safetyTimeout);
      setError(typeof err === 'string' ? err : JSON.stringify(err));
    } finally {
      setLoading(false);
    }
  };

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
      const imageExtensions = ['png', 'jpg', 'jpeg', 'bmp', 'gif'];
      const allResults: FileResult[] = [];
      
      for (const ext of imageExtensions) {
        const results = await invoke<FileResult[]>('search_files', { query: `.${ext}` });
        allResults.push(...results.filter((r: FileResult) => !r.is_dir));
      }
      
      setSearchResults(allResults);
      
      const newOcrResults = new Map<string, string>();
      
      for (const file of allResults.slice(0, 20)) {
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
    } finally {
      setLoading(false);
    }
  };

  const filteredOCRResults = () => {
    if (!ocrSearchQuery) return Array.from(ocrResults.entries());
    
    return Array.from(ocrResults.entries()).filter(([_, text]) =>
      text.toLowerCase().includes(ocrSearchQuery.toLowerCase())
    );
  };

  const renderSecretaryTool = () => {
    switch (selectedTool) {
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
    }
  };

  return (
    <div className="app">
      <header>
        <h1>DeskAI</h1>
        <nav>
          <button onClick={() => setActiveView('agent')}>Agent</button>
          <button onClick={() => setActiveView('secretary')}>Secretary</button>
        </nav>
      </header>

      {ollamaStatus && !ollamaStatus.running && (
        <div className="warning-banner">
          ⚠️ {ollamaStatus.message}
          {ollamaStatus.installed && (
            <button onClick={startOllama} disabled={loading}>
              Start Ollama
            </button>
          )}
          {!ollamaStatus.installed && (
            <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer">
              Download Ollama
            </a>
          )}
        </div>
      )}

      <main>
        {activeView === 'agent' ? (
          <div className="agent-view">
            <h2>AI Agent - Query your Local Models</h2>
            
            <div className="model-selector">
              <label htmlFor="model-select">Select Model:</label>
              <select 
                id="model-select" 
                value={selectedModel} 
                onChange={(e) => setSelectedModel(e.target.value)}
              >
                <option value="qwen2.5:7b">Qwen 2.5 7B</option>
                <option value="granite3.1-dense:8b">Granite 3.1 Dense 8B</option>
                <option value="llama3.2:3b">Llama 3.2 3B</option>
                <option value="deepseek-r1:8b">DeepSeek R1 8B</option>
                <option value="gemma3:12b">Gemma 3 12B</option>
                <option value="aya-expanse">Aya Expanse</option>
                <option value="qwen2.5-coder:7b">Qwen 2.5 Coder 7B</option>
                <option value="llama3">Llama 3</option>
              </select>
            </div>

            <div className="query-input">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.ctrlKey && !loading) {
                    handleQuery();
                  }
                }}
                placeholder="Ask your AI anything... (Ctrl+Enter to send)"
                rows={4}
                disabled={loading}
              />
              <div className="button-group">
                <button onClick={handleQuery} disabled={loading || !query.trim()}>
                  {loading ? '⏳ Processing...' : '🚀 Send Query'}
                </button>
                {loading && (
                  <button onClick={() => { setLoading(false); setError('Query cancelled by user'); }} className="cancel-btn">
                    ❌ Cancel
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="error-message">
                ❌ <strong>Error:</strong> {error}
              </div>
            )}

            {response && (
              <div className="response-container">
                <div className="response-header">
                  <strong>Response from {response.route}:</strong>
                  {response.toolsUsed.length > 0 && (
                    <span className="tools-used">
                      Tools: {response.toolsUsed.join(', ')}
                    </span>
                  )}
                </div>
                <div className="response-content">
                  <pre>{response.result}</pre>
                </div>
              </div>
            )}
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
    </div>
  );
};

export default App;

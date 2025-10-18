import React, { useState, useEffect } from 'react';

interface Document {
  filename: string;
  size: number;
  created: number;
  modified: number;
  type: string;
}

interface ToolsProps {
  // Future: onMessage could be used to send notifications
}

type ActiveTool = 'writing' | 'photo' | 'document' | 'sorting' | null;

export const ToolsPanel: React.FC<ToolsProps> = () => {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [images, setImages] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  // Writing tool state
  const [filename, setFilename] = useState('');
  const [content, setContent] = useState('');

  // Document tool state
  const [summaryResult, setSummaryResult] = useState<any>(null);
  const [extractionResult, setExtractionResult] = useState<any>(null);

  // Sorting tool state
  const [sortDirectory, setSortDirectory] = useState('./out/documents');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortResult, setSortResult] = useState<any>(null);

  useEffect(() => {
    if (activeTool === 'writing') {
      loadDocuments();
    } else if (activeTool === 'photo') {
      loadImages();
    }
  }, [activeTool]);

  const loadDocuments = async () => {
    try {
      const response = await fetch('/api/tools/listDocuments');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const loadImages = async () => {
    try {
      const response = await fetch('/api/tools/listImages');
      if (response.ok) {
        const data = await response.json();
        setImages(data.images || []);
      }
    } catch (err) {
      console.error('Failed to load images:', err);
    }
  };

  const handleCreateDocument = async () => {
    if (!filename || !content) {
      setResult('Error: Filename and content are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/tools/createDocument', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, content })
      });

      const data = await response.json();
      if (data.success) {
        setResult(`Document created: ${filename}`);
        setFilename('');
        setContent('');
        loadDocuments();
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleReadDocument = async (docFilename: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tools/readDocument?filename=${encodeURIComponent(docFilename)}`);
      const data = await response.json();
      
      if (data.success) {
        setContent(data.content);
        setResult(`Loaded: ${docFilename}`);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarizeDocument = async (docFilename: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tools/summarizeDocument?filename=${encodeURIComponent(docFilename)}`);
      const data = await response.json();
      
      if (data.success) {
        setSummaryResult(data);
        setResult('Document summarized successfully');
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractData = async (docFilename: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tools/extractData?filename=${encodeURIComponent(docFilename)}`);
      const data = await response.json();
      
      if (data.success) {
        setExtractionResult(data.extracted);
        setResult('Data extracted successfully');
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleExtractTextFromImage = async (imageFilename: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/tools/extractTextFromImage?filename=${encodeURIComponent(imageFilename)}`);
      const data = await response.json();
      
      if (data.success) {
        setResult(
          `OCR Result (Stub):\n${data.extractedText}\n\n${data.message}`
        );
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSortFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tools/sortFiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          directory: sortDirectory,
          criteria: { by: sortBy, order: sortOrder }
        })
      });

      const data = await response.json();
      if (data.success) {
        setSortResult(data);
        setResult(`Sorted ${data.fileCount} files by ${sortBy} (${sortOrder})`);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizeByDate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tools/organizeByDate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ directory: sortDirectory })
      });

      const data = await response.json();
      if (data.success) {
        setSortResult(data);
        setResult(`Organized into ${data.groupCount} date groups`);
      } else {
        setResult(`Error: ${data.error}`);
      }
    } catch (err) {
      setResult(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="tools-panel">
      <div className="tools-header">
        <h2>Secretary Tools</h2>
        <p className="tools-subtitle">100% Offline Document Management & Processing</p>
      </div>

      <div className="tool-selector">
        <button
          className={activeTool === 'writing' ? 'active' : ''}
          onClick={() => setActiveTool('writing')}
        >
          📝 Writing Tool
        </button>
        <button
          className={activeTool === 'photo' ? 'active' : ''}
          onClick={() => setActiveTool('photo')}
        >
          📷 Photo Tool
        </button>
        <button
          className={activeTool === 'document' ? 'active' : ''}
          onClick={() => setActiveTool('document')}
        >
          📄 Document Tool
        </button>
        <button
          className={activeTool === 'sorting' ? 'active' : ''}
          onClick={() => setActiveTool('sorting')}
        >
          📁 File Sorting
        </button>
      </div>

      {result && (
        <div className="result-box">
          <pre>{result}</pre>
        </div>
      )}

      {activeTool === 'writing' && (
        <div className="tool-content">
          <h3>Writing Tool</h3>
          <p>Create, edit, and manage text documents.</p>

          <div className="form-section">
            <h4>Create/Edit Document</h4>
            <input
              type="text"
              placeholder="Filename (e.g., notes.txt)"
              value={filename}
              onChange={(e) => setFilename(e.target.value)}
            />
            <textarea
              placeholder="Document content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
            />
            <button onClick={handleCreateDocument} disabled={loading}>
              {loading ? 'Saving...' : 'Create Document'}
            </button>
          </div>

          <div className="documents-list">
            <h4>Your Documents ({documents.length})</h4>
            {documents.length === 0 ? (
              <p className="empty-message">No documents yet. Create one above!</p>
            ) : (
              <div className="file-grid">
                {documents.map((doc) => (
                  <div key={doc.filename} className="file-card">
                    <div className="file-name">{doc.filename}</div>
                    <div className="file-meta">
                      {formatFileSize(doc.size)} • {new Date(doc.modified).toLocaleDateString()}
                    </div>
                    <div className="file-actions">
                      <button onClick={() => handleReadDocument(doc.filename)}>Open</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTool === 'photo' && (
        <div className="tool-content">
          <h3>Photo Tool</h3>
          <p>View images and extract text using OCR (stub implementation).</p>

          <div className="images-list">
            <h4>Your Images ({images.length})</h4>
            {images.length === 0 ? (
              <p className="empty-message">
                No images found. Place images in ./out/photos/ directory.
              </p>
            ) : (
              <div className="file-grid">
                {images.map((img) => (
                  <div key={img.filename} className="file-card">
                    <div className="file-name">{img.filename}</div>
                    <div className="file-meta">
                      {formatFileSize(img.size)} • {img.type}
                    </div>
                    <div className="file-actions">
                      <button onClick={() => handleExtractTextFromImage(img.filename)}>
                        Extract Text (OCR Stub)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTool === 'document' && (
        <div className="tool-content">
          <h3>Document Tool</h3>
          <p>Summarize and extract structured data from documents.</p>

          <div className="documents-list">
            <h4>Documents ({documents.length})</h4>
            {documents.length === 0 ? (
              <p className="empty-message">No documents available.</p>
            ) : (
              <div className="file-grid">
                {documents.map((doc) => (
                  <div key={doc.filename} className="file-card">
                    <div className="file-name">{doc.filename}</div>
                    <div className="file-meta">
                      {formatFileSize(doc.size)}
                    </div>
                    <div className="file-actions">
                      <button onClick={() => handleSummarizeDocument(doc.filename)}>
                        Summarize
                      </button>
                      <button onClick={() => handleExtractData(doc.filename)}>
                        Extract Data
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {summaryResult && (
            <div className="result-detail">
              <h4>Summary Result</h4>
              <p><strong>Original:</strong> {summaryResult.originalLength} chars, {summaryResult.wordCount} words</p>
              <pre className="summary-text">{summaryResult.summary}</pre>
              {summaryResult.isStub && (
                <p className="stub-notice">⚠️ {summaryResult.message}</p>
              )}
            </div>
          )}

          {extractionResult && (
            <div className="result-detail">
              <h4>Extracted Data</h4>
              {extractionResult.emails?.length > 0 && (
                <div>
                  <strong>Emails:</strong>
                  <ul>
                    {extractionResult.emails.map((email: string, i: number) => (
                      <li key={i}>{email}</li>
                    ))}
                  </ul>
                </div>
              )}
              {extractionResult.dates?.length > 0 && (
                <div>
                  <strong>Dates:</strong>
                  <ul>
                    {extractionResult.dates.map((date: string, i: number) => (
                      <li key={i}>{date}</li>
                    ))}
                  </ul>
                </div>
              )}
              {extractionResult.phones?.length > 0 && (
                <div>
                  <strong>Phone Numbers:</strong>
                  <ul>
                    {extractionResult.phones.map((phone: string, i: number) => (
                      <li key={i}>{phone}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTool === 'sorting' && (
        <div className="tool-content">
          <h3>File Sorting & Organization</h3>
          <p>Sort and organize files in a directory by various criteria.</p>

          <div className="form-section">
            <h4>Sort Files</h4>
            <input
              type="text"
              placeholder="Directory path"
              value={sortDirectory}
              onChange={(e) => setSortDirectory(e.target.value)}
            />
            <div className="sort-controls">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                <option value="name">Name</option>
                <option value="date">Date</option>
                <option value="size">Size</option>
                <option value="type">Type</option>
              </select>
              <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
            <div className="button-group">
              <button onClick={handleSortFiles} disabled={loading}>
                Sort Files
              </button>
              <button onClick={handleOrganizeByDate} disabled={loading}>
                Organize by Date
              </button>
            </div>
          </div>

          {sortResult && sortResult.files && (
            <div className="result-detail">
              <h4>Sorted Files ({sortResult.fileCount})</h4>
              <div className="file-grid">
                {sortResult.files.slice(0, 20).map((file: any, i: number) => (
                  <div key={i} className="file-card">
                    <div className="file-name">{file.filename}</div>
                    <div className="file-meta">
                      {formatFileSize(file.size)} • {file.type}
                    </div>
                  </div>
                ))}
              </div>
              {sortResult.fileCount > 20 && (
                <p className="truncated-notice">
                  Showing 20 of {sortResult.fileCount} files
                </p>
              )}
            </div>
          )}

          {sortResult && sortResult.groups && (
            <div className="result-detail">
              <h4>Organized Files ({sortResult.groupCount} groups)</h4>
              {Object.entries(sortResult.groups).map(([key, files]: [string, any]) => (
                <div key={key} className="group-section">
                  <h5>{key} ({files.length} files)</h5>
                  <ul>
                    {files.slice(0, 5).map((file: string, i: number) => (
                      <li key={i}>{file}</li>
                    ))}
                    {files.length > 5 && <li>...and {files.length - 5} more</li>}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        .tools-panel {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .tools-header {
          margin-bottom: 20px;
        }

        .tools-header h2 {
          margin: 0 0 5px 0;
        }

        .tools-subtitle {
          color: #666;
          font-size: 14px;
          margin: 0;
        }

        .tool-selector {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .tool-selector button {
          padding: 10px 20px;
          background: white;
          border: 2px solid #ddd;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .tool-selector button:hover {
          border-color: #007bff;
        }

        .tool-selector button.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .result-box {
          background: #f8f9fa;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 20px;
          font-family: monospace;
        }

        .result-box pre {
          margin: 0;
          white-space: pre-wrap;
          word-wrap: break-word;
        }

        .tool-content {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
        }

        .tool-content h3 {
          margin: 0 0 10px 0;
        }

        .tool-content > p {
          color: #666;
          margin: 0 0 20px 0;
        }

        .form-section {
          margin-bottom: 30px;
          padding-bottom: 30px;
          border-bottom: 1px solid #eee;
        }

        .form-section h4 {
          margin: 0 0 15px 0;
        }

        .form-section input,
        .form-section textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 10px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-section button {
          padding: 10px 24px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .form-section button:hover:not(:disabled) {
          background: #0056b3;
        }

        .form-section button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .sort-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .sort-controls select {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .button-group {
          display: flex;
          gap: 10px;
        }

        .button-group button {
          flex: 1;
        }

        .documents-list,
        .images-list {
          margin-top: 20px;
        }

        .documents-list h4,
        .images-list h4 {
          margin: 0 0 15px 0;
        }

        .empty-message {
          color: #666;
          font-style: italic;
          text-align: center;
          padding: 20px;
        }

        .file-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 15px;
        }

        .file-card {
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 15px;
          background: #fafafa;
        }

        .file-name {
          font-weight: 600;
          margin-bottom: 5px;
          word-break: break-all;
        }

        .file-meta {
          font-size: 12px;
          color: #666;
          margin-bottom: 10px;
        }

        .file-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .file-actions button {
          padding: 6px 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .file-actions button:hover {
          background: #0056b3;
        }

        .result-detail {
          margin-top: 20px;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .result-detail h4 {
          margin: 0 0 15px 0;
        }

        .summary-text {
          background: white;
          padding: 15px;
          border-radius: 4px;
          white-space: pre-wrap;
          margin: 10px 0;
        }

        .stub-notice {
          color: #856404;
          background: #fff3cd;
          padding: 10px;
          border-radius: 4px;
          margin-top: 10px;
        }

        .result-detail ul {
          margin: 5px 0;
          padding-left: 20px;
        }

        .result-detail li {
          margin: 3px 0;
        }

        .group-section {
          margin-bottom: 15px;
        }

        .group-section h5 {
          margin: 0 0 8px 0;
          color: #007bff;
        }

        .truncated-notice {
          text-align: center;
          color: #666;
          font-style: italic;
          margin-top: 15px;
        }
      `}</style>
    </div>
  );
};

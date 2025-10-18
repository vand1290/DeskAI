import React, { useState, useEffect } from 'react';
import { ScannedDocument } from '../../src/memory';

interface ScanSearchProps {
  onViewDocument?: (document: ScannedDocument) => void;
}

type FilterType = 'all' | 'name' | 'date' | 'number' | 'keyword';

export const ScanSearch: React.FC<ScanSearchProps> = ({ onViewDocument }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [documents, setDocuments] = useState<ScannedDocument[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<ScannedDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<ScannedDocument | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch();
    } else {
      setFilteredDocuments(documents);
    }
  }, [searchQuery, filterType, documents]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/scan/list');
      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents || []);
        setFilteredDocuments(data.documents || []);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) {
      setFilteredDocuments(documents);
      return;
    }

    try {
      const params = new URLSearchParams({
        query: searchQuery.trim()
      });

      if (filterType !== 'all') {
        params.append('filterType', filterType);
      }

      const response = await fetch(`/api/scan/search?${params}`);
      if (response.ok) {
        const data = await response.json();
        
        // Get full documents for the search results
        const resultDocIds = data.results.map((r: { documentId: string }) => r.documentId);
        const matchedDocs = documents.filter(doc => resultDocIds.includes(doc.id));
        setFilteredDocuments(matchedDocs);
      }
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch('/api/scan/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId })
      });

      if (response.ok) {
        setDocuments(docs => docs.filter(d => d.id !== documentId));
        setFilteredDocuments(docs => docs.filter(d => d.id !== documentId));
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  const handleViewDocument = (document: ScannedDocument) => {
    setSelectedDocument(document);
    onViewDocument?.(document);
  };

  const highlightText = (text: string, query: string): React.ReactNode => {
    if (!query.trim()) return text;

    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index === -1) return text;

    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);

    return (
      <>
        {before}
        <mark>{match}</mark>
        {after}
      </>
    );
  };

  return (
    <div className="scan-search">
      <div className="search-header">
        <h2>Search Scanned Documents</h2>
        <p>Find information in your scanned documents</p>
      </div>

      <div className="search-controls">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, date, keyword, or content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button onClick={performSearch} disabled={!searchQuery.trim()}>
            Search
          </button>
        </div>

        <div className="filter-options">
          <label>Filter by:</label>
          <select value={filterType} onChange={(e) => setFilterType(e.target.value as FilterType)}>
            <option value="all">All Types</option>
            <option value="name">Names</option>
            <option value="date">Dates</option>
            <option value="number">Numbers</option>
            <option value="keyword">Keywords</option>
          </select>
        </div>
      </div>

      <div className="search-results">
        <div className="results-header">
          <h3>
            {loading ? 'Loading...' : `${filteredDocuments.length} document${filteredDocuments.length !== 1 ? 's' : ''} found`}
          </h3>
        </div>

        {filteredDocuments.length === 0 && !loading && (
          <div className="no-results">
            {searchQuery ? 'No documents match your search' : 'No scanned documents yet'}
          </div>
        )}

        <div className="documents-grid">
          {filteredDocuments.map((doc) => (
            <div key={doc.id} className="document-card">
              <div className="card-header">
                <h4>{doc.filename}</h4>
                <div className="card-actions">
                  <button
                    className="view-button"
                    onClick={() => handleViewDocument(doc)}
                  >
                    View
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(doc.id)}
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="card-info">
                <span className="info-label">Uploaded:</span>
                <span>{new Date(doc.metadata.uploadedAt).toLocaleDateString()}</span>
              </div>

              <div className="card-preview">
                {highlightText(
                  doc.content.substring(0, 150) + (doc.content.length > 150 ? '...' : ''),
                  searchQuery
                )}
              </div>

              {(doc.extractedData.names?.length || doc.extractedData.dates?.length) && (
                <div className="card-data">
                  {doc.extractedData.names && doc.extractedData.names.length > 0 && (
                    <div className="data-row">
                      <strong>Names:</strong>
                      <span>{doc.extractedData.names.slice(0, 2).join(', ')}</span>
                    </div>
                  )}
                  {doc.extractedData.dates && doc.extractedData.dates.length > 0 && (
                    <div className="data-row">
                      <strong>Dates:</strong>
                      <span>{doc.extractedData.dates.slice(0, 2).join(', ')}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {selectedDocument && (
        <div className="document-modal" onClick={() => setSelectedDocument(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedDocument.filename}</h3>
              <button className="close-button" onClick={() => setSelectedDocument(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-info">
                <div className="info-row">
                  <strong>Uploaded:</strong>
                  <span>{new Date(selectedDocument.metadata.uploadedAt).toLocaleString()}</span>
                </div>
                {selectedDocument.metadata.ocrConfidence && (
                  <div className="info-row">
                    <strong>OCR Confidence:</strong>
                    <span>{selectedDocument.metadata.ocrConfidence.toFixed(1)}%</span>
                  </div>
                )}
              </div>

              <div className="modal-section">
                <h4>Extracted Text</h4>
                <div className="text-content">
                  {highlightText(selectedDocument.content, searchQuery)}
                </div>
              </div>

              {(selectedDocument.extractedData.names?.length ||
                selectedDocument.extractedData.dates?.length ||
                selectedDocument.extractedData.numbers?.length) && (
                <div className="modal-section">
                  <h4>Extracted Data</h4>
                  
                  {selectedDocument.extractedData.names && selectedDocument.extractedData.names.length > 0 && (
                    <div className="data-group">
                      <strong>Names:</strong>
                      <div className="tags">
                        {selectedDocument.extractedData.names.map((name, idx) => (
                          <span key={idx} className="tag name-tag">{name}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDocument.extractedData.dates && selectedDocument.extractedData.dates.length > 0 && (
                    <div className="data-group">
                      <strong>Dates:</strong>
                      <div className="tags">
                        {selectedDocument.extractedData.dates.map((date, idx) => (
                          <span key={idx} className="tag date-tag">{date}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDocument.extractedData.numbers && selectedDocument.extractedData.numbers.length > 0 && (
                    <div className="data-group">
                      <strong>Numbers:</strong>
                      <div className="tags">
                        {selectedDocument.extractedData.numbers.slice(0, 20).map((num, idx) => (
                          <span key={idx} className="tag number-tag">{num}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .scan-search {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .search-header {
          margin-bottom: 30px;
        }

        .search-header h2 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .search-header p {
          margin: 0;
          color: #666;
        }

        .search-controls {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .search-bar {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }

        .search-bar input {
          flex: 1;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
        }

        .search-bar input:focus {
          outline: none;
          border-color: #007bff;
        }

        .search-bar button {
          padding: 12px 30px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .search-bar button:hover:not(:disabled) {
          background: #0056b3;
        }

        .search-bar button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .filter-options {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .filter-options label {
          font-weight: 500;
          color: #495057;
        }

        .filter-options select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .search-results {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .results-header h3 {
          margin: 0 0 20px 0;
          color: #333;
        }

        .no-results {
          text-align: center;
          padding: 40px;
          color: #666;
        }

        .documents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .document-card {
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          padding: 15px;
          transition: box-shadow 0.2s;
        }

        .document-card:hover {
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .card-header h4 {
          margin: 0;
          font-size: 16px;
          color: #333;
          flex: 1;
          word-break: break-word;
        }

        .card-actions {
          display: flex;
          gap: 5px;
        }

        .view-button {
          padding: 4px 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .view-button:hover {
          background: #0056b3;
        }

        .delete-button {
          padding: 4px 8px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          line-height: 1;
        }

        .delete-button:hover {
          background: #c82333;
        }

        .card-info {
          font-size: 12px;
          color: #666;
          margin-bottom: 10px;
        }

        .info-label {
          font-weight: 600;
          margin-right: 5px;
        }

        .card-preview {
          font-size: 14px;
          line-height: 1.5;
          color: #495057;
          margin-bottom: 10px;
        }

        .card-data {
          border-top: 1px solid #dee2e6;
          padding-top: 10px;
        }

        .data-row {
          font-size: 12px;
          margin: 5px 0;
        }

        .data-row strong {
          color: #495057;
          margin-right: 5px;
        }

        mark {
          background: #ffeb3b;
          padding: 2px 4px;
          border-radius: 2px;
        }

        .document-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 8px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #e0e0e0;
        }

        .modal-header h3 {
          margin: 0;
          color: #333;
        }

        .close-button {
          background: none;
          border: none;
          font-size: 28px;
          color: #666;
          cursor: pointer;
          padding: 0;
          width: 30px;
          height: 30px;
          line-height: 1;
        }

        .close-button:hover {
          color: #333;
        }

        .modal-body {
          padding: 20px;
        }

        .modal-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .info-row {
          margin: 8px 0;
        }

        .info-row strong {
          color: #495057;
          margin-right: 8px;
        }

        .modal-section {
          margin-bottom: 20px;
        }

        .modal-section h4 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .text-content {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          white-space: pre-wrap;
          font-family: monospace;
          font-size: 14px;
          line-height: 1.6;
          max-height: 400px;
          overflow-y: auto;
        }

        .data-group {
          margin-bottom: 15px;
        }

        .data-group strong {
          display: block;
          margin-bottom: 8px;
          color: #495057;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
        }

        .name-tag {
          background: #d1ecf1;
          color: #0c5460;
        }

        .date-tag {
          background: #d4edda;
          color: #155724;
        }

        .number-tag {
          background: #fff3cd;
          color: #856404;
        }
      `}</style>
    </div>
  );
};

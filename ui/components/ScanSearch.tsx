import React, { useState, useEffect } from 'react';

interface ScanDocument {
  id: string;
  filename: string;
  extractedText: string;
  uploadedAt: number;
  metadata: {
    names: string[];
    dates: string[];
    totals: string[];
    keywords: string[];
  };
}

interface SearchMatch {
  type: 'name' | 'date' | 'total' | 'keyword' | 'text';
  value: string;
  context: string;
}

interface SearchResult {
  documentId: string;
  filename: string;
  matches: SearchMatch[];
  score: number;
}

export const ScanSearch: React.FC = () => {
  const [scans, setScans] = useState<ScanDocument[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanDocument | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      const response = await fetch('/api/scans');
      if (response.ok) {
        const data = await response.json();
        setScans(data.scans || []);
      }
    } catch (err) {
      console.error('Failed to load scans:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/scans/search?query=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewScan = async (scanId: string) => {
    try {
      const response = await fetch(`/api/scans/${scanId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedScan(data.scan);
      }
    } catch (err) {
      console.error('Failed to load scan:', err);
    }
  };

  const handleDeleteScan = async (scanId: string) => {
    if (!confirm('Are you sure you want to delete this scan?')) {
      return;
    }

    try {
      const response = await fetch(`/api/scans/${scanId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setScans(scans.filter(s => s.id !== scanId));
        if (selectedScan?.id === scanId) {
          setSelectedScan(null);
        }
      }
    } catch (err) {
      console.error('Failed to delete scan:', err);
    }
  };

  const getMatchTypeColor = (type: string) => {
    switch (type) {
      case 'name': return '#0066cc';
      case 'date': return '#d46b08';
      case 'total': return '#16a34a';
      case 'keyword': return '#666';
      default: return '#999';
    }
  };

  return (
    <div className="scan-search">
      <div className="search-header">
        <h2>Search Scanned Documents</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name, date, amount, keyword, or any text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      <div className="content-area">
        <div className="sidebar">
          <div className="sidebar-header">
            <h3>All Scans ({scans.length})</h3>
          </div>
          
          {loading ? (
            <div className="loading">Loading scans...</div>
          ) : scans.length === 0 ? (
            <div className="empty-state">
              <p>No scans uploaded yet</p>
              <p className="hint">Upload a scan to get started</p>
            </div>
          ) : (
            <div className="scans-list">
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  className={`scan-item ${selectedScan?.id === scan.id ? 'active' : ''}`}
                  onClick={() => handleViewScan(scan.id)}
                >
                  <div className="scan-info">
                    <strong>{scan.filename}</strong>
                    <span className="scan-date">
                      {new Date(scan.uploadedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteScan(scan.id);
                    }}
                    title="Delete scan"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="main-content">
          {searchQuery && searchResults.length > 0 && (
            <div className="search-results">
              <h3>Search Results ({searchResults.length})</h3>
              {searchResults.map((result) => (
                <div
                  key={result.documentId}
                  className="result-card"
                  onClick={() => handleViewScan(result.documentId)}
                >
                  <div className="result-header">
                    <strong>{result.filename}</strong>
                    <span className="score">Score: {result.score.toFixed(1)}</span>
                  </div>
                  <div className="matches">
                    {result.matches.slice(0, 3).map((match, idx) => (
                      <div key={idx} className="match">
                        <span
                          className="match-type"
                          style={{ backgroundColor: getMatchTypeColor(match.type) }}
                        >
                          {match.type}
                        </span>
                        <span className="match-value">{match.value}</span>
                        <p className="match-context">{match.context}</p>
                      </div>
                    ))}
                    {result.matches.length > 3 && (
                      <p className="more-matches">
                        +{result.matches.length - 3} more matches
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !isSearching && (
            <div className="no-results">
              <p>No results found for "{searchQuery}"</p>
              <p className="hint">Try different keywords or search terms</p>
            </div>
          )}

          {!searchQuery && selectedScan && (
            <div className="scan-detail">
              <div className="detail-header">
                <h3>{selectedScan.filename}</h3>
                <span className="detail-date">
                  Uploaded: {new Date(selectedScan.uploadedAt).toLocaleString()}
                </span>
              </div>

              <div className="metadata-section">
                <h4>Extracted Information</h4>
                
                {selectedScan.metadata.names.length > 0 && (
                  <div className="metadata-group">
                    <strong>Names:</strong>
                    <div className="tags">
                      {selectedScan.metadata.names.map((name, idx) => (
                        <span key={idx} className="tag name-tag">{name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedScan.metadata.dates.length > 0 && (
                  <div className="metadata-group">
                    <strong>Dates:</strong>
                    <div className="tags">
                      {selectedScan.metadata.dates.map((date, idx) => (
                        <span key={idx} className="tag date-tag">{date}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedScan.metadata.totals.length > 0 && (
                  <div className="metadata-group">
                    <strong>Amounts:</strong>
                    <div className="tags">
                      {selectedScan.metadata.totals.map((total, idx) => (
                        <span key={idx} className="tag total-tag">{total}</span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedScan.metadata.keywords.length > 0 && (
                  <div className="metadata-group">
                    <strong>Keywords:</strong>
                    <div className="tags">
                      {selectedScan.metadata.keywords.map((keyword, idx) => (
                        <span key={idx} className="tag keyword-tag">{keyword}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-section">
                <h4>Full Extracted Text</h4>
                <div className="extracted-text">
                  {selectedScan.extractedText}
                </div>
              </div>
            </div>
          )}

          {!searchQuery && !selectedScan && scans.length > 0 && (
            <div className="placeholder">
              <p>Select a scan from the list to view details</p>
              <p className="hint">or use the search bar to find specific information</p>
            </div>
          )}

          {!searchQuery && !selectedScan && scans.length === 0 && (
            <div className="placeholder">
              <p>No scans to display</p>
              <p className="hint">Upload a scan to get started</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .scan-search {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .search-header {
          padding: 20px 30px;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }

        .search-header h2 {
          margin: 0 0 15px 0;
          color: #2d3748;
          font-size: 24px;
        }

        .search-bar {
          display: flex;
          gap: 10px;
        }

        .search-bar input {
          flex: 1;
          padding: 10px 15px;
          border: 1px solid #cbd5e0;
          border-radius: 6px;
          font-size: 14px;
        }

        .search-bar input:focus {
          outline: none;
          border-color: #3498db;
        }

        .search-bar button {
          padding: 10px 24px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s;
        }

        .search-bar button:hover:not(:disabled) {
          background: #2980b9;
        }

        .search-bar button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .content-area {
          flex: 1;
          display: flex;
          overflow: hidden;
        }

        .sidebar {
          width: 300px;
          background: white;
          border-right: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 15px 20px;
          border-bottom: 1px solid #e2e8f0;
        }

        .sidebar-header h3 {
          margin: 0;
          font-size: 16px;
          color: #2d3748;
        }

        .scans-list {
          flex: 1;
          overflow-y: auto;
        }

        .scan-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          cursor: pointer;
          border-bottom: 1px solid #e2e8f0;
          transition: background 0.2s;
        }

        .scan-item:hover {
          background: #f7fafc;
        }

        .scan-item.active {
          background: #ebf8ff;
          border-left: 3px solid #3498db;
        }

        .scan-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
          flex: 1;
        }

        .scan-info strong {
          font-size: 14px;
          color: #2d3748;
        }

        .scan-date {
          font-size: 12px;
          color: #718096;
        }

        .delete-btn {
          width: 24px;
          height: 24px;
          padding: 0;
          background: transparent;
          border: none;
          color: #e53e3e;
          font-size: 20px;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }

        .delete-btn:hover {
          background: #fee;
        }

        .main-content {
          flex: 1;
          overflow-y: auto;
          padding: 20px 30px;
          background: #fafafa;
        }

        .loading, .empty-state, .placeholder, .no-results {
          text-align: center;
          padding: 40px 20px;
          color: #718096;
        }

        .hint {
          font-size: 14px;
          color: #a0aec0;
          margin-top: 8px;
        }

        .search-results h3 {
          margin: 0 0 20px 0;
          color: #2d3748;
        }

        .result-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 15px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .result-card:hover {
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .result-header strong {
          color: #2d3748;
          font-size: 16px;
        }

        .score {
          font-size: 12px;
          color: #718096;
          background: #f7fafc;
          padding: 4px 10px;
          border-radius: 12px;
        }

        .matches {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .match {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .match-type {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          color: white;
          font-weight: 600;
          text-transform: uppercase;
          width: fit-content;
        }

        .match-value {
          font-weight: 500;
          color: #2d3748;
          font-size: 14px;
        }

        .match-context {
          font-size: 13px;
          color: #718096;
          line-height: 1.5;
          margin: 0;
        }

        .more-matches {
          font-size: 13px;
          color: #3498db;
          font-weight: 500;
          margin: 0;
        }

        .scan-detail {
          background: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .detail-header {
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e2e8f0;
        }

        .detail-header h3 {
          margin: 0 0 8px 0;
          color: #2d3748;
          font-size: 20px;
        }

        .detail-date {
          font-size: 14px;
          color: #718096;
        }

        .metadata-section {
          margin-bottom: 25px;
        }

        .metadata-section h4 {
          margin: 0 0 15px 0;
          color: #4a5568;
          font-size: 16px;
        }

        .metadata-group {
          margin-bottom: 15px;
        }

        .metadata-group strong {
          display: block;
          margin-bottom: 8px;
          color: #4a5568;
          font-size: 14px;
        }

        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .tag {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 500;
        }

        .name-tag {
          background: #e6f7ff;
          color: #0066cc;
        }

        .date-tag {
          background: #fff4e6;
          color: #d46b08;
        }

        .total-tag {
          background: #f0fdf4;
          color: #16a34a;
        }

        .keyword-tag {
          background: #f5f5f5;
          color: #666;
        }

        .text-section h4 {
          margin: 0 0 12px 0;
          color: #4a5568;
          font-size: 16px;
        }

        .extracted-text {
          background: #f7fafc;
          padding: 15px;
          border-radius: 6px;
          max-height: 400px;
          overflow-y: auto;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
          color: #2d3748;
          white-space: pre-wrap;
        }
      `}</style>
    </div>
  );
};

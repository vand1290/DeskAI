import React, { useState, useRef } from 'react';

interface ScanUploadProps {
  onScanProcessed?: (scanId: string) => void;
}

interface SuggestedConversation {
  id: string;
  title: string;
  messageCount: number;
}

interface ScanResult {
  scan: {
    id: string;
    filename: string;
    extractedText: string;
    metadata: {
      names: string[];
      dates: string[];
      totals: string[];
      keywords: string[];
    };
  };
  suggestedConversations: SuggestedConversation[];
}

export const ScanUpload: React.FC<ScanUploadProps> = ({ onScanProcessed }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, etc.)');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      // Create FormData to send the file
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/scan/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload and process scan');
      }

      const data = await response.json();
      setResult(data);
      
      if (onScanProcessed && data.scan?.id) {
        onScanProcessed(data.scan.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process scan');
      console.error('Scan processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleLinkToConversation = async (conversationId: string) => {
    if (!result?.scan?.id) return;

    try {
      const response = await fetch('/api/scan/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scanId: result.scan.id,
          conversationId
        })
      });

      if (response.ok) {
        alert('Scan linked to conversation successfully!');
      }
    } catch (err) {
      console.error('Failed to link scan:', err);
    }
  };

  return (
    <div className="scan-upload">
      <div className="upload-area">
        <div
          className={`dropzone ${dragActive ? 'active' : ''} ${isProcessing ? 'processing' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          {isProcessing ? (
            <div className="processing-indicator">
              <div className="spinner"></div>
              <p>Processing scan with OCR...</p>
              <p className="hint">This may take a few moments</p>
            </div>
          ) : (
            <>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <p className="upload-text">Drop an image here or click to browse</p>
              <p className="upload-hint">Supports JPG, PNG, and other image formats</p>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {result && (
        <div className="scan-result">
          <h3>Scan Processed: {result.scan.filename}</h3>
          
          <div className="result-section">
            <h4>Extracted Information</h4>
            
            {result.scan.metadata.names.length > 0 && (
              <div className="metadata-group">
                <strong>Names:</strong>
                <div className="metadata-tags">
                  {result.scan.metadata.names.slice(0, 5).map((name, idx) => (
                    <span key={idx} className="tag name-tag">{name}</span>
                  ))}
                </div>
              </div>
            )}

            {result.scan.metadata.dates.length > 0 && (
              <div className="metadata-group">
                <strong>Dates:</strong>
                <div className="metadata-tags">
                  {result.scan.metadata.dates.slice(0, 5).map((date, idx) => (
                    <span key={idx} className="tag date-tag">{date}</span>
                  ))}
                </div>
              </div>
            )}

            {result.scan.metadata.totals.length > 0 && (
              <div className="metadata-group">
                <strong>Amounts:</strong>
                <div className="metadata-tags">
                  {result.scan.metadata.totals.slice(0, 5).map((total, idx) => (
                    <span key={idx} className="tag total-tag">{total}</span>
                  ))}
                </div>
              </div>
            )}

            {result.scan.metadata.keywords.length > 0 && (
              <div className="metadata-group">
                <strong>Keywords:</strong>
                <div className="metadata-tags">
                  {result.scan.metadata.keywords.slice(0, 10).map((keyword, idx) => (
                    <span key={idx} className="tag keyword-tag">{keyword}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {result.scan.extractedText && (
            <div className="result-section">
              <h4>Full Extracted Text</h4>
              <div className="extracted-text">
                {result.scan.extractedText}
              </div>
            </div>
          )}

          {result.suggestedConversations && result.suggestedConversations.length > 0 && (
            <div className="result-section">
              <h4>Related Conversations</h4>
              <p className="section-hint">Based on content similarity</p>
              <div className="suggestions-list">
                {result.suggestedConversations.map((conv) => (
                  <div key={conv.id} className="suggestion-item">
                    <div className="suggestion-info">
                      <strong>{conv.title}</strong>
                      <span className="message-count">{conv.messageCount} messages</span>
                    </div>
                    <button
                      className="link-button"
                      onClick={() => handleLinkToConversation(conv.id)}
                    >
                      Link
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .scan-upload {
          padding: 20px;
          max-width: 900px;
          margin: 0 auto;
        }

        .upload-area {
          margin-bottom: 30px;
        }

        .dropzone {
          border: 2px dashed #cbd5e0;
          border-radius: 8px;
          padding: 60px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: white;
        }

        .dropzone:hover {
          border-color: #3498db;
          background: #f7fafc;
        }

        .dropzone.active {
          border-color: #3498db;
          background: #ebf8ff;
        }

        .dropzone.processing {
          cursor: wait;
          background: #f7fafc;
        }

        .dropzone svg {
          color: #718096;
          margin-bottom: 15px;
        }

        .upload-text {
          font-size: 18px;
          color: #2d3748;
          margin-bottom: 8px;
        }

        .upload-hint {
          font-size: 14px;
          color: #718096;
        }

        .processing-indicator {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
        }

        .processing-indicator p {
          margin: 0;
          font-size: 16px;
          color: #2d3748;
        }

        .processing-indicator .hint {
          font-size: 14px;
          color: #718096;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #e2e8f0;
          border-top-color: #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .error-message {
          margin-top: 15px;
          padding: 12px;
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 4px;
          color: #c33;
        }

        .scan-result {
          background: white;
          border-radius: 8px;
          padding: 25px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .scan-result h3 {
          margin: 0 0 20px 0;
          color: #2d3748;
          font-size: 20px;
        }

        .result-section {
          margin-bottom: 25px;
          padding-bottom: 25px;
          border-bottom: 1px solid #e2e8f0;
        }

        .result-section:last-child {
          border-bottom: none;
          padding-bottom: 0;
          margin-bottom: 0;
        }

        .result-section h4 {
          margin: 0 0 12px 0;
          color: #4a5568;
          font-size: 16px;
        }

        .section-hint {
          font-size: 14px;
          color: #718096;
          margin: -8px 0 12px 0;
        }

        .metadata-group {
          margin-bottom: 15px;
        }

        .metadata-group:last-child {
          margin-bottom: 0;
        }

        .metadata-group strong {
          display: block;
          margin-bottom: 8px;
          color: #4a5568;
          font-size: 14px;
        }

        .metadata-tags {
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

        .extracted-text {
          background: #f7fafc;
          padding: 15px;
          border-radius: 4px;
          max-height: 300px;
          overflow-y: auto;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          line-height: 1.6;
          color: #2d3748;
          white-space: pre-wrap;
        }

        .suggestions-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .suggestion-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          background: #f7fafc;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .suggestion-info {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .suggestion-info strong {
          color: #2d3748;
          font-size: 14px;
        }

        .message-count {
          font-size: 12px;
          color: #718096;
        }

        .link-button {
          padding: 6px 16px;
          background: #3498db;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 500;
          transition: background 0.2s;
        }

        .link-button:hover {
          background: #2980b9;
        }
      `}</style>
    </div>
  );
};

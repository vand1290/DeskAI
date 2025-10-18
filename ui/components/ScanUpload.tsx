import React, { useState, useRef } from 'react';
import { ScannedDocument } from '../../src/memory';

interface ScanUploadProps {
  onDocumentProcessed?: (document: ScannedDocument) => void;
}

export const ScanUpload: React.FC<ScanUploadProps> = ({ onDocumentProcessed }) => {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processedDocument, setProcessedDocument] = useState<ScannedDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, etc.)');
      return;
    }

    setUploading(true);
    setError(null);
    setProcessedDocument(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        
        setUploading(false);
        setProcessing(true);

        try {
          // Send to backend for OCR processing
          const response = await fetch('/api/scan/process', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageData,
              filename: file.name,
              fileType: file.type,
              fileSize: file.size
            })
          });

          if (response.ok) {
            const data = await response.json();
            setProcessedDocument(data.document);
            onDocumentProcessed?.(data.document);
          } else {
            const errorData = await response.json();
            setError(errorData.error || 'Failed to process document');
          }
        } catch (err) {
          setError('Failed to process document. Please try again.');
          console.error('Processing error:', err);
        } finally {
          setProcessing(false);
        }
      };

      reader.onerror = () => {
        setError('Failed to read file');
        setUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to upload file');
      setUploading(false);
      console.error('Upload error:', err);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const resetUpload = () => {
    setProcessedDocument(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="scan-upload">
      <div className="upload-header">
        <h2>Scan Document</h2>
        <p>Upload an image or scanned document to extract text and search data</p>
      </div>

      <div className="upload-area">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {!processedDocument && (
          <button
            className="upload-button"
            onClick={handleUploadClick}
            disabled={uploading || processing}
          >
            {uploading && 'Reading file...'}
            {processing && 'Processing with OCR...'}
            {!uploading && !processing && 'Choose Image to Scan'}
          </button>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {processedDocument && (
          <div className="processed-result">
            <div className="result-header">
              <h3>✓ Document Processed</h3>
              <button className="reset-button" onClick={resetUpload}>
                Upload Another
              </button>
            </div>

            <div className="result-info">
              <div className="info-item">
                <strong>Filename:</strong> {processedDocument.filename}
              </div>
              <div className="info-item">
                <strong>Uploaded:</strong> {new Date(processedDocument.metadata.uploadedAt).toLocaleString()}
              </div>
              {processedDocument.metadata.ocrConfidence && (
                <div className="info-item">
                  <strong>OCR Confidence:</strong> {processedDocument.metadata.ocrConfidence.toFixed(1)}%
                </div>
              )}
            </div>

            <div className="extracted-text">
              <h4>Extracted Text</h4>
              <div className="text-preview">
                {processedDocument.content || 'No text extracted'}
              </div>
            </div>

            {(processedDocument.extractedData.names?.length ||
              processedDocument.extractedData.dates?.length ||
              processedDocument.extractedData.numbers?.length) && (
              <div className="extracted-data">
                <h4>Extracted Data</h4>
                
                {processedDocument.extractedData.names && processedDocument.extractedData.names.length > 0 && (
                  <div className="data-section">
                    <strong>Names:</strong>
                    <div className="data-tags">
                      {processedDocument.extractedData.names.map((name, idx) => (
                        <span key={idx} className="data-tag name-tag">{name}</span>
                      ))}
                    </div>
                  </div>
                )}

                {processedDocument.extractedData.dates && processedDocument.extractedData.dates.length > 0 && (
                  <div className="data-section">
                    <strong>Dates:</strong>
                    <div className="data-tags">
                      {processedDocument.extractedData.dates.map((date, idx) => (
                        <span key={idx} className="data-tag date-tag">{date}</span>
                      ))}
                    </div>
                  </div>
                )}

                {processedDocument.extractedData.numbers && processedDocument.extractedData.numbers.length > 0 && (
                  <div className="data-section">
                    <strong>Numbers:</strong>
                    <div className="data-tags">
                      {processedDocument.extractedData.numbers.slice(0, 10).map((num, idx) => (
                        <span key={idx} className="data-tag number-tag">{num}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .scan-upload {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .upload-header {
          margin-bottom: 30px;
        }

        .upload-header h2 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .upload-header p {
          margin: 0;
          color: #666;
        }

        .upload-area {
          background: white;
          border: 2px dashed #ddd;
          border-radius: 8px;
          padding: 40px;
          text-align: center;
          min-height: 200px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .upload-button {
          padding: 15px 40px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .upload-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .upload-button:disabled {
          background: #6c757d;
          cursor: wait;
        }

        .error-message {
          margin-top: 20px;
          padding: 15px;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 4px;
          color: #721c24;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .error-icon {
          font-size: 20px;
        }

        .processed-result {
          width: 100%;
          text-align: left;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #e0e0e0;
        }

        .result-header h3 {
          margin: 0;
          color: #28a745;
        }

        .reset-button {
          padding: 8px 16px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .reset-button:hover {
          background: #5a6268;
        }

        .result-info {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .info-item {
          margin: 8px 0;
        }

        .info-item strong {
          color: #495057;
          margin-right: 8px;
        }

        .extracted-text {
          margin-bottom: 20px;
        }

        .extracted-text h4 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .text-preview {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          max-height: 300px;
          overflow-y: auto;
          white-space: pre-wrap;
          font-family: monospace;
          font-size: 14px;
          line-height: 1.6;
        }

        .extracted-data {
          border-top: 1px solid #e0e0e0;
          padding-top: 20px;
        }

        .extracted-data h4 {
          margin: 0 0 15px 0;
          color: #333;
        }

        .data-section {
          margin-bottom: 15px;
        }

        .data-section strong {
          display: block;
          margin-bottom: 8px;
          color: #495057;
        }

        .data-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .data-tag {
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

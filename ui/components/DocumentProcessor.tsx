import React, { useState } from 'react';

interface DocumentProcessorProps {
  onExecute: (action: string, params: any) => Promise<any>;
}

const DocumentProcessor: React.FC<DocumentProcessorProps> = ({ onExecute }) => {
  const [filePath, setFilePath] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processDocument = async (action: string) => {
    if (!filePath.trim()) {
      setError('Please enter a file path');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      switch (action) {
        case 'extractPDF':
          response = await onExecute('document_processor', {
            action: 'extractPDF',
            filePath
          });
          break;
        case 'extractText':
          response = await onExecute('document_processor', {
            action: 'extractText',
            filePath
          });
          break;
        case 'getMetadata':
          response = await onExecute('document_processor', {
            action: 'getMetadata',
            filePath
          });
          break;
        default:
          throw new Error('Unknown action');
      }
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const extractData = async (dataType: 'dates' | 'emails' | 'amounts') => {
    if (!result?.text) {
      setError('Please extract text from a document first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await onExecute('document_processor', {
        action: 'extractData',
        text: result.text,
        dataType
      });
      setResult({ ...result, extractedData: response });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="document-processor">
      <h2>📄 Document Processor</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>File Path:</label>
        <input
          type="text"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          placeholder="Enter file path (e.g., out/document.pdf)"
        />
      </div>

      <div className="button-group">
        <button onClick={() => processDocument('extractPDF')} disabled={loading}>
          Extract from PDF
        </button>
        <button onClick={() => processDocument('extractText')} disabled={loading}>
          Extract from Text File
        </button>
        <button onClick={() => processDocument('getMetadata')} disabled={loading}>
          Get Metadata
        </button>
      </div>

      {result?.text && (
        <>
          <h3>Data Extraction:</h3>
          <div className="button-group">
            <button onClick={() => extractData('dates')} disabled={loading}>
              Extract Dates
            </button>
            <button onClick={() => extractData('emails')} disabled={loading}>
              Extract Emails
            </button>
            <button onClick={() => extractData('amounts')} disabled={loading}>
              Extract Amounts
            </button>
          </div>
        </>
      )}

      {loading && <div className="loading-message">Processing...</div>}

      {result && (
        <div className="result-display">
          <h3>Results:</h3>
          {result.text && (
            <div className="text-result">
              <h4>Extracted Text:</h4>
              <pre>{result.text.substring(0, 500)}{result.text.length > 500 ? '...' : ''}</pre>
            </div>
          )}
          {result.pages && (
            <div>
              <strong>Pages:</strong> {result.pages}
            </div>
          )}
          {result.extractedData && (
            <div className="extracted-data">
              <h4>Extracted Data:</h4>
              <pre>{JSON.stringify(result.extractedData, null, 2)}</pre>
            </div>
          )}
          {result.metadata && (
            <div className="metadata">
              <h4>Metadata:</h4>
              <pre>{JSON.stringify(result.metadata, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DocumentProcessor;

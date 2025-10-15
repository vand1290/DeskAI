import React, { useState } from 'react';

interface OCRViewerProps {
  onExecute: (action: string, params: any) => Promise<any>;
}

const OCRViewer: React.FC<OCRViewerProps> = ({ onExecute }) => {
  const [imagePath, setImagePath] = useState('');
  const [language, setLanguage] = useState('eng');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [languages, setLanguages] = useState<any[]>([]);

  React.useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = async () => {
    try {
      const response = await onExecute('ocr', { action: 'languages' });
      setLanguages(response.languages);
    } catch (err) {
      console.error('Failed to load languages:', err);
    }
  };

  const extractText = async () => {
    if (!imagePath.trim()) {
      setError('Please enter an image path');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await onExecute('ocr', {
        action: 'extract',
        imagePath,
        language
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ocr-viewer">
      <h2>🔍 OCR - Text Extraction</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Image Path:</label>
        <input
          type="text"
          value={imagePath}
          onChange={(e) => setImagePath(e.target.value)}
          placeholder="Enter image path (e.g., out/image.jpg)"
        />
      </div>

      <div className="form-group">
        <label>Language:</label>
        <select value={language} onChange={(e) => setLanguage(e.target.value)}>
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>
      </div>

      <button onClick={extractText} disabled={loading}>
        Extract Text
      </button>

      {loading && <div className="loading-message">Processing image...</div>}

      {result && (
        <div className="result-display">
          <h3>Extracted Text:</h3>
          <div className="confidence-badge">
            Confidence: {result.confidence.toFixed(2)}%
          </div>
          <div className="extracted-text">
            <pre>{result.text}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default OCRViewer;

import React, { useState } from 'react';

interface HandwritingRecognizerProps {
  onExecute: (action: string, params: any) => Promise<any>;
}

const HandwritingRecognizer: React.FC<HandwritingRecognizerProps> = ({ onExecute }) => {
  const [imagePath, setImagePath] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognizeHandwriting = async () => {
    if (!imagePath.trim()) {
      setError('Please enter an image path');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await onExecute('handwriting', {
        action: 'recognize',
        imagePath
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="handwriting-recognizer">
      <h2>✏️ Handwriting Recognition</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Image Path:</label>
        <input
          type="text"
          value={imagePath}
          onChange={(e) => setImagePath(e.target.value)}
          placeholder="Enter handwriting image path (e.g., out/handwriting.jpg)"
        />
      </div>

      <button onClick={recognizeHandwriting} disabled={loading}>
        Recognize Handwriting
      </button>

      {loading && <div className="loading-message">Processing handwriting...</div>}

      {result && (
        <div className="result-display">
          <h3>Recognized Text:</h3>
          <div className="confidence-badge">
            Confidence: {result.confidence.toFixed(2)}%
          </div>
          <div className="extracted-text">
            <pre>{result.text}</pre>
          </div>

          {result.corrections && result.corrections.length > 0 && (
            <div className="corrections">
              <h4>Suggested Corrections:</h4>
              <ul>
                {result.corrections.map((correction: string, index: number) => (
                  <li key={index}>{correction}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HandwritingRecognizer;

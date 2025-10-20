import React, { useState } from 'react';

interface FileInfo {
  name: string;
  path: string;
  size: number;
  created: Date;
  modified: Date;
  type: string;
  metadata?: any;
}

interface FileManagerProps {
  onExecute: (action: string, params: any) => Promise<any>;
}

const FileManager: React.FC<FileManagerProps> = ({ onExecute }) => {
  const [folderPath, setFolderPath] = useState('');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'client'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const listFiles = async () => {
    if (!folderPath.trim()) {
      setError('Please enter a folder path');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await onExecute('file_manager', {
        action: 'list',
        folderPath
      });
      setFiles(response.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const sortFiles = async () => {
    if (!folderPath.trim()) {
      setError('Please list files first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await onExecute('file_manager', {
        action: 'sort',
        folderPath,
        sortBy,
        order: sortOrder
      });
      setFiles(response.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="file-manager">
      <h2>📁 File Manager</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>Folder Path:</label>
        <input
          type="text"
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
          placeholder="Enter folder path (e.g., out/)"
        />
      </div>

      <div className="controls">
        <button onClick={listFiles} disabled={loading}>
          List Files
        </button>

        <div className="sort-controls">
          <label>Sort by:</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
            <option value="name">Name</option>
            <option value="date">Date</option>
            <option value="size">Size</option>
            <option value="client">Client</option>
          </select>

          <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value as any)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>

          <button onClick={sortFiles} disabled={loading || files.length === 0}>
            Sort
          </button>
        </div>
      </div>

      {loading && <div className="loading-message">Loading...</div>}

      {files.length > 0 && (
        <div className="file-list">
          <h3>Files ({files.length}):</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Modified</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file, index) => (
                <tr key={index}>
                  <td>{file.name}</td>
                  <td>{file.type || '-'}</td>
                  <td>{formatFileSize(file.size)}</td>
                  <td>{formatDate(file.modified)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FileManager;

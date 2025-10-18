import React, { useState } from 'react';

interface WritingEditorProps {
  onExecute: (action: string, params: any) => Promise<any>;
}

const WritingEditor: React.FC<WritingEditorProps> = ({ onExecute }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [format, setFormat] = useState<'txt' | 'md'>('txt');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);

  const loadTemplates = async () => {
    try {
      const result = await onExecute('writing', { action: 'getTemplates' });
      setTemplates(result.templates);
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to load templates: ${error}` });
    }
  };

  const useTemplate = async (templateName: string) => {
    try {
      const result = await onExecute('writing', { action: 'useTemplate', templateName });
      setContent(result.content);
      setFormat(result.format);
      setMessage({ type: 'success', text: 'Template loaded' });
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to load template: ${error}` });
    }
  };

  const createDocument = async () => {
    if (!title.trim()) {
      setMessage({ type: 'error', text: 'Please enter a title' });
      return;
    }

    try {
      const result = await onExecute('writing', {
        action: 'create',
        title,
        content,
        format
      });
      setMessage({ type: 'success', text: `Document created: ${result.path}` });
    } catch (error) {
      setMessage({ type: 'error', text: `Failed to create document: ${error}` });
    }
  };

  React.useEffect(() => {
    loadTemplates();
  }, []);

  return (
    <div className="writing-editor">
      <h2>✍️ Writing Tool</h2>
      
      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="editor-controls">
        <div className="form-group">
          <label>Document Title:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter document title"
          />
        </div>

        <div className="form-group">
          <label>Format:</label>
          <select value={format} onChange={(e) => setFormat(e.target.value as 'txt' | 'md')}>
            <option value="txt">Plain Text (.txt)</option>
            <option value="md">Markdown (.md)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Templates:</label>
          <div className="template-buttons">
            {templates.map((template) => (
              <button
                key={template.name}
                onClick={() => useTemplate(template.name)}
                className="template-btn"
              >
                {template.name.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Content:</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter document content or select a template"
          rows={15}
        />
      </div>

      <button onClick={createDocument} className="primary-btn">
        Create Document
      </button>
    </div>
  );
};

export default WritingEditor;

import React, { useState } from 'react';

interface SecretaryDashboardProps {
  onToolSelect: (tool: string) => void;
}

const SecretaryDashboard: React.FC<SecretaryDashboardProps> = ({ onToolSelect }) => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const tools = [
    {
      id: 'file_manager',
      name: 'File Manager',
      icon: '📁',
      description: 'Organize and manage your files'
    },
    {
      id: 'document_processor',
      name: 'Document Processor',
      icon: '📄',
      description: 'Extract text from PDFs and documents'
    },
    {
      id: 'writing',
      name: 'Writing Tool',
      icon: '✍️',
      description: 'Create and edit documents with templates'
    },
    {
      id: 'ocr',
      name: 'OCR',
      icon: '🔍',
      description: 'Extract text from images'
    },
    {
      id: 'handwriting',
      name: 'Handwriting Recognition',
      icon: '✏️',
      description: 'Recognize handwritten text'
    }
  ];

  const handleToolClick = (toolId: string) => {
    setSelectedTool(toolId);
    onToolSelect(toolId);
  };

  return (
    <div className="secretary-dashboard">
      <h2>🤵 Personal Secretary Tools</h2>
      <div className="tool-grid">
        {tools.map((tool) => (
          <div
            key={tool.id}
            className={`tool-card ${selectedTool === tool.id ? 'selected' : ''}`}
            onClick={() => handleToolClick(tool.id)}
          >
            <div className="tool-icon">{tool.icon}</div>
            <h3>{tool.name}</h3>
            <p>{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecretaryDashboard;

import { useState } from 'react';
import './App.css';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  agent?: string;
  reasoning?: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'Welcome to DeskAI - Your offline meta-agent assistant. All processing happens locally on your device.'
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Simulate offline processing with deterministic response
      // In production, this would call the backend router
      const response = await simulateOfflineAgent(userMessage.content);
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        agent: response.agent,
        reasoning: response.reasoning
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Deterministic offline simulation
  const simulateOfflineAgent = async (content: string): Promise<{
    response: string;
    agent: string;
    reasoning: string;
  }> => {
    // Simple keyword-based routing (matches backend logic)
    const lowerContent = content.toLowerCase();
    let agent = 'general';
    let reasoning = 'General purpose query';

    if (lowerContent.includes('code') || lowerContent.includes('program') || 
        lowerContent.includes('function') || lowerContent.includes('bug')) {
      agent = 'code';
      reasoning = 'Code-related query detected';
    } else if (lowerContent.includes('data') || lowerContent.includes('analyze') || 
               lowerContent.includes('chart')) {
      agent = 'data';
      reasoning = 'Data analysis query detected';
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      response: `[${agent.toUpperCase()} Agent - Offline Mode] Processed your request: "${content}". This is a deterministic response. In production, this connects to your local model (${agent === 'code' ? 'qwen2.5:7b-code' : 'qwen2.5:7b'}).`,
      agent,
      reasoning
    };
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🖥️ DeskAI</h1>
        <span className="offline-badge">OFFLINE</span>
      </header>

      <div className="chat-container">
        <div className="messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message message-${msg.role}`}>
              <div className="message-content">
                {msg.content}
              </div>
              {msg.agent && (
                <div className="message-meta">
                  <span className="agent-badge">{msg.agent}</span>
                  <span className="reasoning">{msg.reasoning}</span>
                </div>
              )}
            </div>
          ))}
          {isProcessing && (
            <div className="message message-assistant">
              <div className="message-content typing">
                Processing locally...
              </div>
            </div>
          )}
        </div>

        <form className="input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything (100% offline)..."
            disabled={isProcessing}
            className="message-input"
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isProcessing}
            className="send-button"
          >
            Send
          </button>
        </form>
      </div>

      <footer className="app-footer">
        <p>All processing happens on your device. No data leaves your computer.</p>
      </footer>
    </div>
  );
}

export default App;

import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../src/memory';
import { AdaptiveSuggestions } from './components/AdaptiveSuggestions';

interface DashboardProps {
  conversationId: string | null;
  onNewConversation?: () => void;
}

interface Analytics {
  totalConversations: number;
  totalMessages: number;
  frequentTopics: Array<{ topic: string; count: number }>;
  averageMessagesPerConversation: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  conversationId,
  onNewConversation
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load conversation if one is selected
    if (conversationId) {
      loadConversation(conversationId);
    }
  }, [conversationId]);

  useEffect(() => {
    // Load analytics on mount
    loadAnalytics();
  }, []);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/conversations/${id}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.conversation.messages || []);
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = inputMessage;
    setInputMessage('');
    setLoading(true);

    // Add user message to UI immediately
    const tempUserMsg: Message = {
      id: 'temp-' + Date.now(),
      role: 'user',
      content: userMessage,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Add agent response
        const agentMsg: Message = {
          id: Date.now().toString(),
          role: 'agent',
          content: data.response,
          timestamp: Date.now()
        };
        
        // Replace temp message with actual messages
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempUserMsg.id);
          return [...filtered, tempUserMsg, agentMsg];
        });

        // Reload analytics after interaction
        loadAnalytics();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    onNewConversation?.();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Chat Dashboard</h2>
        <div className="dashboard-actions">
          <button onClick={handleNewConversation}>New Conversation</button>
          <button onClick={() => setShowAnalytics(!showAnalytics)}>
            {showAnalytics ? 'Hide' : 'Show'} Analytics
          </button>
          <button onClick={() => setShowSuggestions(!showSuggestions)}>
            {showSuggestions ? 'Hide' : 'Show'} Suggestions
          </button>
        </div>
      </div>

      {showSuggestions && (
        <div className="suggestions-container">
          <AdaptiveSuggestions onClose={() => setShowSuggestions(false)} />
        </div>
      )}

      {showAnalytics && analytics && (
        <div className="analytics-panel">
          <h3>Analytics</h3>
          <div className="analytics-grid">
            <div className="stat-card">
              <div className="stat-value">{analytics.totalConversations}</div>
              <div className="stat-label">Total Conversations</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{analytics.totalMessages}</div>
              <div className="stat-label">Total Messages</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{analytics.averageMessagesPerConversation.toFixed(1)}</div>
              <div className="stat-label">Avg Messages/Conv</div>
            </div>
          </div>

          {analytics.frequentTopics.length > 0 && (
            <div className="topics-section">
              <h4>Frequent Topics</h4>
              <div className="topics-list">
                {analytics.frequentTopics.map((topic, idx) => (
                  <div key={idx} className="topic-item">
                    <span className="topic-name">{topic.topic}</span>
                    <span className="topic-count">{topic.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="chat-container">
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="empty-chat">
              <h3>Welcome to DeskAI!</h3>
              <p>Start a conversation by typing a message below.</p>
              <p>Your conversations are automatically saved and you can browse them in the History tab.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`message ${message.role}`}>
                <div className="message-header">
                  <span className="message-role">{message.role}</span>
                  <span className="message-time">{formatDate(message.timestamp)}</span>
                </div>
                <div className="message-content">{message.content}</div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
            disabled={loading}
          />
          <button onClick={handleSendMessage} disabled={loading || !inputMessage.trim()}>
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>

      <style>{`
        .dashboard {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
          height: calc(100vh - 80px);
          display: flex;
          flex-direction: column;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .dashboard-header h2 {
          margin: 0;
        }

        .dashboard-actions {
          display: flex;
          gap: 10px;
        }

        .dashboard-actions button {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .dashboard-actions button:hover {
          background: #0056b3;
        }

        .suggestions-container {
          margin-bottom: 20px;
        }

        .analytics-panel {
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .analytics-panel h3 {
          margin: 0 0 15px 0;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 6px;
          text-align: center;
        }

        .stat-value {
          font-size: 32px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
        }

        .topics-section h4 {
          margin: 0 0 10px 0;
        }

        .topics-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .topic-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 12px;
          background: #f8f9fa;
          border-radius: 4px;
        }

        .topic-name {
          font-weight: 500;
        }

        .topic-count {
          color: #666;
          font-size: 14px;
        }

        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .empty-chat {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: #666;
        }

        .empty-chat h3 {
          margin-bottom: 10px;
          color: #333;
        }

        .empty-chat p {
          margin: 5px 0;
        }

        .message {
          padding: 12px 15px;
          border-radius: 8px;
          max-width: 80%;
        }

        .message.user {
          background: #e3f2fd;
          align-self: flex-end;
        }

        .message.agent {
          background: #f1f8e9;
          align-self: flex-start;
        }

        .message-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
        }

        .message-role {
          font-weight: 600;
          text-transform: capitalize;
        }

        .message-time {
          color: #666;
        }

        .message-content {
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .input-container {
          padding: 15px;
          border-top: 1px solid #ddd;
          display: flex;
          gap: 10px;
        }

        .input-container input {
          flex: 1;
          padding: 10px 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .input-container input:focus {
          outline: none;
          border-color: #007bff;
        }

        .input-container button {
          padding: 10px 24px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .input-container button:hover:not(:disabled) {
          background: #0056b3;
        }

        .input-container button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

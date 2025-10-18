import React, { useState, useEffect } from 'react';
import { ConversationSummary, Conversation } from '../../src/memory';

interface ConversationHistoryProps {
  onSelectConversation?: (conversationId: string) => void;
  onDeleteConversation?: (conversationId: string) => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  onSelectConversation,
  onDeleteConversation
}) => {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    setLoading(true);
    setError(null);

    try {
      // In a real implementation, this would call the backend API
      // For now, this is a placeholder that would integrate with the router
      const response = await fetch('/api/conversations');
      if (response.ok) {
        const data = await response.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      setError('Failed to load conversations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectConversation = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/conversations/${conversationId}`);
      if (response.ok) {
        const data = await response.json();
        setSelectedConversation(data.conversation);
        onSelectConversation?.(conversationId);
      }
    } catch (err) {
      setError('Failed to load conversation');
      console.error(err);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/conversations/${conversationId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setConversations(prev => prev.filter(c => c.id !== conversationId));
        if (selectedConversation?.id === conversationId) {
          setSelectedConversation(null);
        }
        onDeleteConversation?.(conversationId);
      }
    } catch (err) {
      setError('Failed to delete conversation');
      console.error(err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadConversations();
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        // Filter conversations based on search results
        const resultConvIds = new Set(data.results.map((r: { conversationId: string }) => r.conversationId));
        setConversations(prev => prev.filter(c => resultConvIds.has(c.id)));
      }
    } catch (err) {
      setError('Failed to search conversations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="conversation-history">
      <div className="conversation-history-header">
        <h2>Conversation History</h2>
        
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="conversation-layout">
        <div className="conversation-list">
          {loading ? (
            <div className="loading">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="empty-state">No conversations found</div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`conversation-item ${selectedConversation?.id === conv.id ? 'selected' : ''}`}
                onClick={() => handleSelectConversation(conv.id)}
              >
                <div className="conversation-item-header">
                  <h3>{conv.title}</h3>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteConversation(conv.id);
                    }}
                  >
                    ×
                  </button>
                </div>
                <div className="conversation-item-meta">
                  <span className="message-count">{conv.messageCount} messages</span>
                  <span className="timestamp">{formatDate(conv.updatedAt)}</span>
                </div>
                {conv.tags && conv.tags.length > 0 && (
                  <div className="conversation-tags">
                    {conv.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                )}
                {conv.lastMessage && (
                  <div className="last-message">{conv.lastMessage}</div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="conversation-detail">
          {selectedConversation ? (
            <>
              <div className="conversation-detail-header">
                <h2>{selectedConversation.title}</h2>
                <div className="conversation-meta">
                  <span>Created: {formatDate(selectedConversation.createdAt)}</span>
                  <span>Updated: {formatDate(selectedConversation.updatedAt)}</span>
                </div>
              </div>

              <div className="message-list">
                {selectedConversation.messages.map((message) => (
                  <div key={message.id} className={`message ${message.role}`}>
                    <div className="message-header">
                      <span className="message-role">{message.role}</span>
                      <span className="message-time">{formatDate(message.timestamp)}</span>
                    </div>
                    <div className="message-content">{message.content}</div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-detail">
              Select a conversation to view details
            </div>
          )}
        </div>
      </div>

      <style>{`
        .conversation-history {
          padding: 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .conversation-history-header {
          margin-bottom: 20px;
        }

        .conversation-history-header h2 {
          margin: 0 0 15px 0;
        }

        .search-bar {
          display: flex;
          gap: 10px;
        }

        .search-bar input {
          flex: 1;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .search-bar button {
          padding: 8px 16px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .search-bar button:hover {
          background: #0056b3;
        }

        .error-message {
          padding: 12px;
          background: #fee;
          color: #c33;
          border-radius: 4px;
          margin-bottom: 15px;
        }

        .conversation-layout {
          display: grid;
          grid-template-columns: 400px 1fr;
          gap: 20px;
          height: calc(100vh - 200px);
        }

        .conversation-list {
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow-y: auto;
          padding: 10px;
        }

        .conversation-item {
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 6px;
          margin-bottom: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .conversation-item:hover {
          background: #f5f5f5;
          border-color: #ccc;
        }

        .conversation-item.selected {
          background: #e3f2fd;
          border-color: #2196f3;
        }

        .conversation-item-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 8px;
        }

        .conversation-item-header h3 {
          margin: 0;
          font-size: 16px;
          flex: 1;
        }

        .delete-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
          padding: 0;
          width: 24px;
          height: 24px;
          line-height: 20px;
        }

        .delete-btn:hover {
          color: #c33;
        }

        .conversation-item-meta {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: #666;
          margin-bottom: 8px;
        }

        .conversation-tags {
          display: flex;
          gap: 5px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }

        .tag {
          padding: 2px 8px;
          background: #e0e0e0;
          border-radius: 12px;
          font-size: 11px;
          color: #555;
        }

        .last-message {
          font-size: 13px;
          color: #777;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .conversation-detail {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          overflow-y: auto;
        }

        .conversation-detail-header {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #eee;
        }

        .conversation-detail-header h2 {
          margin: 0 0 10px 0;
        }

        .conversation-meta {
          display: flex;
          gap: 20px;
          font-size: 13px;
          color: #666;
        }

        .message-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .message {
          padding: 12px 15px;
          border-radius: 8px;
          background: #f5f5f5;
        }

        .message.user {
          background: #e3f2fd;
          margin-left: 20px;
        }

        .message.agent {
          background: #f1f8e9;
          margin-right: 20px;
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
        }

        .empty-state,
        .empty-detail,
        .loading {
          padding: 40px;
          text-align: center;
          color: #999;
        }
      `}</style>
    </div>
  );
};

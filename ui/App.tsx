import React, { useState } from 'react';
import { Dashboard } from './Dashboard';
import { ConversationHistory } from './components/ConversationHistory';
import { Workflows } from './Workflows';

type View = 'dashboard' | 'history' | 'workflows';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  return (
    <div className="app">
      <nav className="app-nav">
        <h1>DeskAI</h1>
        <div className="nav-buttons">
          <button
            className={currentView === 'dashboard' ? 'active' : ''}
            onClick={() => setCurrentView('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={currentView === 'history' ? 'active' : ''}
            onClick={() => setCurrentView('history')}
          >
            History
          </button>
          <button
            className={currentView === 'workflows' ? 'active' : ''}
            onClick={() => setCurrentView('workflows')}
          >
            Workflows
          </button>
        </div>
      </nav>

      <main className="app-main">
        {currentView === 'dashboard' && (
          <Dashboard
            conversationId={selectedConversationId}
            onNewConversation={() => setSelectedConversationId(null)}
          />
        )}
        {currentView === 'history' && (
          <ConversationHistory
            onSelectConversation={(id) => {
              setSelectedConversationId(id);
              setCurrentView('dashboard');
            }}
          />
        )}
        {currentView === 'workflows' && (
          <Workflows />
        )}
      </main>

      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: #fafafa;
        }

        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .app-nav {
          background: #2c3e50;
          color: white;
          padding: 15px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .app-nav h1 {
          font-size: 24px;
          margin: 0;
        }

        .nav-buttons {
          display: flex;
          gap: 10px;
        }

        .nav-buttons button {
          padding: 8px 20px;
          background: transparent;
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }

        .nav-buttons button:hover {
          background: rgba(255,255,255,0.1);
        }

        .nav-buttons button.active {
          background: #3498db;
          border-color: #3498db;
        }

        .app-main {
          flex: 1;
          overflow: auto;
        }
      `}</style>
    </div>
  );
};

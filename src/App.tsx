import { useState, useEffect } from 'react';
import ModelSelector from './components/ModelSelector';
import ChatInterface from './components/ChatInterface';
import ToolPanel from './components/ToolPanel';
import { getAvailableModels, getAvailableTools, routeRequest, executeTool, type AvailableModel } from './services/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

function App() {
  const [models, setModels] = useState<AvailableModel[]>([]);
  const [tools, setTools] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('general');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadAvailableModels();
    loadAvailableTools();
  }, []);

  const loadAvailableModels = async () => {
    try {
      const availableModels = await getAvailableModels();
      setModels(availableModels);
    } catch (error) {
      console.error('Failed to load models:', error);
    }
  };

  const loadAvailableTools = async () => {
    try {
      const availableTools = await getAvailableTools();
      setTools(availableTools);
    } catch (error) {
      console.error('Failed to load tools:', error);
    }
  };

  const handleSendMessage = async (prompt: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await routeRequest({
        prompt,
        model: selectedModel,
        temperature: 0.7,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        model: response.model,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToolExecution = async (tool: string) => {
    setIsLoading(true);
    try {
      const response = await executeTool({
        tool,
        parameters: {},
      });

      const toolMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Tool: ${response.tool}\nResult: ${response.result}`,
      };

      setMessages((prev) => [...prev, toolMessage]);
    } catch (error) {
      console.error('Failed to execute tool:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>DeskAI</h1>
        <p className="subtitle">Your Professional Helpdesk - Offline Meta-Agent</p>
      </header>

      <div className="main-content">
        <aside className="sidebar">
          <ModelSelector
            models={models}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
          />
          <ToolPanel tools={tools} onExecuteTool={handleToolExecution} />
        </aside>

        <main className="chat-container">
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
          />
        </main>
      </div>

      <footer className="app-footer">
        <p>Running locally on your device • All data stays private</p>
      </footer>
    </div>
  );
}

export default App;

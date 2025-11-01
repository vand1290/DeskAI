import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<h1 style="color: white; padding: 20px;">Error: Root element not found</h1>';
} else {
  try {
    const root = ReactDOM.createRoot(rootElement as HTMLElement);
    
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    document.body.innerHTML = `<h1 style="color: white; padding: 20px;">Error: ${error}</h1>`;
  }
}

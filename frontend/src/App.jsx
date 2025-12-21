import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import ActionReplay from './components/ActionReplay';
import AIAcceleration from './components/AIAcceleration';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="App">
      <header className="app-header">
        <h1>🤖 Automation Bot Framework</h1>
        <p>Monitoring • Action Replay • AI-Driven Accelerations</p>
      </header>

      <nav className="app-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={activeTab === 'replay' ? 'active' : ''}
          onClick={() => setActiveTab('replay')}
        >
          ▶️ Action Replay
        </button>
        <button 
          className={activeTab === 'ai' ? 'active' : ''}
          onClick={() => setActiveTab('ai')}
        >
          🧠 AI Acceleration
        </button>
      </nav>

      <main className="app-content">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'replay' && <ActionReplay />}
        {activeTab === 'ai' && <AIAcceleration />}
      </main>

      <footer className="app-footer">
        <p>Automation Bot Framework v1.0.0</p>
      </footer>
    </div>
  );
}

export default App;

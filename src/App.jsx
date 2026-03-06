import { useState } from 'react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';

import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div className="app-container">
      {!isAuthenticated ? (
        <AuthPage onLogin={() => setIsAuthenticated(true)} />
      ) : (
        <Dashboard onLogout={() => setIsAuthenticated(false)} />
      )}
    </div>
  );
}

export default App;

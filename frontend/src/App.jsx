import { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import api from './api/axios';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    const verifyUser = async () => {
      if (token) {
        try {
          // Fetch fresh user data using the api utility to ensure designation/manager are synced
          const response = await api.get('/auth/me');
          const freshUser = response.data;
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (err) {
          console.error("Failed to fetch fresh user data:", err);
          if (storedUser) setUser(JSON.parse(storedUser));
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;
  }

  return (
    <div className="app-container">
      {!user ? (
        <AuthPage onLogin={handleLogin} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} setUser={setUser} />
      )}
    </div>
  );
}

export default App;

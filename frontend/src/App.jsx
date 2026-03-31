import { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import api from './api/axios';

import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is already logged in (quick UI check)
        const storedUser = localStorage.getItem('user');

        const verifyUser = async () => {
            try {
                // Fetch fresh user data - cookie is automatically sent
                const response = await api.get('/auth/me');
                const freshUser = response.data;
                setUser(freshUser);
                localStorage.setItem('user', JSON.stringify(freshUser));
            } catch (err) {
                console.error("Session verification failed:", err.message);
                localStorage.removeItem('user');
                setUser(null);
            }
            setLoading(false);
        };

        verifyUser();
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            console.error('Logout API call failed');
        }
        localStorage.removeItem('user');
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

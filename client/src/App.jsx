import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import { api } from './api';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)', fontFamily: 'var(--font-sans)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 42, height: 42, border: '3px solid #e2e8f0',
            borderTopColor: '#4f46e5', borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto',
          }} />
          <p style={{ color: '#64748b', marginTop: 16, fontSize: 13, fontWeight: 600 }}>Memuat aplikasi...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <Dashboard user={user} onLogout={handleLogout} />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </>
  );
}

export default App;

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('piso-token');
    const savedUser = localStorage.getItem('piso-user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    localStorage.setItem('piso-token', data.token);
    localStorage.setItem('piso-user', JSON.stringify({ username: data.username }));
    // Store session ID for server-side validation
    if (data.sessionId) {
      localStorage.setItem('piso-session-id', data.sessionId);
    }
    // Generate local session ID for cross-tab detection within same browser
    const tabId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('piso-tab-id', tabId);
    setToken(data.token);
    setUser({ username: data.username });
    return data;
  }, []);

  const signup = useCallback(async (username, password) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Signup failed');
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('piso-token');
    localStorage.removeItem('piso-user');
    localStorage.removeItem('piso-session-id');
    localStorage.removeItem('piso-tab-id');
    setToken(null);
    setUser(null);
  }, []);

  const saveToCloud = useCallback(async (gameState) => {
    if (!token) return;
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ gameState }),
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.sessionExpired) {
        const err = new Error(data.message || 'Session expired');
        err.sessionExpired = true;
        throw err;
      }
      throw new Error(data.message || 'Save failed');
    }
    return data;
  }, [token]);

  const loadFromCloud = useCallback(async () => {
    if (!token) return null;
    const res = await fetch('/api/load', {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.sessionExpired) {
        const err = new Error(data.message || 'Session expired');
        err.sessionExpired = true;
        throw err;
      }
      throw new Error(data.message || 'Load failed');
    }
    return data.gameState;
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, saveToCloud, loadFromCloud }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

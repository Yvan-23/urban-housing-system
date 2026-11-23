import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [mfaPending, setMfaPending] = useState(false);
  const [loading, setLoading] = useState(true);

  // We use events to handle session timeout without re-rendering constantly
  const resetTimeout = useCallback(() => {
    if (user && !mfaPending) {
      localStorage.setItem('urban_last_activity', Date.now().toString());
    }
  }, [user, mfaPending]);

  useEffect(() => {
    const savedUser = localStorage.getItem('urban_user');
    const mfaStatus = localStorage.getItem('urban_mfa_pending');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setMfaPending(mfaStatus === 'true');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!user || mfaPending) return;

    // Check timeout every minute
    const interval = setInterval(() => {
      const lastActivity = parseInt(localStorage.getItem('urban_last_activity') || '0', 10);
      if (Date.now() - lastActivity > SESSION_TIMEOUT_MS) {
        logout(true);
      }
    }, 60000);

    // Activity listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimeout));
    resetTimeout(); // Initial set

    return () => {
      clearInterval(interval);
      events.forEach(e => window.removeEventListener(e, resetTimeout));
    };
  }, [user, mfaPending, resetTimeout]);

  const login = (authData) => {
    // authData comes from the backend: { user, token }
    setUser(authData.user);
    setMfaPending(true); // Always require MFA as per project rules
    localStorage.setItem('urban_user', JSON.stringify(authData.user));
    localStorage.setItem('urban_jwt_token', authData.token);
    localStorage.setItem('urban_mfa_pending', 'true');
  };

  const completeMFA = () => {
    setMfaPending(false);
    localStorage.setItem('urban_mfa_pending', 'false');
    localStorage.setItem('urban_last_activity', Date.now().toString());
  };

  const logout = (isTimeout = false) => {
    setUser(null);
    setMfaPending(false);
    localStorage.removeItem('urban_user');
    localStorage.removeItem('urban_jwt_token');
    localStorage.removeItem('urban_mfa_pending');
    localStorage.removeItem('urban_last_activity');
    
    if (isTimeout) {
      // Could dispatch an event or use a ref to show a toast message later
      sessionStorage.setItem('urban_session_timeout', 'true');
      window.location.href = '/login'; // Force reload to clear all states
    }
  };

  const value = {
    user,
    login,
    logout,
    completeMFA,
    loading,
    mfaPending,
    isAuthenticated: !!user && !mfaPending,
    role: user?.role || null
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

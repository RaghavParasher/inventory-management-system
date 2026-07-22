import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);

  useEffect(() => {
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token, user]);

  const login = async (username, password) => {
    setLoadingAuth(true);
    setAuthError(null);
    try {
      const data = await loginUser({ username, password });
      setToken(data.access_token);
      setUser(data.user);
      setIsLoginModalOpen(false);
      return data;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid credentials. Please verify or use One-Click Demo Access.';
      setAuthError(msg);
      throw err;
    } finally {
      setLoadingAuth(false);
    }
  };

  const quickDemoLogin = async (role) => {
    const creds = role === 'admin' ? { username: 'admin', password: 'admin123' } : { username: 'warehouse', password: 'stock2026' };
    return await login(creds.username, creds.password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const isAdmin = user?.role === 'admin';
  const isWarehouse = user?.role === 'warehouse';

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAdmin,
      isWarehouse,
      login,
      quickDemoLogin,
      logout,
      isLoginModalOpen,
      setIsLoginModalOpen,
      authError,
      setAuthError,
      loadingAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

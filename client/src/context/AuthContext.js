import React, { createContext, useState, useEffect, useContext } from 'react';
import * as api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { user } = await api.getMe();
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (email, password) => {
    const { token, user } = await api.login(email, password);
    localStorage.setItem('token', token);
    setUser(user);
    setIsAuthenticated(true);
    return { user };
  };

  const handleRegister = async (username, email, password) => {
    const { token, user } = await api.register(username, email, password);
    localStorage.setItem('token', token);
    setUser(user);
    setIsAuthenticated(true);
    return { user };
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};


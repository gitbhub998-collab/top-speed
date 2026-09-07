import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    let isMounted = true;
    const storedToken = localStorage.getItem('token');

    if (!storedToken) {
      setLoading(false);
      return undefined;
    }

    authService.getCurrentUser()
      .then(({ data }) => {
        if (!isMounted) return;
        setToken(storedToken);
        setUser(data.user);
        setIsAuthenticated(true);
      })
      .catch(() => {
        if (!isMounted) return;
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const handleExpiredSession = () => {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:expired', handleExpiredSession);
    return () => window.removeEventListener('auth:expired', handleExpiredSession);
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setToken(token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      void error;
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (newUserData) => {
    setUser(newUserData);
  };

  const updateEmail = (newToken, newUserData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUserData);
  };

  const updateProfile = (newUserData) => {
    setUser((currentUser) => ({ ...currentUser, ...newUserData }));
  };

  const updatePassword = (newToken, newUserData) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUserData);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, setLoading, isAuthenticated, updateUser, updateEmail, updateProfile, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};


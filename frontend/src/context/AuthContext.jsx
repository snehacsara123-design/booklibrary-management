import React from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import API from '../services/api';

export const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const value = localStorage.getItem('libraryUser');
    return value ? JSON.parse(value) : null;
  } catch {
    localStorage.removeItem('libraryUser');
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  useEffect(() => {
    const handleExpiredAuth = () => setUser(null);
    window.addEventListener('library:auth-expired', handleExpiredAuth);
    return () => window.removeEventListener('library:auth-expired', handleExpiredAuth);
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await API.post('/auth/login', credentials);
    const token = data?.token || data?.accessToken;
    const authenticatedUser = data?.user;
    if (!token || !authenticatedUser) {
      throw new Error('The login response must include a token and user.');
    }
    localStorage.setItem('libraryToken', token);
    localStorage.setItem('libraryUser', JSON.stringify(authenticatedUser));
    setUser(authenticatedUser);
    return authenticatedUser;
  }, []);

  const register = useCallback(async (details) => {
    const { data } = await API.post('/auth/register', details);
    if (data?.token && data?.user) {
      localStorage.setItem('libraryToken', data.token);
      localStorage.setItem('libraryUser', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    }
    return null;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('libraryToken');
    localStorage.removeItem('libraryUser');
    setUser(null);
  }, []);

  const updateUser = useCallback((nextUser) => {
    localStorage.setItem('libraryUser', JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const value = useMemo(
    () => ({ user, login, register, logout, updateUser, isAuthenticated: Boolean(user) }),
    [user, login, register, logout, updateUser],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}

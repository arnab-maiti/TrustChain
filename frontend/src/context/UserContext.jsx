import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  const fetchUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.data);
      setLoading(false);
    } catch (error) {
      // 401 means unauthorized/invalid token - clear it
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
      } else {
        console.error('Failed to fetch user:', error.message);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken && storedToken.trim()) {
        setToken(storedToken);
        await fetchUser();
      } else {
        setLoading(false);
      }
    };
    
    initAuth();
    // Only run on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (newToken, userData) => {
    if (newToken) {
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

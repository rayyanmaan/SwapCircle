'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

        if (token && storedUser) {
          // Try to verify token and get current user
          try {
            const currentUser = await authAPI.getCurrentUser();
            setUser(currentUser);
            setIsAuthenticated(true);
          } catch (error) {
            // Token invalid, clear storage
            authAPI.logout();
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const userData = response.user || JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);
      setIsAuthenticated(true);
      return { success: true, user: userData };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const register = async (email, password, username, fullName) => {
    try {
      const response = await authAPI.register(email, password, username, fullName);
      // After registration, automatically log in
      if (response.token) {
        // Token is already stored by authAPI.register, just update state
        const userData = response.user || { email, username, full_name: fullName };
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true, user: userData };
      }
      return { success: true, message: 'Registration successful. Please check your email to verify your account.' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshUser = async () => {
    try {
      const currentUser = await authAPI.getCurrentUser();
      setUser(currentUser);
      // Also update localStorage
      if (typeof window !== 'undefined' && currentUser) {
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      return currentUser;
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If refresh fails, user might be logged out
      return null;
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


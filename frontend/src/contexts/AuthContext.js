import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProfile, logout as authLogout } from '../features/auth/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tryLoadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        const devMode = localStorage.getItem('dev-mode');
        
        if (token === 'dev-token' && devMode === 'true') {
          // Development mode - set mock user
          setUser({ username: 'dev-user', role: 'Admin' });
        } else if (token) {
          const response = await getProfile();
          setUser(response.data);
        }
      } catch (error) {
        // Token is invalid or expired, remove it
        localStorage.removeItem('token');
        localStorage.removeItem('dev-mode');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    tryLoadUser();
  }, []);

  const login = async (username, password) => {
    const { login: loginService } = await import('../features/auth/authService');
    
    try {
      const response = await loginService({ username, password });
      
      // Get user profile after successful login
      const profileResponse = await getProfile();
      setUser(profileResponse.data);
      
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authLogout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

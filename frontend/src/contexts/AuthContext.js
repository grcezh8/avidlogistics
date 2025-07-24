import React, { createContext, useState, useEffect, useContext } from 'react';
import { getProfile } from '../features/auth/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const tryLoadUser = async () => {
      try {
        const res = await getProfile(); //profile reloads > calls getProfile (if token is valid and in localStorage, backend returns user info)
        setUser(res.data);
      } catch {
        setUser(null);
      }
    };
    tryLoadUser();
  }, []);

  const login = (userData) => setUser(userData);
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


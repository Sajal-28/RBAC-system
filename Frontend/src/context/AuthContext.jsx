import { createContext, useState, useEffect, useContext } from 'react';
import API from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await API.get('/api/auth/me');
      setUser(response.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email, password) => {
    // NOTE: Do NOT touch global loading here — it controls route rendering (PublicRoute).
    // Toggling it would unmount the Login page and wipe its local error state.
    // Login.jsx manages its own loading spinner locally.
    try {
      const response = await API.post('/api/auth/login', { email, password });
      const userData = response.data.user;
      setUser(userData);
      return userData;
    } catch (err) {
      throw err;
    }
  };

  const register = async (userData) => {
    // Same reasoning as login — do NOT touch global loading here.
    try {
      const response = await API.post('/api/auth/register', userData);
      const newUser = response.data.user;
      setUser(newUser);
      return newUser;
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    try {
      await API.post('/api/auth/logout');
      setUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

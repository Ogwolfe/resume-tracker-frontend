import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './api/axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkAuth() {
      setLoading(true);
      try {
        const res = await axiosInstance.get('/api/me');
        setUser(res.data.user);
      } catch {
        // Optionally handle error
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  async function login({ username, password }) {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post('/login', { username, password });
      setUser(res.data.user || { username });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function register({ username, email, password }) {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post('/register', { username, email, password });
      setUser(res.data.user || { email });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post('/logout');
      setUser(null);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 
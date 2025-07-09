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
        setUser(res.data);
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
      // Check if it's a 401 error with "Invalid credentials" message
      if (err.response?.status === 401) {
        // Handle different possible response formats
        const responseData = err.response?.data;
        if (responseData === 'Invalid credentials' || 
            responseData?.message === 'Invalid credentials' ||
            responseData?.error === 'Invalid credentials') {
          setError('Incorrect username or password');
        } else {
          setError('Incorrect username or password');
        }
      } else {
        // Handle other errors
        const errorMessage = err.response?.data?.message || err.response?.data || err.message;
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  async function register({ username, email, password }) {
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post('/register', { username, email, password });
      // Automatically log in after successful registration
      await login({ username, password });
    } catch (err) {
      // Check if it's a 400 error with "User already exists" message
      if (err.response?.status === 400) {
        const responseData = err.response?.data;
        if (responseData === 'User already exists' || 
            responseData?.message === 'User already exists' ||
            responseData?.error === 'User already exists') {
          setError('Email or username already in use');
        } else {
          // Handle other 400 errors
          const errorMessage = err.response?.data?.message || err.response?.data || err.message;
          setError(errorMessage);
        }
      } else {
        // Handle other errors
        const errorMessage = err.response?.data?.message || err.response?.data || err.message;
        setError(errorMessage);
      }
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
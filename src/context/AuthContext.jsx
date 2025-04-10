import { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../config/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Interceptor handles this now
      // Fetch user data
      axiosInstance.get('/auth/me')
        .then(response => {
          setUser(response.data);
        })
        .catch(() => {
          localStorage.removeItem('token');
          // delete axiosInstance.defaults.headers.common['Authorization']; // Interceptor handles removal implicitly
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await axiosInstance.post('/auth/login', { email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    // axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Interceptor handles this now
    setUser(user);
  };

  const register = async (name, email, password) => {
    const response = await axiosInstance.post('/auth/register', { name, email, password });
    const { token, user } = response.data;
    localStorage.setItem('token', token);
    // axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Interceptor handles this now
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    // delete axiosInstance.defaults.headers.common['Authorization']; // Interceptor handles removal implicitly
    setUser(null);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
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
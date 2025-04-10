import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL should be relative for Vite proxy to work, or use env var for production
  // For local dev, the proxy handles forwarding from /api to http://localhost:3000
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json'
  },
  // withCredentials: true // No longer needed for token auth
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default axiosInstance; 
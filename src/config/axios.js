import axios from 'axios';

const axiosInstance = axios.create({
  // baseURL should be relative for Vite proxy to work, or use env var for production
  // For local dev, the proxy handles forwarding from /api to http://localhost:3000
  baseURL: '/api', 
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true
});

export default axiosInstance; 
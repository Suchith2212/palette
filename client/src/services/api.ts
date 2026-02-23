import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Use relative path to leverage Vite's proxy
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add the auth token to headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;

import axios from 'axios';
import { getApiOrigin } from '../config/api';

const apiOrigin = getApiOrigin();

const api = axios.create({
  baseURL: apiOrigin ? `${apiOrigin}/api` : '/api',
  headers: {
    'Content-Type': 'application/json',
  },
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

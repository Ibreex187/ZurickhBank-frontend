import axios from 'axios';
import Cookies from 'universal-cookie';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://zurickh-bank.vercel.app/api/v1';

const cookies = new Cookies();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // enable sending cookies for same-site / httpOnly cookie flows
  withCredentials: true,
});

// Add token to requests if it exists (read from cookie)
api.interceptors.request.use(
  (config) => {
    const token = cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const requestUrl = String(error.config?.url || '');
      const isPublicAuthRequest =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/auth/forgot-password');
      const hasToken = Boolean(cookies.get('token'));

      if (hasToken && !isPublicAuthRequest) {
        cookies.remove('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

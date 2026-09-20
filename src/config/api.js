import axios from 'axios';
import Cookies from 'universal-cookie';

const LOCAL_API_URL = 'http://localhost:4040/api/v1';
const VERCEL_API_URL = 'https://zurickh-bank.vercel.app/api/v1';

const normalizeUrl = (url) => String(url || '').trim().replace(/\/+$/, '');

const resolveApiUrls = () => {
  const configuredBaseUrl = normalizeUrl(import.meta.env.VITE_API_BASE_URL);
  const configuredFallbackUrl = normalizeUrl(import.meta.env.VITE_API_FALLBACK_URL);
  const isLocalHost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

  const primaryUrl = configuredBaseUrl || (isLocalHost ? LOCAL_API_URL : VERCEL_API_URL);
  let fallbackUrl = configuredFallbackUrl || (primaryUrl === LOCAL_API_URL ? VERCEL_API_URL : LOCAL_API_URL);

  if (fallbackUrl === primaryUrl) {
    fallbackUrl = primaryUrl === LOCAL_API_URL ? VERCEL_API_URL : LOCAL_API_URL;
  }

  return { primaryUrl, fallbackUrl };
};

const { primaryUrl: API_BASE_URL, fallbackUrl: API_FALLBACK_URL } = resolveApiUrls();

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
    const originalRequest = error.config;
    const status = error.response?.status;
    const shouldRetryWithFallback =
      originalRequest &&
      API_FALLBACK_URL &&
      !originalRequest._retryWithFallback &&
      (!error.response || status >= 500);

    if (shouldRetryWithFallback) {
      originalRequest._retryWithFallback = true;
      return api({
        ...originalRequest,
        baseURL: API_FALLBACK_URL,
      });
    }

    if (error.response?.status === 401) {
      const requestUrl = String(error.config?.url || '');
      const isPublicAuthRequest =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/auth/forgot-password');
      const hasToken = Boolean(cookies.get('token'));

      if (hasToken && !isPublicAuthRequest) {
        cookies.remove('token');

        // Lets the login page explain why the user was sent back
        try {
          window.sessionStorage.setItem('auth_notice', 'Your session expired. Please sign in again.');
        } catch {
          // sessionStorage can be unavailable (private mode); the redirect still works without the message
        }

        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

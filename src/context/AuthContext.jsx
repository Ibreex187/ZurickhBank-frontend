import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../config/api';
import Cookies from 'universal-cookie';

const cookies = new Cookies();

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isProduction = import.meta.env.PROD;

  useEffect(() => {
    const token = cookies.get('token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      if (response.data.success) {
        setUser(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
  cookies.remove('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data?.success) {
        // store token in cookie so it can be read by api client
        const token = response.data.data.token;
        cookies.set('token', token, {
          path: '/',
          maxAge: 60 * 60 * 24, // 1 day
          sameSite: 'lax',
          secure: isProduction,
        });
        // optionally store minimal non-sensitive user info
        if (response.data.data.user) {
          try {
            cookies.set('user', JSON.stringify(response.data.data.user), {
              path: '/',
              maxAge: 60 * 60 * 24,
              sameSite: 'lax',
              secure: isProduction,
            });
          } catch {
            // ignore cookie set errors
          }
        }
        await fetchUserProfile();
        return response.data;
      }
      throw new Error(response.data?.message || 'Login failed');
    } catch (err) {
      // Log the full response/error for debugging
      // err.response may contain server status and body
      // Throw a new Error with server-provided message when available
      // so the UI shows a helpful message
      console.error('AuthContext.login error:', err.response ?? err);
      const serverMsg = err.response?.data?.message || err.response?.data || err.message;
      throw new Error(serverMsg || 'Login failed due to server error');
    }
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      return response.data;
    }
    throw new Error(response.data.message || 'Registration failed');
  };

  const logout = () => {
  cookies.remove('token');
  cookies.remove('user');
    setUser(null);
    window.location.href = '/login';
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser: fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

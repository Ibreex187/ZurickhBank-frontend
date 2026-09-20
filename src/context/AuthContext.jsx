import { createContext, useState, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../config/api';
import Cookies from 'universal-cookie';
import { getAuthErrorMessage } from '../utils/authErrors';

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

  const login = async (username, password) => {
    try {
      const normalizedUserName = String(username || '').trim();
      const response = await api.post('/auth/login', {
        userName: normalizedUserName,
        username: normalizedUserName,
        password,
      });
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
      // Log only the status: the axios response carries the request config, which includes the password
      console.error('AuthContext.login failed:', err.response?.status ?? err.message);

      const loginError = new Error(getAuthErrorMessage(err, 'Login failed. Please try again.'));
      loginError.status = err.response?.status;
      throw loginError;
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

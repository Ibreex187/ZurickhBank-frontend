import api from '../config/api';

/**
 * Profile Service
 * Connects with backend profile APIs for user profile management
 * Frontend: c:\Users\DELL\OneDrive\Documents\lv4_Proj\banknode-frontend\src\services\profileService.js
 * Backend APIs: 
 * - GET /api/v1/auth/me (getMe function in authcontroller.js)
 * - GET /api/v1/users/profile (getUserProfile function in user.controller.js)
 * - PUT /api/v1/users/profile (updateProfile function)
 * - POST /api/v1/users/change-password (changePassword function)
 */

/**
 * Get current user profile using auth/me endpoint
 * Uses the getMe function from authcontroller.js
 */
export const getCurrentUserProfile = async () => {
  try {
    const response = await api.get('/auth/me');
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to get profile');
  } catch (error) {
    console.error('Profile Service - getCurrentUserProfile error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to get profile',
      error: error.response?.data
    };
  }
};

/**
 * Get user profile using users/profile endpoint (alternative)
 * Uses the getUserProfile function from user.controller.js
 */
export const getUserProfile = async () => {
  try {
    const response = await api.get('/users/profile');
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to get profile');
  } catch (error) {
    console.error('Profile Service - getUserProfile error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to get profile',
      error: error.response?.data
    };
  }
};

/**
 * Update user profile information
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put('/users/profile', profileData);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to update profile');
  } catch (error) {
    console.error('Profile Service - updateUserProfile error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to update profile',
      error: error.response?.data
    };
  }
};

/**
 * Change user password
 */
export const changeUserPassword = async (passwordData) => {
  try {
    const payload = {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    };

    const response = await api.post('/users/change-password', payload);
    
    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }
    
    throw new Error(response.data.message || 'Failed to change password');
  } catch (error) {
    console.error('Profile Service - changeUserPassword error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to change password',
      error: error.response?.data
    };
  }
};

/**
 * Set or update transaction PIN
 */
export const setUserTransactionPin = async (pinData) => {
  try {
    const payload = {
      currentPassword: pinData.currentPassword,
      transactionPin: String(pinData.transactionPin || '').trim(),
      confirmTransactionPin: String(pinData.confirmTransactionPin || '').trim(),
    };

    const response = await api.post('/users/transaction-pin', payload);

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data,
        message: response.data.message
      };
    }

    throw new Error(response.data.message || 'Failed to set transaction PIN');
  } catch (error) {
    console.error('Profile Service - setUserTransactionPin error:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to set transaction PIN',
      error: error.response?.data
    };
  }
};

/**
 * Get user account statistics and summary
 * This function provides comprehensive user account information
 */
export const getUserAccountSummary = async () => {
  try {
    const profileResponse = await getCurrentUserProfile();
    
    if (!profileResponse.success) {
      return profileResponse;
    }
    
    const userData = profileResponse.data;
    
    // Calculate account summary
    const accountSummary = {
      totalBalance: userData.balance || 0,
      savingsBalance: userData.savingsBalance || 0,
      availableBalance: (userData.balance || 0) - (userData.savingsBalance || 0),
      accountNumber: userData.accountNumber,
      memberSince: userData.createdAt ? new Date(userData.createdAt).getFullYear() : new Date().getFullYear(),
      accountStatus: 'Active', // You can expand this based on backend logic
      // Add more calculated fields as needed
    };
    
    return {
      success: true,
      data: {
        profile: userData,
        summary: accountSummary
      },
      message: 'Account summary retrieved successfully'
    };
  } catch (error) {
    console.error('Profile Service - getUserAccountSummary error:', error);
    return {
      success: false,
      message: error.message || 'Failed to get account summary',
      error: error
    };
  }
};

/**
 * Validate profile data before updating
 */
export const validateProfileData = (profileData) => {
  const errors = {};
  
  if (profileData.firstName && profileData.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters long';
  }
  
  if (profileData.lastName && profileData.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters long';
  }
  
  if (profileData.userName && profileData.userName.trim().length < 3) {
    errors.userName = 'Username must be at least 3 characters long';
  }
  
  if (profileData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate password data before changing
 */
export const validatePasswordData = (passwordData) => {
  const errors = {};
  
  if (!passwordData.currentPassword) {
    errors.currentPassword = 'Current password is required';
  }
  
  if (!passwordData.newPassword) {
    errors.newPassword = 'New password is required';
  } else if (passwordData.newPassword.length < 6) {
    errors.newPassword = 'New password must be at least 6 characters long';
  }
  
  if (!passwordData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your new password';
  } else if (passwordData.newPassword !== passwordData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  if (passwordData.currentPassword === passwordData.newPassword) {
    errors.newPassword = 'New password must be different from current password';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateTransactionPinData = (pinData) => {
  const errors = {};

  if (!pinData.currentPassword) {
    errors.currentPassword = 'Current password is required';
  }

  const pin = String(pinData.transactionPin || '').trim();
  if (!pin) {
    errors.transactionPin = 'Transaction PIN is required';
  } else if (!/^\d{4}$/.test(pin)) {
    errors.transactionPin = 'Transaction PIN must be exactly 4 digits';
  }

  const confirmPin = String(pinData.confirmTransactionPin || '').trim();
  if (!confirmPin) {
    errors.confirmTransactionPin = 'Confirm transaction PIN is required';
  } else if (confirmPin !== pin) {
    errors.confirmTransactionPin = 'Confirm transaction PIN must match transaction PIN';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const requestProfileUpdateOtp = async () => {
  try {
    const response = await api.post('/users/profile/otp');
    return {
      success: response.data?.success || false,
      message: response.data?.message || 'OTP request processed',
      data: response.data?.data
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to request OTP',
      error: error.response?.data
    };
  }
};

export { requestForgotPasswordOtp, resetForgotPassword } from './authService';
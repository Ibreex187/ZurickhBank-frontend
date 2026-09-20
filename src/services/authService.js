import api from '../config/api';

const isSuccessResponse = (response) => {
  const body = response?.data;
  if (!response) return false;

  if (body?.success === true || body?.ok === true || body?.status === 'success') {
    return true;
  }

  return response.status >= 200 && response.status < 300;
};

const normalizeResult = (response, fallbackMessage) => ({
  success: isSuccessResponse(response),
  message: response?.data?.message || fallbackMessage,
  data: response?.data?.data ?? response?.data,
});

export const requestForgotPasswordOtp = async (email) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  try {
    const response = await api.post('/auth/forgot-password/request', {
      email: normalizedEmail,
    });
    return normalizeResult(response, 'OTP request processed');
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to request OTP',
      status: error.response?.status,
      isNetworkError: !error.response,
      error: error.response?.data
    };
  }
};

export const verifyForgotPasswordOtp = async ({ email, otp }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedOtp = String(otp || '').trim();

  try {
    const response = await api.post('/auth/forgot-password/verify', {
      email: normalizedEmail,
      otp: normalizedOtp,
    });
    return normalizeResult(response, 'OTP verification processed');
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to verify OTP',
      status: error.response?.status,
      isNetworkError: !error.response,
      error: error.response?.data
    };
  }
};

export const resetForgotPassword = async ({ resetToken, newPassword, confirmPassword }) => {
  const normalizedResetToken = String(resetToken || '').trim();

  try {
    const response = await api.post('/auth/forgot-password/reset', {
      resetToken: normalizedResetToken,
      newPassword,
      confirmPassword: confirmPassword || newPassword,
    });
    return normalizeResult(response, 'Password reset processed');
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to reset password',
      status: error.response?.status,
      isNetworkError: !error.response,
      error: error.response?.data
    };
  }
};

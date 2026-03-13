import api from '../config/api';

// Actual savings endpoints from your backend
const SAVINGS_ENDPOINTS = {
  deposit: '/savings/deposit',
  withdraw: '/savings/withdraw',
  quickTransfer: '/savings/quick-transfer',
  overview: '/savings/overview',
  history: '/savings/history',
  insights: '/savings/insights',
};

/**
 * Deposit money to savings (from main balance)
 */
export const depositToSavings = async (amount, transactionPin) => {
  try {
    const response = await api.post(SAVINGS_ENDPOINTS.deposit, {
      amount,
      transactionPin: String(transactionPin || '').trim()
    });
    return response.data;
  } catch (error) {
    console.error('Failed to deposit to savings:', error);
    throw error;
  }
};

/**
 * Withdraw money from savings (to main balance)
 */
export const withdrawFromSavings = async (amount, transactionPin) => {
  try {
    const response = await api.post(SAVINGS_ENDPOINTS.withdraw, {
      amount,
      transactionPin: String(transactionPin || '').trim()
    });
    return response.data;
  } catch (error) {
    console.error('Failed to withdraw from savings:', error);
    throw error;
  }
};

/**
 * Quick transfer between main and savings
 * direction: 'to-savings' or 'to-main'
 */
export const quickTransfer = async (amount, direction, transactionPin) => {
  try {
    const response = await api.post(SAVINGS_ENDPOINTS.quickTransfer, { 
      amount, 
      direction,
      transactionPin: String(transactionPin || '').trim()
    });
    return response.data;
  } catch (error) {
    console.error('Failed to perform quick transfer:', error);
    throw error;
  }
};

/**
 * Get savings account overview and statistics
 */
export const getSavingsOverview = async () => {
  try {
    const response = await api.get(SAVINGS_ENDPOINTS.overview);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch savings overview:', error);
    throw error;
  }
};

/**
 * Get savings transaction history with pagination
 */
export const getSavingsHistory = async (params = {}) => {
  try {
    const { limit = 20, page = 1, type = null } = params;
    const queryParams = new URLSearchParams({ limit, page });
    if (type) queryParams.append('type', type);
    
    const response = await api.get(`${SAVINGS_ENDPOINTS.history}?${queryParams}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch savings history:', error);
    throw error;
  }
};

/**
 * Get savings insights and recommendations
 */
export const getSavingsInsights = async () => {
  try {
    const response = await api.get(SAVINGS_ENDPOINTS.insights);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch savings insights:', error);
    throw error;
  }
};

export default {
  depositToSavings,
  withdrawFromSavings,
  quickTransfer,
  getSavingsOverview,
  getSavingsHistory,
  getSavingsInsights,
};
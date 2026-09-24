import api from '../config/api';

// Backend transaction endpoints
const TRANSACTION_ENDPOINTS = {
  transfer: '/transactions/transfer',
  deposit: '/transactions/deposit',
  withdraw: '/transactions/withdraw',
  limits: '/transactions/limits',
  history: '/transactions/history',
  summary: '/transactions/history/summary',
  getById: '/transactions/history/:transactionId'
};

/**
 * Get transaction limits and usage snapshot for current user
 */
export const getTransactionLimits = async (operation) => {
  try {
    const params = new URLSearchParams();
    if (operation) {
      params.append('operation', String(operation).trim().toLowerCase());
    }

    const url = params.toString()
      ? `${TRANSACTION_ENDPOINTS.limits}?${params.toString()}`
      : TRANSACTION_ENDPOINTS.limits;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction limits:', error);

    const errorMessage = error.response?.data?.message || 'Failed to fetch transaction limits';
    const errorData = {
      success: false,
      message: errorMessage,
      data: null
    };

    if (error.response?.data?.success === false) {
      throw error;
    } else {
      const formattedError = new Error(errorMessage);
      formattedError.response = { data: errorData };
      throw formattedError;
    }
  }
};

export const resolveRecipientAccount = async (accountNumber) => {
  const normalizedAccountNumber = String(accountNumber || '').trim();

  try {
    const response = await api.get('/transactions/recipient', {
      params: { accountNumber: normalizedAccountNumber },
    });

    const responseData = response?.data || {};
    const data = responseData?.data || {};
    const accountName = data?.name || data?.accountName || responseData?.name || responseData?.accountName;

    if (!responseData?.success || !accountName) {
      return {
        success: false,
        message: responseData?.message || 'Unable to resolve recipient account',
        status: response?.status,
        error: responseData,
      };
    }

    return {
      success: true,
      message: responseData?.message || 'Recipient found',
      data: {
        ...data,
        accountName,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Unable to resolve recipient account',
      status: error.response?.status,
      error: error.response?.data,
    };
  }
};

/**
 * Get transaction history for current user with advanced filtering and pagination
 */
export const getTransactionHistory = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      type,
      search,
      searchBy = 'recipient',
      minAmount,
      maxAmount
    } = options;

    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });

    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (type && type !== 'all') params.append('type', type);
    if (search) {
      params.append('search', search);
      params.append('searchBy', searchBy);
    }
    if (minAmount) params.append('minAmount', minAmount.toString());
    if (maxAmount) params.append('maxAmount', maxAmount.toString());

    const response = await api.get(`${TRANSACTION_ENDPOINTS.history}?${params.toString()}`);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    
    const errorMessage = error.response?.data?.message || 'Failed to fetch transaction history';
    const errorData = {
      success: false,
      message: errorMessage,
      data: {
        transactions: [],
        pagination: {
          currentPage: 1,
          totalPages: 0,
          totalTransactions: 0,
          hasNextPage: false,
          hasPrevPage: false,
          limit: 10
        }
      }
    };
    
    if (error.response?.data?.success === false) {
      throw error;
    } else {
      const formattedError = new Error(errorMessage);
      formattedError.response = { data: errorData };
      throw formattedError;
    }
  }
};

/**
 * Get transaction summary and analytics
 */
export const getTransactionSummary = async (options = {}) => {
  try {
    const {
      period = 'month',
      startDate,
      endDate
    } = options;

    const params = new URLSearchParams({ period });
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`${TRANSACTION_ENDPOINTS.summary}?${params.toString()}`);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction summary:', error);
    
    const errorMessage = error.response?.data?.message || 'Failed to fetch transaction summary';
    const errorData = {
      success: false,
      message: errorMessage,
      data: null
    };
    
    if (error.response?.data?.success === false) {
      throw error;
    } else {
      const formattedError = new Error(errorMessage);
      formattedError.response = { data: errorData };
      throw formattedError;
    }
  }
};

/**
 * Transfer funds to another account
 */
export const transferFunds = async ({ receiverAccountNumber, amount, description, transactionPin }) => {
  try {
    const transferData = {
      receiverAccountNumber: receiverAccountNumber.toString().trim(),
      amount: parseFloat(amount),
      transactionPin: String(transactionPin || '').trim()
    };

    // Optional note, stored with the transaction and shown in history
    if (description) {
      transferData.description = description;
    }

    const response = await api.post(TRANSACTION_ENDPOINTS.transfer, transferData);
    
    return response.data;
  } catch (error) {
    console.error('Error transferring funds:', error);
    
    const errorMessage = error.response?.data?.message || 'Transfer failed';
    const errorData = {
      success: false,
      message: errorMessage,
      data: null
    };
    
    if (error.response?.data?.success === false) {
      throw error;
    } else {
      const formattedError = new Error(errorMessage);
      formattedError.response = { data: errorData };
      throw formattedError;
    }
  }
};

/**
 * Deposit funds to account
 */
export const depositFunds = async (amount, transactionPin) => {
  try {
    const depositData = {
      amount: parseFloat(amount),
      transactionPin: String(transactionPin || '').trim()
    };

    const response = await api.post(TRANSACTION_ENDPOINTS.deposit, depositData);
    
    return response.data;
  } catch (error) {
    console.error('Error depositing funds:', error);
    
    const errorMessage = error.response?.data?.message || 'Deposit failed';
    const errorData = {
      success: false,
      message: errorMessage,
      data: null
    };
    
    if (error.response?.data?.success === false) {
      throw error;
    } else {
      const formattedError = new Error(errorMessage);
      formattedError.response = { data: errorData };
      throw formattedError;
    }
  }
};

/**
 * Withdraw funds from account
 */
export const withdrawFunds = async (amount, transactionPin) => {
  try {
    const withdrawData = {
      amount: parseFloat(amount),
      transactionPin: String(transactionPin || '').trim()
    };

    const response = await api.post(TRANSACTION_ENDPOINTS.withdraw, withdrawData);
    
    return response.data;
  } catch (error) {
    console.error('Error withdrawing funds:', error);
    
    const errorMessage = error.response?.data?.message || 'Withdrawal failed';
    const errorData = {
      success: false,
      message: errorMessage,
      data: null
    };
    
    if (error.response?.data?.success === false) {
      throw error;
    } else {
      const formattedError = new Error(errorMessage);
      formattedError.response = { data: errorData };
      throw formattedError;
    }
  }
};

/**
 * Get transaction by ID
 */
export const getTransactionById = async (transactionId) => {
  try {
    const endpoint = TRANSACTION_ENDPOINTS.getById.replace(':transactionId', transactionId);
    const response = await api.get(endpoint);
    
    return response.data;
  } catch (error) {
    console.error('Error fetching transaction by ID:', error);
    
    const errorMessage = error.response?.data?.message || 'Failed to fetch transaction details';
    const errorData = {
      success: false,
      message: errorMessage,
      data: null
    };
    
    if (error.response?.data?.success === false) {
      throw error;
    } else {
      const formattedError = new Error(errorMessage);
      formattedError.response = { data: errorData };
      throw formattedError;
    }
  }
};

// Mirrors Banknode/validators/validation.rules.js's MAX_TRANSACTION_AMOUNT. This didn't exist
// on either side until a real deposit through this form produced a multi-quintillion-naira
// balance (nothing here, or on the backend, had ever capped the top end - only the minimum).
// Checking it here too just means the mistake gets caught before a round trip to the server.
const MAX_TRANSACTION_AMOUNT = 50000000;

/**
 * Validate transaction amount (matches backend validation)
 */
export const validateTransactionAmount = (amount) => {
  if (!amount) {
    return 'Amount is required';
  }

  const numAmount = parseFloat(amount);

  if (!Number.isFinite(numAmount)) {
    return 'Amount must be a valid number';
  }

  if (numAmount < 0.01) {
    return 'Amount must be greater than 0.01'; // Match backend minimum
  }

  if (numAmount > MAX_TRANSACTION_AMOUNT) {
    return `Amount cannot exceed ${MAX_TRANSACTION_AMOUNT.toLocaleString()}`; // Match backend maximum
  }

  return null;
};

/**
 * Validate account number for transfer (matches backend validation)  
 */
export const validateAccountNumber = (accountNumber) => {
  if (!accountNumber) {
    return 'Account number is required';
  }
  
  const cleanAccountNumber = accountNumber.toString().trim();
  
  if (cleanAccountNumber.length !== 10) {
    return 'Account number must be exactly 10 digits';
  }
  
  if (!/^\d{10}$/.test(cleanAccountNumber)) {
    return 'Account number must contain only digits'; // Match backend validation
  }
  
  return null;
};
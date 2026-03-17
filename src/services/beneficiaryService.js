import api from '../config/api';

// Get all beneficiaries for the current user
export const getBeneficiaries = async () => {
  try {
    const response = await api.get('/beneficiaries');
    
    // Return the full response structure that includes success, data, message
    return response.data;
  } catch (error) {
    console.error('Error fetching beneficiaries:', error);
    
    // Re-throw with proper error structure
    const errorMessage = error.response?.data?.message || 'Failed to fetch beneficiaries';
    const errorData = {
      success: false,
      message: errorMessage,
      data: null
    };
    
    // If server returned structured error, use it, otherwise format it
    if (error.response?.data?.success === false) {
      throw error;
    } else {
      const formattedError = new Error(errorMessage);
      formattedError.response = { data: errorData };
      throw formattedError;
    }
  }
};

// Add a new beneficiary by account number
export const createBeneficiary = async (accountNumber) => {
  try {
    const response = await api.post('/beneficiaries/add', { 
      accountNumber: accountNumber.toString().trim() 
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating beneficiary:', error);
    
    const errorMessage = error.response?.data?.message || 'Failed to add beneficiary';
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

// Remove a beneficiary by ID
export const removeBeneficiary = async (beneficiaryId) => {
  try {
    const response = await api.delete(`/beneficiaries/${beneficiaryId}`);
    
    return response.data;
  } catch (error) {
    console.error('Error removing beneficiary:', error);
    
    const errorMessage = error.response?.data?.message || 'Failed to remove beneficiary';
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

// Transfer money to a beneficiary
export const transferToBeneficiary = async ({ receiverAccountNumber, amount, description, transactionPin }) => {
  try {
    const transferData = {
      receiverAccountNumber: receiverAccountNumber.toString().trim(),
      amount: parseFloat(amount),
      description: description || '',
      transactionPin: String(transactionPin || '').trim(),
    };

    const response = await api.post('/transactions/transfer', transferData);
    
    return response.data;
  } catch (error) {
    console.error('Error transferring to beneficiary:', error);
    
    const errorMessage = error.response?.data?.message || 'Failed to transfer money';
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

// Validate account number format (utility function)
export const validateAccountNumber = (accountNumber) => {
  if (!accountNumber) {
    return 'Account number is required';
  }
  
  const cleanAccountNumber = accountNumber.toString().trim();
  
  if (!/^\d{10}$/.test(cleanAccountNumber)) {
    return 'Account number must be exactly 10 digits';
  }
  
  return null;
};

import api from '../config/api';

/**
 * Fetch the user's premium account status from the backend.
 * The backend calculates this from live transaction, savings,
 * investment and beneficiary data.
 * @returns {Promise<{ isPremium: boolean, qualifications: Object, metrics: Object }>}
 */
export const getPremiumStatus = async () => {
  try {
    const response = await api.get('/users/premium-status');
    if (response.data?.success) {
      return {
        isPremium: response.data.data.isPremium ?? false,
        qualifications: response.data.data.qualifications ?? {},
        metrics: response.data.data.metrics ?? {},
        thresholds: response.data.data.thresholds ?? {}
      };
    }
    return { isPremium: false, qualifications: {}, metrics: {} };
  } catch {
    return { isPremium: false, qualifications: {}, metrics: {} };
  }
};

export default getPremiumStatus;

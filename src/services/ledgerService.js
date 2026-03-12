import api from '../config/api';

const LEDGER_ENDPOINTS = {
  history: '/ledger/history',
  statement: '/ledger/statement',
};

const ALLOWED_ACCOUNT_TYPES = ['user_main', 'user_savings'];
const ALLOWED_REFERENCE_TYPES = ['transaction', 'savings_transaction', 'investment_trade'];

const appendIfPresent = (params, key, value) => {
  if (value === undefined || value === null) return;

  const normalized = String(value).trim();
  if (!normalized) return;

  params.append(key, normalized);
};

export const getLedgerHistory = async (options = {}) => {
  try {
    const {
      accountType,
      referenceType,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = options;

    const params = new URLSearchParams();

    const parsedPage = Number.isFinite(Number(page)) ? Math.max(Number(page), 1) : 1;
    const parsedLimit = Number.isFinite(Number(limit))
      ? Math.min(Math.max(Number(limit), 1), 100)
      : 20;

    params.append('page', String(parsedPage));
    params.append('limit', String(parsedLimit));

    if (ALLOWED_ACCOUNT_TYPES.includes(accountType)) {
      params.append('accountType', accountType);
    }

    if (ALLOWED_REFERENCE_TYPES.includes(referenceType)) {
      params.append('referenceType', referenceType);
    }

    appendIfPresent(params, 'startDate', startDate);
    appendIfPresent(params, 'endDate', endDate);

    const response = await api.get(`${LEDGER_ENDPOINTS.history}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch ledger history:', error);
    throw error;
  }
};

export const getAccountStatement = async (options = {}) => {
  try {
    const { accountType, startDate, endDate } = options;
    const params = new URLSearchParams();

    if (ALLOWED_ACCOUNT_TYPES.includes(accountType)) {
      params.append('accountType', accountType);
    }

    appendIfPresent(params, 'startDate', startDate);
    appendIfPresent(params, 'endDate', endDate);

    const query = params.toString();
    const url = query ? `${LEDGER_ENDPOINTS.statement}?${query}` : LEDGER_ENDPOINTS.statement;

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch account statement:', error);
    throw error;
  }
};

export default {
  getLedgerHistory,
  getAccountStatement,
};

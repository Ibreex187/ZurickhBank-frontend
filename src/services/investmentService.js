import api from '../config/api';

// Stock trading endpoints based on backend API structure
const INVESTMENT_ENDPOINTS = {
  stocks: '/investments/stocks',
  stockDetail: '/investments/stocks/:symbol', 
  buy: '/investments/buy',
  sell: '/investments/sell',
  portfolio: '/investments/portfolio',
  history: '/investments/history',
};

/**
 * Makes API requests directly to the correct endpoints
 */
const makeRequest = async (method, endpoint, payload, options = {}) => {
  const { pathParams } = options;
  let resolvedEndpoint = endpoint;
  
  // Replace path parameters
  if (pathParams) {
    for (const [key, value] of Object.entries(pathParams)) {
      resolvedEndpoint = resolvedEndpoint.replace(`:${key}`, value);
    }
  }

  if (method === 'get') {
    return await api.get(resolvedEndpoint);
  }
  return await api[method](resolvedEndpoint, payload);
};

/**
 * Normalize stock data from backend format for display as investment plans
 */
// Illustrative risk profile per symbol. The simulated market has no real risk data,
// so these labels are fixed and only meant to help browse the demo stocks.
const STOCK_CATEGORIES = {
  MSFT: 'conservative',
  AAPL: 'balanced',
  GOOGL: 'balanced',
  AMZN: 'balanced',
  META: 'balanced',
  NFLX: 'aggressive',
  NVDA: 'aggressive',
  TSLA: 'aggressive'
};

const RISK_BY_CATEGORY = {
  conservative: 'Low',
  balanced: 'Medium',
  aggressive: 'High'
};

const normalizeStocksAsPlans = (stocks = []) => {
  return stocks.map((stock, index) => {
    const category = STOCK_CATEGORIES[stock.symbol || stock.stockSymbol] || 'balanced';

    return {
    id: stock.symbol || stock.stockSymbol || index + 1,
    symbol: stock.symbol || stock.stockSymbol,
    name: stock.name || stock.companyName || `${stock.symbol} Stock`,
    description: stock.description || `Invest in ${stock.name || stock.symbol} stocks with simulated price fluctuations`,
    currentPrice: Number(stock.currentPrice || stock.price || 0),
    basePrice: Number(stock.basePrice || stock.currentPrice || stock.price || 0),
    priceChange: Number(stock.priceChange || 0),
    priceChangePercent: Number(stock.priceChangePercent || 0),
    minAmount: Number(stock.currentPrice || 100), // Minimum 1 share
    maxAmount: 1000000, // Reasonable max for demo
    duration: 'Simulated Trading',
    risk: RISK_BY_CATEGORY[category],
    features: [
      'Simulated price updates',
      'Buy/Sell flexibility',
      'Portfolio tracking',
      'Profit/Loss calculations'
    ],
    category,
    isStock: true
    };
  });
};

/**
 * Normalize portfolio data from backend
 */
const normalizePortfolioAsInvestments = (portfolio = []) => {
  return portfolio.map((investment, index) => ({
    _id: investment._id || investment.id || index + 1,
    planName: investment.stockName || investment.stockSymbol || 'Stock Investment',
    symbol: investment.stockSymbol || investment.symbol,
    amount: Number(investment.totalPaid || investment.totalInvested || 0),
    currentValue: Number(investment.currentValue || 0),
    quantity: Number(investment.quantity || 0),
    averagePrice: Number(investment.averagePrice || 0),
    currentPrice: Number(investment.currentPrice || 0),
    profitLoss: Number(investment.profitLoss || 0),
    profitLossPercent: Number(investment.profitLossPercent || 0),
    startDate: investment.createdAt || new Date().toISOString(),
    status: 'active',
    interestRate: investment.profitLossPercent || 0,
    maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
    duration: 'Ongoing'
  }));
};

const extractFirstArray = (...candidates) => {
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }
  return [];
};

// Service functions for stock trading
export const getAvailableStocks = async () => {
  try {
    const response = await makeRequest('get', INVESTMENT_ENDPOINTS.stocks);
    const responseData = response?.data;
    
    const stocksData = Array.isArray(responseData?.data)
      ? responseData.data
      : Array.isArray(responseData)
        ? responseData
        : [];

    return {
      success: true,
      data: normalizeStocksAsPlans(stocksData)
    };
  } catch (error) {
    console.error('Failed to fetch available stocks:', error);
    throw error;
  }
};

export const getStockPortfolio = async (forceFresh = false) => {
  try {
    let endpoint = INVESTMENT_ENDPOINTS.portfolio;
    
    // Add cache-busting parameter if force refresh requested
    if (forceFresh) {
      endpoint += `?_t=${Date.now()}`;
    }
    
    const response = await makeRequest('get', endpoint);
    const responseData = response?.data;

    const portfolioData = extractFirstArray(
      responseData?.data,
      responseData?.data?.portfolio,
      responseData?.data?.investments,
      responseData?.portfolio,
      responseData?.investments,
      responseData
    );


    return {
      success: true,
      data: normalizePortfolioAsInvestments(portfolioData)
    };
  } catch (error) {
    console.error('Failed to fetch stock portfolio:', error);
    throw error;
  }
};

export const buyStock = async (stockData) => {
  try {
    // Ensure correct data format for backend validation
    const payload = {
      stockSymbol: stockData.stockSymbol,
      quantity: Number(stockData.quantity)
    };
    
    
    const response = await makeRequest('post', INVESTMENT_ENDPOINTS.buy, payload);
    return response?.data || { success: true, message: 'Stock purchased successfully!' };
  } catch (error) {
    console.error('Failed to buy stock:', error.response?.data || error.message);
    throw error;
  }
};

export const sellStock = async (stockData) => {
  try {
    // Ensure correct data format for backend validation
    const payload = {
      stockSymbol: stockData.stockSymbol,
      quantity: Number(stockData.quantity)
    };
    
    
    const response = await makeRequest('post', INVESTMENT_ENDPOINTS.sell, payload);
    return response?.data || { success: true, message: 'Stock sold successfully!' };
  } catch (error) {
    console.error('Failed to sell stock:', error.response?.data || error.message);
    throw error;
  }
};

export const getStockDetails = async (symbol) => {
  try {
    const response = await makeRequest('get', INVESTMENT_ENDPOINTS.stockDetail, null, {
      pathParams: { symbol }
    });
    
    const stockData = response?.data?.data || response?.data || {};
    
    return {
      success: true,
      data: normalizeStocksAsPlans([stockData])[0]
    };
  } catch (error) {
    console.error('Failed to fetch stock details:', error);
    throw error;
  }
};

export const getInvestmentHistory = async () => {
  try {
    const response = await makeRequest('get', INVESTMENT_ENDPOINTS.history);
    const responseData = response?.data;
    
    const historyData = Array.isArray(responseData?.data)
      ? responseData.data
      : Array.isArray(responseData)
        ? responseData
        : [];

    return {
      success: true,
      data: historyData
    };
  } catch (error) {
    console.error('Failed to fetch investment history:', error);
    throw error;
  }
};

// Legacy aliases for backward compatibility
export const getInvestmentPlans = getAvailableStocks;
export const getMyInvestments = getStockPortfolio;
export const createInvestment = buyStock;

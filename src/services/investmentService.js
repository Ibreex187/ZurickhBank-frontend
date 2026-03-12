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
const normalizeStocksAsPlans = (stocks = []) => {
  return stocks.map((stock, index) => ({
    id: stock.symbol || stock.stockSymbol || index + 1,
    symbol: stock.symbol || stock.stockSymbol,
    name: stock.name || stock.companyName || `${stock.symbol} Stock`,
    description: stock.description || `Invest in ${stock.name || stock.symbol} stocks with real-time price fluctuations`,
    currentPrice: Number(stock.currentPrice || stock.price || 0),
    basePrice: Number(stock.basePrice || stock.currentPrice || stock.price || 0),
    priceChange: Number(stock.priceChange || 0),
    priceChangePercent: Number(stock.priceChangePercent || 0),
    minAmount: Number(stock.currentPrice || 100), // Minimum 1 share
    maxAmount: 1000000, // Reasonable max for demo
    duration: 'Real-time Trading',
    risk: stock.symbol?.includes('TSLA') ? 'High' : stock.symbol?.includes('AAPL') ? 'Medium' : 'Low',
    features: [
      'Real-time price updates',
      'Buy/Sell flexibility',
      'Portfolio tracking',
      'Profit/Loss calculations'
    ],
    category: stock.symbol?.includes('TSLA') || stock.symbol?.includes('NVDA') ? 'aggressive' : 
             stock.symbol?.includes('AAPL') || stock.symbol?.includes('MSFT') ? 'balanced' : 'conservative',
    isStock: true
  }));
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
      console.log('Fetching fresh portfolio data...');
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

    console.log('Portfolio data received:', portfolioData.length, 'items');

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
    
    console.log('Buying stock with payload:', payload);
    
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
    
    console.log('Selling stock with payload:', payload);
    
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

// Sample stock data for fallback when backend is unavailable
export const getSampleStocks = () => [
  {
    id: 'AAPL',
    symbol: 'AAPL',
    name: 'Apple Inc.',
    description: 'Invest in Apple Inc. stocks with real-time price fluctuations',
    currentPrice: 150.00,
    basePrice: 150.00,
    priceChange: 2.50,
    priceChangePercent: 1.69,
    minAmount: 150,
    maxAmount: 1000000,
    duration: 'Real-time Trading',
    risk: 'Medium',
    features: ['Real-time price updates', 'Buy/Sell flexibility', 'Portfolio tracking', 'Dividend potential'],
    category: 'balanced',
    isStock: true
  },
  {
    id: 'GOOGL',
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    description: 'Invest in Google/Alphabet stocks with growth potential',
    currentPrice: 2800.00,
    basePrice: 2800.00,
    priceChange: -15.20,
    priceChangePercent: -0.54,
    minAmount: 2800,
    maxAmount: 1000000,
    duration: 'Real-time Trading',
    risk: 'Medium',
    features: ['Tech sector growth', 'Market leader', 'Innovation focus', 'Long-term potential'],
    category: 'balanced',
    isStock: true
  },
  {
    id: 'TSLA',
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    description: 'High volatility EV stock with growth potential',
    currentPrice: 200.00,
    basePrice: 200.00,
    priceChange: 8.75,
    priceChangePercent: 4.58,
    minAmount: 200,
    maxAmount: 1000000,
    duration: 'Real-time Trading',
    risk: 'High',
    features: ['EV market leader', 'High volatility', 'Innovation focus', 'Growth potential'],
    category: 'aggressive',
    isStock: true
  },
  {
    id: 'MSFT',
    symbol: 'MSFT',
    name: 'Microsoft Corp.',
    description: 'Stable tech investment with steady growth',
    currentPrice: 300.00,
    basePrice: 300.00,
    priceChange: 3.25,
    priceChangePercent: 1.10,
    minAmount: 300,
    maxAmount: 1000000,
    duration: 'Real-time Trading',
    risk: 'Low',
    features: ['Stable growth', 'Dividend stock', 'Cloud computing', 'Enterprise focus'],
    category: 'conservative',
    isStock: true
  }
];

export const getSamplePortfolio = () => [
  {
    _id: 1,
    planName: 'Apple Inc. (AAPL)',
    symbol: 'AAPL',
    amount: 1500.00,
    currentValue: 1575.00,
    quantity: 10,
    averagePrice: 150.00,
    currentPrice: 157.50,
    profitLoss: 75.00,
    profitLossPercent: 5.0,
    startDate: '2024-01-15T00:00:00.000Z',
    status: 'active',
    interestRate: 5.0,
    maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 'Ongoing'
  },
  {
    _id: 2,
    planName: 'Microsoft Corp. (MSFT)',
    symbol: 'MSFT',
    amount: 3000.00,
    currentValue: 3150.00,
    quantity: 10,
    averagePrice: 300.00,
    currentPrice: 315.00,
    profitLoss: 150.00,
    profitLossPercent: 5.0,
    startDate: '2024-02-01T00:00:00.000Z',
    status: 'active',
    interestRate: 5.0,
    maturityDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 'Ongoing'
  }
];

// Legacy sample data aliases
export const getSampleInvestmentPlans = getSampleStocks;
export const getSampleInvestments = getSamplePortfolio;
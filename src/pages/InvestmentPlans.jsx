import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import {
  getAvailableStocks,
  getStockPortfolio,
  getStockDetails,
  getInvestmentHistory,
  buyStock,
  sellStock
} from '../services/investmentService';
import {
  Container, Card, Form, Alert, Table, Row, Col,
  Modal, Badge
} from 'react-bootstrap';
import AppButton from '../components/AppButton';
import ZurichBrand from '../components/ZurichBrand';
import LoadingWatch from '../components/LoadingWatch';
import { renderSidebarNavLinks } from '../components/sidebarNavLinks';
import { getPremiumStatus } from '../utils/premiumStatus';

const InvestmentPlans = ({ styles }) => {
  const { user, logout, refreshUser } = useAuth();
  const isAdmin = user?.roles === 'admin' || user?.role === 'admin' || user?.isAdmin === true;
  const [investments, setInvestments] = useState([]);
  const [availableStocks, setAvailableStocks] = useState([]);
  const [stocksError, setStocksError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showStockDetailsModal, setShowStockDetailsModal] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedStockDetails, setSelectedStockDetails] = useState(null);
  const [stockDetailsLoading, setStockDetailsLoading] = useState(false);
  const [stockData, setStockData] = useState({
    quantity: '',
    action: 'buy'
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [investmentHistory, setInvestmentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState({ isPremium: false });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile off-canvas state
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && sidebarOpen) setSidebarOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > 768 && sidebarOpen) setSidebarOpen(false);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [sidebarOpen]);

  useEffect(() => {
    fetchAvailableStocks();
    fetchMyPortfolio();
    fetchInvestmentHistoryData();
    getPremiumStatus().then(setPremiumStatus);
  }, []);

  const filteredStocks = availableStocks.filter(stock =>
    selectedCategory === 'all' || stock.category === selectedCategory
  );

  const fetchAvailableStocks = async () => {
    setStocksError('');
    try {
      const response = await getAvailableStocks();
      if (response.success && response.data.length > 0) {
        setAvailableStocks(response.data);
        return;
      }
      setAvailableStocks([]);
    } catch (error) {
      console.error('Failed to fetch available stocks:', error);
      setAvailableStocks([]);
      setStocksError('We could not load the stock list right now. Please try again in a moment.');
    }
  };

  const fetchMyPortfolio = async (forceFresh = false) => {
    setLoading(true);
    try {
      // Add small delay if this is a refresh after transaction
      if (forceFresh) {
        console.log('Waiting 1 second for backend to process transaction...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      const response = await getStockPortfolio(forceFresh);
      const latestInvestments = Array.isArray(response?.data) ? response.data : [];
      console.log('Portfolio updated with', latestInvestments.length, 'investments');
      setInvestments(latestInvestments);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      setMessage({
        type: 'error',
        text: 'Failed to refresh portfolio. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestmentHistoryData = async () => {
    setHistoryLoading(true);
    try {
      const response = await getInvestmentHistory();
      if (response?.success) {
        setInvestmentHistory(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to fetch investment history:', error);
      setInvestmentHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openStockDetailsModal = async (stock) => {
    const stockSymbol = stock?.symbol;
    if (!stockSymbol) return;

    setShowStockDetailsModal(true);
    setStockDetailsLoading(true);
    setSelectedStockDetails(null);

    try {
      const response = await getStockDetails(stockSymbol);
      if (response?.success) {
        setSelectedStockDetails(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch stock details:', error);
      setSelectedStockDetails(stock);
    } finally {
      setStockDetailsLoading(false);
    }
  };

  const openBuyModal = (stock) => {
    setSelectedStock(stock);
    setStockData({ quantity: '', action: 'buy' });
    setShowBuyModal(true);
  };

  const openSellModal = (investment) => {
    setSelectedStock({
      ...investment,
      symbol: investment.symbol,
      currentPrice: investment.currentPrice,
      maxQuantity: investment.quantity
    });
    setStockData({ quantity: '', action: 'sell' });
    setShowSellModal(true);
  };

  const handleStockTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate input data
      const quantity = parseInt(stockData.quantity);
      const userBalance = user?.balance || 0;
      const totalCost = quantity * selectedStock.currentPrice;

      // Validation checks
      if (isNaN(quantity) || quantity <= 0) {
        setMessage({
          type: 'error',
          text: 'Please enter a valid quantity'
        });
        setLoading(false);
        return;
      }

      if (stockData.action === 'buy') {
        if (totalCost > userBalance) {
          setMessage({
            type: 'error',
            text: `Insufficient balance. Need ₦${totalCost.toLocaleString()}, Available: ₦${userBalance.toLocaleString()}`
          });
          setLoading(false);
          return;
        }

        const response = await buyStock({
          stockSymbol: selectedStock.symbol,
          quantity: quantity
        });

        if (response.success !== false) {
          console.log('Buy transaction successful, refreshing portfolio...');
          setMessage({
            type: 'success',
            text: response?.message || `Successfully bought ${quantity} shares of ${selectedStock.symbol}!`
          });
          setShowBuyModal(false);
          setStockData({ quantity: '', action: 'buy' });

          // Refresh portfolio and user data after successful transaction
          await Promise.all([
            fetchMyPortfolio(true), // Force fresh data
            refreshUser(),
            fetchInvestmentHistoryData()
          ]);
          console.log('Portfolio refresh completed after buy');
        }
      } else if (stockData.action === 'sell') {
        if (quantity > selectedStock.maxQuantity) {
          setMessage({
            type: 'error',
            text: `Cannot sell ${quantity} shares. You only own ${selectedStock.maxQuantity} shares.`
          });
          setLoading(false);
          return;
        }

        const response = await sellStock({
          stockSymbol: selectedStock.symbol,
          quantity: quantity
        });

        if (response.success !== false) {
          console.log('Sell transaction successful, refreshing portfolio...');
          setMessage({
            type: 'success',
            text: response?.message || `Successfully sold ${quantity} shares of ${selectedStock.symbol}!`
          });
          setShowSellModal(false);
          setStockData({ quantity: '', action: 'sell' });

          // Refresh portfolio and user data after successful transaction
          await Promise.all([
            fetchMyPortfolio(true), // Force fresh data
            refreshUser(),
            fetchInvestmentHistoryData()
          ]);
          console.log('Portfolio refresh completed after sell');
        }
      }
    } catch (error) {
      console.error('Stock transaction error:', error);
      const errorMessage = error.response?.data?.message ||
        error.message ||
        'Transaction failed. Please try again.';
      setMessage({
        type: 'error',
        text: errorMessage
      });
    }
    setLoading(false);
  };

  const getProfitColor = (profitLoss) => {
    if (profitLoss > 0) return 'text-success';
    if (profitLoss < 0) return 'text-danger';
    return 'text-muted';
  };

  const getPriceChangeColor = (change) => {
    if (change > 0) return 'text-success';
    if (change < 0) return 'text-danger';
    return 'text-muted';
  };

  const getRiskBadgeColor = (risk) => {
    switch (risk.toLowerCase()) {
      case 'very low': return 'success';
      case 'low': return 'info';
      case 'medium': return 'warning';
      case 'high': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <>
      {styles && <style>{styles}</style>}
      <div className="fintech-dashboard investment-plans">
        {/* Sidebar */}
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="brand">
              <ZurichBrand showText={!sidebarCollapsed} className="sidebar-brand" />
            </div>
            <button
              className="collapse-btn"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3,6V8H21V6H3M3,11H21V13H3V11M3,16H21V18H3V16Z" />
              </svg>
            </button>
          </div>

          <nav className="sidebar-nav">
            <ul>
              {renderSidebarNavLinks({
                pathname: location.pathname,
                sidebarCollapsed,
                onNavClick: () => setSidebarOpen(false),
                isAdmin,
              })}
            </ul>

            <div className="sidebar-footer">
              <button onClick={logout} className="logout-btn">
                <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16,17V14H9V10H16V7L21,12L16,17M14,2A2,2 0 0,1 16,4V6H14V4H5V20H14V18H16V20A2,2 0 0,1 14,22H5A2,2 0 0,1 3,20V4A2,2 0 0,1 5,2H14Z" />
                </svg>
                {!sidebarCollapsed && <span>Logout</span>}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile overlay */}
        <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          {/* Header */}
          <header className="main-header">
            <div className="header-left">
              <button
                className="mobile-menu-btn"
                aria-label="Toggle menu"
                onClick={() => setSidebarOpen(prev => !prev)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
                </svg>
              </button>
              <div>
                <h1 className="page-title">Investments</h1>
                <p className="page-subtitle">Manage your portfolio and wealth</p>
              </div>
            </div>
            <div className="header-right">
              <div className="user-profile">
                <div className="user-avatar">
                  {(user?.firstName?.[0] || user?.userName?.[0] || 'U').toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.firstName} {user?.lastName}</span>
                  <span className={`user-role ${premiumStatus.isPremium ? 'premium' : 'standard'}`}>
                    {premiumStatus.isPremium ? 'Premium Account' : 'Standard Account'}
                  </span>
                </div>
              </div>
            </div>
          </header>

          <Container fluid className="px-lg-4 py-4">
            {/* Header Section */}
            <Row className="mb-4">
              <Col>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h2 className="mb-1">Stock Trading & Investments</h2>
                    <p className="text-muted mb-0">
                      Practice trading with simulated stocks. Prices are randomly generated for demonstration
                      and are not real market data.
                    </p>
                  </div>
                </div>
              </Col>
            </Row>

            {message.text && (
              <Alert
                variant={message.type === 'success' ? 'success' : 'danger'}
                className="mb-4"
                onClose={() => setMessage({ type: '', text: '' })}
                dismissible
              >
                {message.text}
              </Alert>
            )}

            {/* Portfolio Summary */}
            <Row className="g-4 mb-4">
              <Col md={3}>
                <Card className="border-0 shadow-sm premium-stat-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="mb-0">Total Invested</h6>
                        <h3 className="mb-0">₦{investments.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}</h3>
                      </div>
                      <div className="align-self-center">
                        <i className="fas fa-chart-line fa-2x opacity-75"></i>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="border-0 shadow-sm premium-stat-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="mb-0">Current Value</h6>
                        <h3 className="mb-0">₦{investments.reduce((sum, inv) => sum + inv.currentValue, 0).toLocaleString()}</h3>
                      </div>
                      <div className="align-self-center">
                        <i className="fas fa-arrow-trend-up fa-2x opacity-75"></i>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="border-0 shadow-sm premium-stat-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="mb-0">Total Returns</h6>
                        <h3 className="mb-0">₦{investments.reduce((sum, inv) => sum + (inv.currentValue - inv.amount), 0).toLocaleString()}</h3>
                      </div>
                      <div className="align-self-center">
                        <i className="fas fa-coins fa-2x opacity-75"></i>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={3}>
                <Card className="border-0 shadow-sm premium-stat-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="mb-0">Active Plans</h6>
                        <h3 className="mb-0">{investments.filter(inv => inv.status === 'active').length}</h3>
                      </div>
                      <div className="align-self-center">
                        <i className="fas fa-briefcase fa-2x opacity-75"></i>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* My Investments */}
            {investments.length > 0 && (
              <Card className="shadow-sm mb-4">
                <Card.Header className="bg-white border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">My Stock Portfolio</h5>
                    <AppButton
                      size="sm"
                      backgroundColor="transparent"
                      textColor="#151e31"
                      borderColor="#151e31"
                      onClick={() => fetchMyPortfolio(true)}
                      loading={loading}
                      loadingText="Refreshing..."
                    >
                      <>
                        <i className="fas fa-sync-alt me-1"></i>
                        Refresh
                      </>
                    </AppButton>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Stock</th>
                          <th>Quantity</th>
                          <th>Avg Price</th>
                          <th>Current Price</th>
                          <th>Total Value</th>
                          <th>P&L</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {investments.map((investment) => (
                          <tr key={investment._id}>
                            <td className="investment-text-cell">
                              <strong>{investment.planName}</strong>
                              <br />
                              <small className="text-muted">{investment.symbol}</small>
                            </td>
                            <td className="investment-amount-cell">{(investment.quantity || 0).toLocaleString()}</td>
                            <td className="investment-amount-cell">₦{(investment.averagePrice || 0).toLocaleString()}</td>
                            <td className="investment-amount-cell">₦{(investment.currentPrice || 0).toLocaleString()}</td>
                            <td className="investment-amount-cell">
                              <span className="fw-bold investment-amount-cell">
                                ₦{(investment.currentValue || 0).toLocaleString()}
                              </span>
                            </td>
                            <td className="investment-amount-cell">
                              <span className={`fw-bold investment-amount-cell ${getProfitColor(investment.profitLoss)}`}>
                                ₦{(investment.profitLoss || 0).toLocaleString()}
                                {investment.profitLossPercent && (
                                  <small className="d-block">
                                    ({investment.profitLossPercent > 0 ? '+' : ''}{investment.profitLossPercent.toFixed(2)}%)
                                  </small>
                                )}
                              </span>
                            </td>
                            <td>
                              <AppButton
                                size="sm"
                                backgroundColor="transparent"
                                textColor="#151e31"
                                borderColor="#151e31"
                                className="me-2"
                                onClick={() => openStockDetailsModal({ symbol: investment.symbol })}
                              >
                                Details
                              </AppButton>
                              <AppButton
                                size="sm"
                                backgroundColor="transparent"
                                textColor="#dc3545"
                                borderColor="#dc3545"
                                onClick={() => openSellModal(investment)}
                                disabled={!investment.quantity || investment.quantity === 0}
                              >
                                Sell
                              </AppButton>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Available Investment Plans */}
            <Row className="mb-3">
              <Col md={6}>
                <h4 className="mb-3">Available Stocks</h4>
              </Col>
              <Col md={6}>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-auto ms-auto"
                >
                  <option value="all">All Categories</option>
                  <option value="conservative">Conservative (Low Risk)</option>
                  <option value="balanced">Balanced (Medium Risk)</option>
                  <option value="aggressive">Aggressive (High Risk)</option>
                </Form.Select>
              </Col>
            </Row>

            {loading && availableStocks.length === 0 ? (
              <LoadingWatch label="Loading available stocks..." minHeight="180px" />
            ) : (
              <Row className="g-4">
                {filteredStocks.length > 0 ? (
                  filteredStocks.map((stock) => (
                    <Col lg={4} md={6} key={stock.id}>
                      <Card className={`h-100 shadow-sm investment-plan-card ${stock.category}`}>
                        <Card.Header>
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">{stock.name}</h5>
                            <Badge bg={getRiskBadgeColor(stock.risk)} className="text-dark">
                              {stock.risk} Risk
                            </Badge>
                          </div>
                          <small>{stock.symbol}</small>
                        </Card.Header>
                        <Card.Body className="d-flex flex-column">
                          <p className="text-muted mb-3">{stock.description}</p>

                          <div className="text-center mb-3">
                            <h2 className="text-primary mb-1">₦{stock.currentPrice.toLocaleString()}</h2>
                            <small className="text-muted">Current Price per Share</small>
                            {stock.priceChange !== undefined && (
                              <div className={`mt-1 ${getPriceChangeColor(stock.priceChange)}`}>
                                <small>
                                  {stock.priceChange > 0 ? '+' : ''}₦{stock.priceChange.toFixed(2)}
                                  ({stock.priceChangePercent > 0 ? '+' : ''}{stock.priceChangePercent.toFixed(2)}%)
                                </small>
                              </div>
                            )}
                          </div>

                          <div className="mb-3 flex-grow-1">
                            <ul className="list-unstyled">
                              {stock.features.map((feature, index) => (
                                <li key={index} className="mb-2">
                                  <i className="fas fa-check text-success me-2"></i>
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="border-top pt-3 mb-3">
                            <div className="row">
                              <div className="col-6">
                                <small className="text-muted">Min Investment</small>
                                <p className="mb-0 fw-bold">₦{stock.currentPrice.toLocaleString()}</p>
                                <small className="text-muted">(1 share)</small>
                              </div>
                              <div className="col-6">
                                <small className="text-muted">Trading</small>
                                <p className="mb-0 fw-bold">{stock.duration}</p>
                              </div>
                            </div>
                          </div>

                          <AppButton
                            backgroundColor="#151e31"
                            className="mb-2"
                            fullWidth
                            onClick={() => openBuyModal(stock)}
                          >
                            Buy Stock
                          </AppButton>
                          <AppButton
                            backgroundColor="transparent"
                            textColor="#151e31"
                            borderColor="#151e31"
                            fullWidth
                            onClick={() => openStockDetailsModal(stock)}
                          >
                            View Details
                          </AppButton>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <Col>
                    <div className="text-center py-5">
                      <i className="fas fa-search fa-3x text-muted mb-3"></i>
                      <h5 className="text-muted">{stocksError ? 'Stocks unavailable' : 'No stocks found'}</h5>
                      <p className="text-muted">
                        {stocksError || 'Try selecting a different category or check back later.'}
                      </p>
                      {stocksError && (
                        <AppButton
                          size="sm"
                          backgroundColor="transparent"
                          textColor="#151e31"
                          borderColor="#151e31"
                          onClick={fetchAvailableStocks}
                        >
                          Try again
                        </AppButton>
                      )}
                    </div>
                  </Col>
                )}
              </Row>
            )}

            <Card className="shadow-sm mt-4 mb-4">
              <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Investment History</h5>
                <AppButton
                  size="sm"
                  backgroundColor="transparent"
                  textColor="#151e31"
                  borderColor="#151e31"
                  onClick={fetchInvestmentHistoryData}
                  disabled={historyLoading}
                >
                  {historyLoading ? 'Refreshing...' : 'Refresh'}
                </AppButton>
              </Card.Header>
              <Card.Body className="p-0">
                {historyLoading ? (
                  <LoadingWatch label="Loading history..." minHeight="120px" />
                ) : investmentHistory.length === 0 ? (
                  <div className="text-center py-4 text-muted">No investment history yet</div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Stock</th>
                          <th>Quantity</th>
                          <th>Total Invested</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {investmentHistory.map((item) => (
                          <tr key={item._id}>
                            <td className="investment-text-cell">{new Date(item.purchaseDate || item.createdAt || Date.now()).toLocaleDateString()}</td>
                            <td className="investment-text-cell">{item.stockSymbol}</td>
                            <td className="investment-amount-cell">{Number(item.quantity || 0).toLocaleString()}</td>
                            <td className="investment-amount-cell">₦{Number(item.totalInvested || 0).toLocaleString()}</td>
                            <td>
                              <Badge bg={item.status === 'active' ? 'success' : 'secondary'}>
                                {item.status || 'unknown'}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>

            <Modal show={showStockDetailsModal} onHide={() => setShowStockDetailsModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Stock Details</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {stockDetailsLoading ? (
                  <LoadingWatch label="Loading stock details..." minHeight="100px" />
                ) : selectedStockDetails ? (
                  <>
                    <p><strong>Symbol:</strong> {selectedStockDetails.symbol}</p>
                    <p><strong>Name:</strong> {selectedStockDetails.name}</p>
                    <p><strong>Current Price:</strong> ₦{Number(selectedStockDetails.currentPrice || 0).toLocaleString()}</p>
                    <p><strong>Base Price:</strong> ₦{Number(selectedStockDetails.basePrice || 0).toLocaleString()}</p>
                    <p><strong>Risk:</strong> {selectedStockDetails.risk || 'N/A'}</p>
                    <p className="mb-0"><strong>Description:</strong> {selectedStockDetails.description || 'N/A'}</p>
                  </>
                ) : (
                  <div className="text-muted">No details available</div>
                )}
              </Modal.Body>
            </Modal>

            {/* Buy Stock Modal */}
            <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)} size="lg">
              <Modal.Header closeButton>
                <Modal.Title>Buy {selectedStock?.name} ({selectedStock?.symbol})</Modal.Title>
              </Modal.Header>
              <Form onSubmit={handleStockTransaction}>
                <Modal.Body>
                  {selectedStock && (
                    <>
                      <Card className="mb-4 bg-light">
                        <Card.Body>
                          <h6>Stock Details:</h6>
                          <Row>
                            <Col md={6}>
                              <p className="mb-1"><strong>Current Price:</strong> ₦{selectedStock.currentPrice?.toLocaleString()}</p>
                              <p className="mb-1"><strong>Stock Symbol:</strong> {selectedStock.symbol}</p>
                            </Col>
                            <Col md={6}>
                              <p className="mb-1"><strong>Risk Level:</strong> {selectedStock.risk}</p>
                              <p className="mb-1"><strong>Category:</strong> {selectedStock.category}</p>
                            </Col>
                          </Row>
                          {selectedStock.priceChange !== undefined && (
                            <div className={`mt-2 ${getPriceChangeColor(selectedStock.priceChange)}`}>
                              <small>
                                Today: {selectedStock.priceChange > 0 ? '+' : ''}₦{selectedStock.priceChange.toFixed(2)}
                                ({selectedStock.priceChangePercent > 0 ? '+' : ''}{selectedStock.priceChangePercent.toFixed(2)}%)
                              </small>
                            </div>
                          )}
                        </Card.Body>
                      </Card>

                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>Number of Shares *</Form.Label>
                            <Form.Control
                              type="number"
                              value={stockData.quantity}
                              onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
                              placeholder="Enter quantity"
                              required
                              min="1"
                              max="10000"
                            />
                            <Form.Text className="text-muted">
                              Min: 1 share | Available Balance: ₦{(user?.balance || 0).toLocaleString()}
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      {stockData.quantity && selectedStock.currentPrice && (
                        <Card className="bg-primary text-white">
                          <Card.Body>
                            <h6>Transaction Summary:</h6>
                            <p className="mb-1">
                              <strong>Shares: {stockData.quantity}</strong>
                            </p>
                            <p className="mb-1">
                              <strong>Price per Share: ₦{selectedStock.currentPrice.toLocaleString()}</strong>
                            </p>
                            <p className="mb-0">
                              <strong>Total Cost: ₦{(
                                parseInt(stockData.quantity) * selectedStock.currentPrice
                              ).toLocaleString()}</strong>
                            </p>
                          </Card.Body>
                        </Card>
                      )}
                    </>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <AppButton
                    backgroundColor="#6c757d"
                    onClick={() => setShowBuyModal(false)}
                  >
                    Cancel
                  </AppButton>
                  <AppButton
                    backgroundColor="#151e31"
                    type="submit"
                    disabled={loading || !stockData.quantity}
                  >
                    {loading ? 'Processing...' : 'Buy Shares'}
                  </AppButton>
                </Modal.Footer>
              </Form>
            </Modal>

            {/* Sell Stock Modal */}
            <Modal show={showSellModal} onHide={() => setShowSellModal(false)} size="lg">
              <Modal.Header closeButton>
                <Modal.Title>Sell {selectedStock?.symbol} Shares</Modal.Title>
              </Modal.Header>
              <Form onSubmit={handleStockTransaction}>
                <Modal.Body>
                  {selectedStock && (
                    <>
                      <Card className="mb-4 bg-light">
                        <Card.Body>
                          <h6>Portfolio Details:</h6>
                          <Row>
                            <Col md={6}>
                              <p className="mb-1"><strong>Shares Owned:</strong> {selectedStock.maxQuantity || 0}</p>
                              <p className="mb-1"><strong>Average Price:</strong> ₦{selectedStock.averagePrice?.toLocaleString() || 'N/A'}</p>
                            </Col>
                            <Col md={6}>
                              <p className="mb-1"><strong>Current Price:</strong> ₦{selectedStock.currentPrice?.toLocaleString()}</p>
                              <p className="mb-1"><strong>Total Value:</strong> ₦{((selectedStock.maxQuantity || 0) * (selectedStock.currentPrice || 0)).toLocaleString()}</p>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>

                      <Row>
                        <Col md={12}>
                          <Form.Group className="mb-3">
                            <Form.Label>Number of Shares to Sell *</Form.Label>
                            <Form.Control
                              type="number"
                              value={stockData.quantity}
                              onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
                              placeholder="Enter quantity"
                              required
                              min="1"
                              max={selectedStock.maxQuantity || 1}
                            />
                            <Form.Text className="text-muted">
                              Max: {selectedStock.maxQuantity || 0} shares available
                            </Form.Text>
                          </Form.Group>
                        </Col>
                      </Row>

                      {stockData.quantity && selectedStock.currentPrice && (
                        <Card className="bg-danger text-white">
                          <Card.Body>
                            <h6>Sale Summary:</h6>
                            <p className="mb-1">
                              <strong>Shares to Sell: {stockData.quantity}</strong>
                            </p>
                            <p className="mb-1">
                              <strong>Current Price: ₦{selectedStock.currentPrice.toLocaleString()}</strong>
                            </p>
                            <p className="mb-0">
                              <strong>Total Proceeds: ₦{(
                                parseInt(stockData.quantity) * selectedStock.currentPrice
                              ).toLocaleString()}</strong>
                            </p>
                          </Card.Body>
                        </Card>
                      )}
                    </>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <AppButton
                    backgroundColor="#6c757d"
                    onClick={() => setShowSellModal(false)}
                  >
                    Cancel
                  </AppButton>
                  <AppButton
                    backgroundColor="#dc3545"
                    type="submit"
                    disabled={loading || !stockData.quantity}
                  >
                    {loading ? 'Processing...' : 'Sell Shares'}
                  </AppButton>
                </Modal.Footer>
              </Form>
            </Modal>
          </Container>
        </div>
      </div>
    </>
  );
};

export default InvestmentPlans;

InvestmentPlans.propTypes = {
  styles: PropTypes.string,
};
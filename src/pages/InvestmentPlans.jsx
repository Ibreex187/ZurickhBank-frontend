import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
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
  Modal, Badge, Button, ListGroup
} from 'react-bootstrap';
import AppButton from '../components/AppButton';
import TransactionReceipt from '../components/TransactionReceipt';
import LoadingWatch from '../components/LoadingWatch';
import { ArrowRepeat, BriefcaseFill, CashCoin, CheckLg, GraphUp, GraphUpArrow, Search } from 'react-bootstrap-icons';
import { formatDate, formatMoney } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

const InvestmentPlans = ({ styles }) => {
  const { user, refreshUser } = useAuth();
  const { notify } = useToast();
  const [investments, setInvestments] = useState([]);
  const [availableStocks, setAvailableStocks] = useState([]);
  const [stocksError, setStocksError] = useState('');
  const [loading, setLoading] = useState(false);
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
  const [orderStep, setOrderStep] = useState('form'); // 'form' | 'review' | 'done'
  const [orderError, setOrderError] = useState('');
  const [orderReceipt, setOrderReceipt] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [investmentHistory, setInvestmentHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);


  useEffect(() => {
    fetchAvailableStocks();
    fetchMyPortfolio();
    fetchInvestmentHistoryData();
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
      const response = await getStockPortfolio(forceFresh);
      const latestInvestments = Array.isArray(response?.data) ? response.data : [];
      setInvestments(latestInvestments);
    } catch (error) {
      console.error('Failed to fetch portfolio:', error);
      notify({ variant: 'danger', text: 'Failed to refresh portfolio. Please try again.' });
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
    setOrderStep('form');
    setOrderError('');
    setOrderReceipt(null);
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
    setOrderStep('form');
    setOrderError('');
    setOrderReceipt(null);
    setShowSellModal(true);
  };

  const closeOrderModal = () => {
    setShowBuyModal(false);
    setShowSellModal(false);
    setOrderStep('form');
    setOrderError('');
    setOrderReceipt(null);
  };

  // Returns { quantity } when the order is valid, otherwise { error }
  const validateOrder = () => {
    const quantity = parseInt(stockData.quantity, 10);

    if (Number.isNaN(quantity) || quantity <= 0) {
      return { error: 'Please enter a valid quantity.' };
    }

    if (stockData.action === 'buy') {
      const estimatedCost = quantity * selectedStock.currentPrice;
      const userBalance = user?.balance || 0;

      if (estimatedCost > userBalance) {
        return {
          error: `Insufficient balance. Estimated cost is ${formatMoney(estimatedCost)} and you have ${formatMoney(userBalance)}.`,
        };
      }
    } else if (quantity > selectedStock.maxQuantity) {
      return { error: `Cannot sell ${quantity} shares. You only own ${selectedStock.maxQuantity}.` };
    }

    return { quantity };
  };

  // Step 1 -> 2: check the input, then show the order for review
  const handleOrderFormSubmit = (e) => {
    e.preventDefault();
    setOrderError('');

    const { error } = validateOrder();
    if (error) {
      setOrderError(error);
      return;
    }

    setOrderStep('review');
  };

  // Step 2 -> 3: place the order and show what actually happened
  const placeOrder = async () => {
    setOrderError('');

    const { quantity, error } = validateOrder();
    if (error) {
      setOrderError(error);
      return;
    }

    setLoading(true);
    try {
      const isBuy = stockData.action === 'buy';
      const payload = { stockSymbol: selectedStock.symbol, quantity };
      const response = isBuy ? await buyStock(payload) : await sellStock(payload);

      if (response.success === false) {
        throw new Error(response.message || 'The order could not be completed.');
      }

      const result = response.data || {};
      const pricePerShare = Number(result.pricePerShare);
      const total = Number(isBuy ? result.totalCost : result.totalSaleValue);
      const balanceAfter = Number(isBuy ? result.remainingBalance : result.newBalance);
      const profitLoss = Number(result.profitLoss);

      const details = [{ label: 'Shares', value: `${quantity} × ${selectedStock.symbol}` }];
      if (Number.isFinite(pricePerShare)) {
        details.push({ label: 'Price per share', value: formatMoney(pricePerShare) });
      }
      if (!isBuy && Number.isFinite(profitLoss)) {
        details.push({ label: 'Profit / loss', value: formatMoney(profitLoss) });
      }

      setOrderReceipt({
        title: isBuy ? 'Shares purchased' : 'Shares sold',
        amount: Number.isFinite(total) ? total : quantity * selectedStock.currentPrice,
        date: new Date(),
        transactionId: result.tradeReferenceId,
        newBalance: Number.isFinite(balanceAfter) ? balanceAfter : undefined,
        details,
      });
      setOrderStep('done');
      setStockData({ quantity: '', action: stockData.action });

      await Promise.all([
        fetchMyPortfolio(true),
        refreshUser(),
        fetchInvestmentHistoryData(),
      ]);
    } catch (orderFailure) {
      console.error('Stock order failed:', orderFailure);
      setOrderError(
        orderFailure.response?.data?.message || orderFailure.message || 'Order failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Review and receipt screens are shared by the buy and sell modals
  const renderOrderReviewOrReceipt = () => {
    if (orderStep === 'done' && orderReceipt) {
      return (
        <>
          <Modal.Body>
            <TransactionReceipt receipt={orderReceipt} />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="dark" onClick={closeOrderModal}>
              Done
            </Button>
          </Modal.Footer>
        </>
      );
    }

    const isBuy = stockData.action === 'buy';
    const quantity = parseInt(stockData.quantity, 10) || 0;
    const estimatedTotal = quantity * (selectedStock?.currentPrice || 0);

    return (
      <>
        <Modal.Body>
          {orderError && (
            <Alert variant="danger" className="py-2 small" role="alert">
              {orderError}
            </Alert>
          )}
          <p className="text-muted small mb-3">Review your order before placing it.</p>
          <ListGroup variant="flush" className="mb-3">
            <ListGroup.Item className="d-flex justify-content-between px-0">
              <span className="text-muted">{isBuy ? 'Buying' : 'Selling'}</span>
              <strong>{quantity} × {selectedStock?.symbol}</strong>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between px-0">
              <span className="text-muted">Estimated price per share</span>
              <span>{formatMoney(selectedStock?.currentPrice)}</span>
            </ListGroup.Item>
            <ListGroup.Item className="d-flex justify-content-between px-0">
              <span className="text-muted">{isBuy ? 'Estimated total cost' : 'Estimated proceeds'}</span>
              <strong>{formatMoney(estimatedTotal)}</strong>
            </ListGroup.Item>
          </ListGroup>
          <Alert variant="info" className="small py-2 mb-0">
            Prices are simulated and can move a few percent between this screen and the moment your order is
            placed. Your receipt shows the final price.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setOrderStep('form')} disabled={loading}>
            Back
          </Button>
          <AppButton
            backgroundColor={isBuy ? '#151e31' : '#dc3545'}
            onClick={placeOrder}
            loading={loading}
            loadingText="Placing order..."
          >
            {isBuy ? 'Place buy order' : 'Place sell order'}
          </AppButton>
        </Modal.Footer>
      </>
    );
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

        {/* Portfolio Summary */}
        <Row className="g-4 mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm premium-stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="mb-0">Total Invested</h6>
                    <h3 className="mb-0">{formatMoney(investments.reduce((sum, inv) => sum + inv.amount, 0))}</h3>
                  </div>
                  <div className="align-self-center">
                    <GraphUp size={32} className="opacity-75" />
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
                    <h3 className="mb-0">{formatMoney(investments.reduce((sum, inv) => sum + inv.currentValue, 0))}</h3>
                  </div>
                  <div className="align-self-center">
                    <GraphUpArrow size={32} className="opacity-75" />
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
                    <h3 className="mb-0">{formatMoney(investments.reduce((sum, inv) => sum + (inv.currentValue - inv.amount), 0))}</h3>
                  </div>
                  <div className="align-self-center">
                    <CashCoin size={32} className="opacity-75" />
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
                    <BriefcaseFill size={32} className="opacity-75" />
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
                    <ArrowRepeat size="1em" className="me-1" />
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
                        <td className="investment-amount-cell">{formatMoney((investment.averagePrice || 0))}</td>
                        <td className="investment-amount-cell">{formatMoney((investment.currentPrice || 0))}</td>
                        <td className="investment-amount-cell">
                          <span className="fw-bold investment-amount-cell">
                            {formatMoney((investment.currentValue || 0))}
                          </span>
                        </td>
                        <td className="investment-amount-cell">
                          <span className={`fw-bold investment-amount-cell ${getProfitColor(investment.profitLoss)}`}>
                            {formatMoney((investment.profitLoss || 0))}
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
                        <h2 className="text-primary mb-1">{formatMoney(stock.currentPrice)}</h2>
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
                              <CheckLg size="1em" className="text-success me-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-top pt-3 mb-3">
                        <div className="row">
                          <div className="col-6">
                            <small className="text-muted">Min Investment</small>
                            <p className="mb-0 fw-bold">{formatMoney(stock.currentPrice)}</p>
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
                  <Search size={48} className="text-muted mb-3" />
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
                        <td className="investment-text-cell">{formatDate(item.purchaseDate || item.createdAt || Date.now())}</td>
                        <td className="investment-text-cell">{item.stockSymbol}</td>
                        <td className="investment-amount-cell">{Number(item.quantity || 0).toLocaleString()}</td>
                        <td className="investment-amount-cell">{formatMoney(Number(item.totalInvested || 0))}</td>
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
                <p><strong>Current Price:</strong> {formatMoney(Number(selectedStockDetails.currentPrice || 0))}</p>
                <p><strong>Base Price:</strong> {formatMoney(Number(selectedStockDetails.basePrice || 0))}</p>
                <p><strong>Risk:</strong> {selectedStockDetails.risk || 'N/A'}</p>
                <p className="mb-0"><strong>Description:</strong> {selectedStockDetails.description || 'N/A'}</p>
              </>
            ) : (
              <div className="text-muted">No details available</div>
            )}
          </Modal.Body>
        </Modal>

        {/* Buy Stock Modal */}
        <Modal show={showBuyModal} onHide={closeOrderModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Buy {selectedStock?.name} ({selectedStock?.symbol})</Modal.Title>
          </Modal.Header>
          {orderStep !== 'form' ? renderOrderReviewOrReceipt() : (
          <Form onSubmit={handleOrderFormSubmit}>
            <Modal.Body>
              {orderError && (
                <Alert variant="danger" className="py-2 small" role="alert">
                  {orderError}
                </Alert>
              )}
              {selectedStock && (
                <>
                  <Card className="mb-4 bg-light">
                    <Card.Body>
                      <h6>Stock Details:</h6>
                      <Row>
                        <Col md={6}>
                          <p className="mb-1"><strong>Current Price:</strong> {formatMoney(selectedStock.currentPrice)}</p>
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
                          Min: 1 share | Available Balance: {formatMoney((user?.balance || 0))}
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
                          <strong>Price per Share: {formatMoney(selectedStock.currentPrice)}</strong>
                        </p>
                        <p className="mb-0">
                          <strong>Total Cost: {formatMoney((
                            parseInt(stockData.quantity) * selectedStock.currentPrice
                          ))}</strong>
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
                onClick={closeOrderModal}
              >
                Cancel
              </AppButton>
              <AppButton
                backgroundColor="#151e31"
                type="submit"
                disabled={loading || !stockData.quantity}
              >
                Review order
              </AppButton>
            </Modal.Footer>
          </Form>
          )}
        </Modal>

        {/* Sell Stock Modal */}
        <Modal show={showSellModal} onHide={closeOrderModal} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Sell {selectedStock?.symbol} Shares</Modal.Title>
          </Modal.Header>
          {orderStep !== 'form' ? renderOrderReviewOrReceipt() : (
          <Form onSubmit={handleOrderFormSubmit}>
            <Modal.Body>
              {orderError && (
                <Alert variant="danger" className="py-2 small" role="alert">
                  {orderError}
                </Alert>
              )}
              {selectedStock && (
                <>
                  <Card className="mb-4 bg-light">
                    <Card.Body>
                      <h6>Portfolio Details:</h6>
                      <Row>
                        <Col md={6}>
                          <p className="mb-1"><strong>Shares Owned:</strong> {selectedStock.maxQuantity || 0}</p>
                          <p className="mb-1"><strong>Average Price:</strong> {selectedStock.averagePrice != null ? formatMoney(selectedStock.averagePrice) : 'N/A'}</p>
                        </Col>
                        <Col md={6}>
                          <p className="mb-1"><strong>Current Price:</strong> {formatMoney(selectedStock.currentPrice)}</p>
                          <p className="mb-1"><strong>Total Value:</strong> {formatMoney(((selectedStock.maxQuantity || 0) * (selectedStock.currentPrice || 0)))}</p>
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
                          <strong>Current Price: {formatMoney(selectedStock.currentPrice)}</strong>
                        </p>
                        <p className="mb-0">
                          <strong>Total Proceeds: {formatMoney((
                            parseInt(stockData.quantity) * selectedStock.currentPrice
                          ))}</strong>
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
                onClick={closeOrderModal}
              >
                Cancel
              </AppButton>
              <AppButton
                backgroundColor="#dc3545"
                type="submit"
                disabled={loading || !stockData.quantity}
              >
                Review order
              </AppButton>
            </Modal.Footer>
          </Form>
          )}
        </Modal>
      </Container>
    </>
  );
};

export default InvestmentPlans;

InvestmentPlans.propTypes = {
  styles: PropTypes.string,
};
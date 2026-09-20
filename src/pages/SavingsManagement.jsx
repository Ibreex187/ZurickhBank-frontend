import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container, Card, Form, Button, Alert, Table, Row, Col,
  Modal, Badge
} from 'react-bootstrap';
import ZurichBrand from '../components/ZurichBrand';
import PasswordField from '../components/PasswordField';
import LoadingWatch from '../components/LoadingWatch';
import { renderSidebarNavLinks } from '../components/sidebarNavLinks';
import { getPremiumStatus } from '../utils/premiumStatus';
import { formatWithCommas, unformatCommas } from '../utils/formatAmount';
import {
  depositToSavings,
  withdrawFromSavings,
  quickTransfer,
  getSavingsOverview,
  getSavingsHistory,
  getSavingsInsights
} from '../services/savingsService';
import { getTransactionLimits } from '../services/transactionService';
import { ClockHistory, GraphUp, PiggyBankFill, Wallet2 } from 'react-bootstrap-icons';
import { formatDate, formatMoney, formatTime } from '../utils/formatters';
import LimitMeter from '../components/LimitMeter';


const SavingsManagement = ({ styles }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.roles === 'admin' || user?.role === 'admin' || user?.isAdmin === true;
  const hasTransactionPin = Boolean(user?.hasTransactionPin);

  // State for savings data
  const [savingsData, setSavingsData] = useState({
    balances: { mainBalance: 0, savingsBalance: 0, totalBalance: 0 },
    statistics: { totalDeposited: 0, totalWithdrawn: 0, netSavings: 0 },
    accountInfo: {}
  });
  const [transactions, setTransactions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [statsLastUpdated, setStatsLastUpdated] = useState(null);
  const [premiumStatus, setPremiumStatus] = useState({ isPremium: false });

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showQuickTransferModal, setShowQuickTransferModal] = useState(false);
  const [showPinGuardModal, setShowPinGuardModal] = useState(false);
  const [withdrawLimits, setWithdrawLimits] = useState(null);
  const [withdrawLimitsLoading, setWithdrawLimitsLoading] = useState(false);

  // Form data
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [quickTransferData, setQuickTransferData] = useState({
    amount: '',
    direction: 'to-savings'
  });

  // Handlers for formatted amount input
  const handleDepositAmountChange = (e) => {
    const raw = unformatCommas(e.target.value.replace(/[^\d.]/g, ''));
    if (/^\d*(\.\d{0,2})?$/.test(raw)) {
      setDepositAmount(raw);
    }
  };

  const handleWithdrawAmountChange = (e) => {
    const raw = unformatCommas(e.target.value.replace(/[^\d.]/g, ''));
    if (/^\d*(\.\d{0,2})?$/.test(raw)) {
      setWithdrawAmount(raw);
    }
  };

  const handleQuickTransferAmountChange = (e) => {
    const raw = unformatCommas(e.target.value.replace(/[^\d.]/g, ''));
    if (/^\d*(\.\d{0,2})?$/.test(raw)) {
      setQuickTransferData({
        ...quickTransferData,
        amount: raw
      });
    }
  };

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile off-canvas state
  const location = useLocation();

  const savingsStatistics = useMemo(() => {
    const stats = savingsData?.statistics || {};
    const totalDeposited = Number(stats.totalDeposited ?? stats.totalDeposits ?? 0);
    const totalWithdrawn = Number(stats.totalWithdrawn ?? stats.totalWithdraws ?? 0);
    const netSavings = Number(stats.netSavings ?? (totalDeposited - totalWithdrawn));

    return {
      totalDeposited,
      totalWithdrawn,
      netSavings
    };
  }, [savingsData]);

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
    fetchSavingsData();
    getPremiumStatus().then(setPremiumStatus);
  }, []);

  useEffect(() => {
    if (!showWithdrawModal) {
      setWithdrawLimits(null);
      return;
    }

    let isActive = true;

    const fetchWithdrawLimits = async () => {
      setWithdrawLimitsLoading(true);
      try {
        const response = await getTransactionLimits('withdraw');
        if (!isActive) return;

        if (response?.success && response?.data) {
          setWithdrawLimits(response.data);
        } else {
          setWithdrawLimits(null);
        }
      } catch {
        if (isActive) {
          setWithdrawLimits(null);
        }
      } finally {
        if (isActive) {
          setWithdrawLimitsLoading(false);
        }
      }
    };

    fetchWithdrawLimits();

    return () => {
      isActive = false;
    };
  }, [showWithdrawModal]);

  const openSavingsAction = (openModal) => {
    if (!hasTransactionPin) {
      setShowPinGuardModal(true);
      return;
    }

    openModal(true);
  };

  const fetchSavingsData = async () => {
    setLoading(true);
    try {
      const [overviewRes, historyRes, insightsRes] = await Promise.all([
        getSavingsOverview(),
        getSavingsHistory({ limit: 10 }),
        getSavingsInsights()
      ]);

      if (overviewRes.success) {
        setSavingsData(overviewRes.data);
        setStatsLastUpdated(new Date());
      }

      if (historyRes.success) {
        setTransactions(historyRes.data.transactions || []);
      }

      if (insightsRes.success) {
        setInsights(insightsRes.data);
      }

    } catch (error) {
      console.error('Failed to fetch savings data:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load savings data'
      });
    }
    setLoading(false);
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await depositToSavings(Number(depositAmount), transactionPin);
      if (response.success) {
        setMessage({
          type: 'success',
          text: response.message || 'Deposit successful!'
        });
        setDepositAmount('');
        setTransactionPin('');
        setShowDepositModal(false);
        fetchSavingsData();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Deposit failed'
      });
    }
    setLoading(false);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await withdrawFromSavings(Number(withdrawAmount), transactionPin);
      if (response.success) {
        setMessage({
          type: 'success',
          text: response.message || 'Withdrawal successful!'
        });
        setWithdrawAmount('');
        setTransactionPin('');
        setShowWithdrawModal(false);
        fetchSavingsData();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Withdrawal failed'
      });
    }
    setLoading(false);
  };

  const handleQuickTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await quickTransfer(
        Number(quickTransferData.amount),
        quickTransferData.direction,
        transactionPin
      );
      if (response.success) {
        setMessage({
          type: 'success',
          text: response.message || 'Transfer successful!'
        });
        setQuickTransferData({ amount: '', direction: 'to-savings' });
        setTransactionPin('');
        setShowQuickTransferModal(false);
        fetchSavingsData();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Transfer failed'
      });
    }
    setLoading(false);
  };

  const withdrawOperationLimits = withdrawLimits?.operations?.withdraw;

  return (
    <>
      {styles && <style>{styles}</style>}
      <div className="fintech-dashboard savings-management">
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
                <h1 className="page-title">Savings</h1>
                <p className="page-subtitle">Build your financial future with smart savings</p>
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
                    <h2 className="mb-1">Savings Management</h2>
                    <p className="text-muted mb-0">Build your financial future with smart savings</p>
                  </div>
                  <div className="d-flex gap-2">
                    <Button
                      variant="success"
                      onClick={() => openSavingsAction(setShowDepositModal)}
                    >
                      Deposit
                    </Button>
                    <Button
                      variant="warning"
                      onClick={() => openSavingsAction(setShowWithdrawModal)}
                    >
                      Withdraw
                    </Button>
                    <Button
                      variant="info"
                      onClick={() => openSavingsAction(setShowQuickTransferModal)}
                    >
                      Quick Transfer
                    </Button>
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

            {!hasTransactionPin && (
              <Alert variant="warning" className="mb-4 d-flex align-items-center justify-content-between" style={{ gap: '0.75rem' }}>
                <span>Set your transaction PIN to enable savings deposit, withdrawal, and quick transfer actions.</span>
                <Button
                  variant="outline-dark"
                  size="sm"
                  onClick={() => navigate('/profile?tab=security')}
                >
                  Set PIN
                </Button>
              </Alert>
            )}

            {/* Balances Overview */}
            <Row className="g-4 mb-4">
              <Col md={4}>
                <Card className="border-0 shadow-sm premium-stat-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="mb-0">Main Balance</h6>
                        <h3 className="mb-0">{formatMoney(savingsData.balances.mainBalance)}</h3>
                      </div>
                      <div className="align-self-center">
                        <Wallet2 size={32} className="opacity-75" />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="border-0 shadow-sm premium-stat-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="mb-0">Savings Balance</h6>
                        <h3 className="mb-0">{formatMoney(savingsData.balances.savingsBalance)}</h3>
                      </div>
                      <div className="align-self-center">
                        <PiggyBankFill size={32} className="opacity-75" />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={4}>
                <Card className="border-0 shadow-sm premium-stat-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="mb-0">Total Wealth</h6>
                        <h3 className="mb-0">{formatMoney(savingsData.balances.totalBalance)}</h3>
                      </div>
                      <div className="align-self-center">
                        <GraphUp size={32} className="opacity-75" />
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Statistics and Insights */}
            <Row className="g-4 mb-4">
              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <Card.Header>
                    <div className="d-flex justify-content-between align-items-center">
                      <h5 className="mb-0">Savings Statistics</h5>
                      <small className="text-muted">
                        Last updated: {statsLastUpdated ? formatTime(statsLastUpdated) : '—'}
                      </small>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <div className="row text-center">
                      <div className="col-4 px-2">
                        <h6 className="text-muted">Total Deposited</h6>
                        <h4 className="text-success text-truncate">{formatMoney(savingsStatistics.totalDeposited)}</h4>
                      </div>
                      <div className="col-4 px-2">
                        <h6 className="text-muted">Total Withdrawn</h6>
                        <h4 className="text-warning text-truncate">{formatMoney(savingsStatistics.totalWithdrawn)}</h4>
                      </div>
                      <div className="col-4 px-2">
                        <h6 className="text-muted">Net Savings</h6>
                        <h4 className="text-primary text-truncate">{formatMoney(savingsStatistics.netSavings)}</h4>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col md={6}>
                <Card className="shadow-sm h-100">
                  <Card.Header>
                    <h5 className="mb-0">Savings Health</h5>
                  </Card.Header>
                  <Card.Body>
                    {insights ? (
                      <>
                        <div className="d-flex justify-content-between mb-3">
                          <span>Savings Percentage:</span>
                          <Badge bg="primary">{insights.currentStatus?.savingsPercentage}%</Badge>
                        </div>
                        <div className="d-flex justify-content-between mb-3">
                          <span>Health Status:</span>
                          <Badge bg={
                            insights.currentStatus?.savingsHealthStatus === 'Excellent' ? 'success' :
                              insights.currentStatus?.savingsHealthStatus === 'Good' ? 'primary' :
                                insights.currentStatus?.savingsHealthStatus === 'Fair' ? 'warning' : 'danger'
                          }>
                            {insights.currentStatus?.savingsHealthStatus}
                          </Badge>
                        </div>
                        {insights.recommendations?.length > 0 && (
                          <div>
                            <small className="text-muted">Recommendations:</small>
                            <ul className="mb-0 mt-2">
                              {insights.recommendations.slice(0, 2).map((rec, index) => (
                                <li key={index} className="small">{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </>
                    ) : (
                      <LoadingWatch label="Loading insights..." minHeight="120px" />
                    )}
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Recent Transactions */}
            <Card className="shadow-sm savings-recent-transactions-card">
              <Card.Header>
                <h5 className="mb-0">Recent Transactions</h5>
              </Card.Header>
              <Card.Body>
                {transactions.length === 0 ? (
                  <div className="text-center py-5">
                    <ClockHistory size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">No transactions yet</h5>
                    <p className="text-muted">Start saving to see your transaction history</p>
                    <Button variant="dark" onClick={() => openSavingsAction(setShowDepositModal)}>
                      Make your first savings deposit
                    </Button>
                  </div>
                ) : (
                  <div className="table-responsive savings-recent-transactions-table-wrap">
                    <Table hover className="savings-recent-transactions-table">
                      <thead className="table-light">
                        <tr>
                          <th>Date</th>
                          <th>Type</th>
                          <th>Amount</th>
                          <th>Description</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr key={transaction._id || transaction.transactionId}>
                            <td className="savings-text-cell" data-label="Date">{formatDate(transaction.createdAt)}</td>
                            <td data-label="Type">
                              <Badge bg={transaction.type === 'deposit' ? 'success' : 'warning'}>
                                {transaction.type}
                              </Badge>
                            </td>
                            <td className="savings-amount-cell" data-label="Amount">{formatMoney(transaction.amount)}</td>
                            <td className="savings-text-cell" data-label="Description">{transaction.description}</td>
                            <td data-label="Status">
                              <Badge bg={transaction.status === 'completed' ? 'success' : 'secondary'}>
                                {transaction.status}
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

            {/* Deposit Modal */}
            <Modal show={showPinGuardModal} onHide={() => setShowPinGuardModal(false)} centered>
              <Modal.Header closeButton>
                <Modal.Title>Transaction PIN Required</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Set your 4-digit transaction PIN before you can perform savings deposit, withdrawal, or quick transfer actions.
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowPinGuardModal(false)}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowPinGuardModal(false);
                    navigate('/profile?tab=security');
                  }}
                >
                  Go to Security Settings
                </Button>
              </Modal.Footer>
            </Modal>

            {/* Deposit Modal */}
            <Modal show={showDepositModal} onHide={() => setShowDepositModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Deposit to Savings</Modal.Title>
              </Modal.Header>
              <Form onSubmit={handleDeposit}>
                <Modal.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Amount *</Form.Label>
                    <Form.Control
                      type="text"
                      inputMode="decimal"
                      value={formatWithCommas(depositAmount)}
                      onChange={handleDepositAmountChange}
                      placeholder="Enter amount to deposit"
                      required
                      min="0.01"
                      max="1000000"
                      step="0.01"
                    />
                    <Form.Text className="text-muted">
                      Available Balance: {formatMoney(savingsData.balances.mainBalance)}
                    </Form.Text>
                  </Form.Group>

                  <PasswordField
                    label="Transaction PIN *"
                    labelClassName="form-label"
                    groupClassName="mb-3"
                      value={transactionPin}
                      onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="Enter 4-digit PIN"
                      required
                      maxLength={4}
                  />
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => {
                    setShowDepositModal(false);
                    setTransactionPin('');
                  }}>
                    Cancel
                  </Button>
                  <Button
                    variant="success"
                    type="submit"
                    disabled={loading || !depositAmount || transactionPin.length !== 4}
                  >
                    {loading ? 'Processing...' : 'Deposit'}
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal>

            {/* Withdraw Modal */}
            <Modal show={showWithdrawModal} onHide={() => setShowWithdrawModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Withdraw from Savings</Modal.Title>
              </Modal.Header>
              <Form onSubmit={handleWithdraw}>
                <Modal.Body>
                  {withdrawLimitsLoading ? (
                    <div className="savings-limit-panel mb-3">
                      <p className="savings-limit-muted mb-0">Loading withdrawal limits...</p>
                    </div>
                  ) : withdrawOperationLimits ? (
                    <div className="savings-limit-panel mb-3">
                      <div className="savings-limit-header">
                        <span className="savings-limit-title">Withdrawal Limits</span>
                        <span className="savings-limit-tier">Tier: {withdrawLimits?.tier || 'unverified'}</span>
                      </div>
                      <LimitMeter label="Daily" bucket={withdrawOperationLimits?.daily} />
                      <LimitMeter label="Monthly" bucket={withdrawOperationLimits?.monthly} />
                    </div>
                  ) : null}

                  <Form.Group className="mb-3">
                    <Form.Label>Amount *</Form.Label>
                    <Form.Control
                      type="text"
                      inputMode="decimal"
                      value={formatWithCommas(withdrawAmount)}
                      onChange={handleWithdrawAmountChange}
                      placeholder="Enter amount to withdraw"
                      required
                      min="0.01"
                      max={savingsData.balances.savingsBalance}
                      step="0.01"
                    />
                    <Form.Text className="text-muted">
                      Available Savings: {formatMoney(savingsData.balances.savingsBalance)}
                    </Form.Text>
                  </Form.Group>

                  <PasswordField
                    label="Transaction PIN *"
                    labelClassName="form-label"
                    groupClassName="mb-3"
                      value={transactionPin}
                      onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="Enter 4-digit PIN"
                      required
                      maxLength={4}
                  />
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => {
                    setShowWithdrawModal(false);
                    setTransactionPin('');
                  }}>
                    Cancel
                  </Button>
                  <Button
                    variant="warning"
                    type="submit"
                    disabled={loading || !withdrawAmount || transactionPin.length !== 4}
                  >
                    {loading ? 'Processing...' : 'Withdraw'}
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal>

            {/* Quick Transfer Modal */}
            <Modal show={showQuickTransferModal} onHide={() => setShowQuickTransferModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Quick Transfer</Modal.Title>
              </Modal.Header>
              <Form onSubmit={handleQuickTransfer}>
                <Modal.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Transfer Direction *</Form.Label>
                    <Form.Select
                      value={quickTransferData.direction}
                      onChange={(e) => setQuickTransferData({
                        ...quickTransferData,
                        direction: e.target.value
                      })}
                      required
                    >
                      <option value="to-savings">From Main to Savings</option>
                      <option value="to-main">From Savings to Main</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Amount *</Form.Label>
                    <Form.Control
                      type="text"
                      inputMode="decimal"
                      value={formatWithCommas(quickTransferData.amount)}
                      onChange={handleQuickTransferAmountChange}
                      placeholder="Enter transfer amount"
                      required
                      min="0.01"
                      max="1000000"
                      step="0.01"
                    />
                    <Form.Text className="text-muted">
                      {quickTransferData.direction === 'to-savings'
                        ? `Available: ${formatMoney(savingsData.balances.mainBalance)}`
                        : `Available: ${formatMoney(savingsData.balances.savingsBalance)}`
                      }
                    </Form.Text>
                  </Form.Group>

                  <PasswordField
                    label="Transaction PIN *"
                    labelClassName="form-label"
                    groupClassName="mb-3"
                      value={transactionPin}
                      onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="Enter 4-digit PIN"
                      required
                      maxLength={4}
                  />
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => {
                    setShowQuickTransferModal(false);
                    setTransactionPin('');
                  }}>
                    Cancel
                  </Button>
                  <Button
                    variant="info"
                    type="submit"
                    disabled={loading || !quickTransferData.amount || transactionPin.length !== 4}
                  >
                    {loading ? 'Processing...' : 'Transfer'}
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal>
          </Container>
        </div>
      </div>
    </>
  );
};

export default SavingsManagement;

SavingsManagement.propTypes = {
  styles: PropTypes.string,
};
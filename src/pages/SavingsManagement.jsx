import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Container, Card, Form, Button, Alert, Table, Row, Col,
  Modal, Badge
} from 'react-bootstrap';
import PasswordField from '../components/PasswordField';
import LoadingWatch from '../components/LoadingWatch';
import RefreshingBadge from '../components/RefreshingBadge';
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
import { useToast } from '../context/ToastContext';


const SavingsManagement = () => {
  const { user } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
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

  // UI state
  const [loading, setLoading] = useState(false); // deposit/withdraw/transfer submission (modals)
  const [modalError, setModalError] = useState(''); // shown inline in whichever of the 3 modals is open
  const [dataLoading, setDataLoading] = useState(false); // background fetch of overview/history/insights
  const hasLoadedDataRef = useRef(false);
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
    fetchSavingsData();
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
    setModalError('');

    if (!hasTransactionPin) {
      setShowPinGuardModal(true);
      return;
    }

    openModal(true);
  };

  const fetchSavingsData = async () => {
    setDataLoading(true);
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
      notify({ variant: 'danger', text: 'Failed to load savings data' });
    }
    setDataLoading(false);
    hasLoadedDataRef.current = true;
  };

  const handleDeposit = async (e) => {
    e.preventDefault();
    setModalError('');
    setLoading(true);
    try {
      const response = await depositToSavings(Number(depositAmount), transactionPin);
      if (response.success) {
        notify({ variant: 'success', text: response.message || 'Deposit successful!' });
        setDepositAmount('');
        setTransactionPin('');
        setShowDepositModal(false);
        fetchSavingsData();
      }
    } catch (error) {
      setModalError(error.response?.data?.message || 'Deposit failed');
    }
    setLoading(false);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setModalError('');
    setLoading(true);
    try {
      const response = await withdrawFromSavings(Number(withdrawAmount), transactionPin);
      if (response.success) {
        notify({ variant: 'success', text: response.message || 'Withdrawal successful!' });
        setWithdrawAmount('');
        setTransactionPin('');
        setShowWithdrawModal(false);
        fetchSavingsData();
      }
    } catch (error) {
      setModalError(error.response?.data?.message || 'Withdrawal failed');
    }
    setLoading(false);
  };

  const handleQuickTransfer = async (e) => {
    e.preventDefault();
    setModalError('');
    setLoading(true);
    try {
      const response = await quickTransfer(
        Number(quickTransferData.amount),
        quickTransferData.direction,
        transactionPin
      );
      if (response.success) {
        notify({ variant: 'success', text: response.message || 'Transfer successful!' });
        setQuickTransferData({ amount: '', direction: 'to-savings' });
        setTransactionPin('');
        setShowQuickTransferModal(false);
        fetchSavingsData();
      }
    } catch (error) {
      setModalError(error.response?.data?.message || 'Transfer failed');
    }
    setLoading(false);
  };

  const withdrawOperationLimits = withdrawLimits?.operations?.withdraw;

  return (
    <>
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
            <Card className="border-0 shadow-sm">
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
            <Card className="border-0 shadow-sm">
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
            <Card className="border-0 shadow-sm">
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
        <Card className="shadow-sm">
          <Card.Header>
            <h5 className="mb-0">Recent Transactions</h5>
          </Card.Header>
          <Card.Body className={transactions.length === 0 ? '' : 'p-0'}>
            {dataLoading && !hasLoadedDataRef.current ? (
              <LoadingWatch label="Loading transactions..." minHeight="160px" />
            ) : transactions.length === 0 ? (
              <div className="text-center py-5">
                <ClockHistory size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No transactions yet</h5>
                <p className="text-muted">Start saving to see your transaction history</p>
                <Button variant="dark" onClick={() => openSavingsAction(setShowDepositModal)}>
                  Make your first savings deposit
                </Button>
              </div>
            ) : (
              <>
              {dataLoading && <div className="px-3 pt-3"><RefreshingBadge /></div>}
              <div className="table-responsive">
                <Table hover className="mb-0">
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
                        <td>{formatDate(transaction.createdAt)}</td>
                        <td>
                          <Badge bg={transaction.type === 'deposit' ? 'success' : 'warning'}>
                            {transaction.type}
                          </Badge>
                        </td>
                        <td>{formatMoney(transaction.amount)}</td>
                        <td>{transaction.description}</td>
                        <td>
                          <Badge bg={transaction.status === 'completed' ? 'success' : 'secondary'}>
                            {transaction.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              </>
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
        <Modal show={showDepositModal} onHide={() => { setShowDepositModal(false); setModalError(''); }}>
          <Modal.Header closeButton>
            <Modal.Title>Deposit to Savings</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleDeposit}>
            <Modal.Body>
              {modalError && (
                <Alert variant="danger" className="py-2 small" role="alert">
                  {modalError}
                </Alert>
              )}
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
                setModalError('');
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
        <Modal show={showWithdrawModal} onHide={() => { setShowWithdrawModal(false); setModalError(''); }}>
          <Modal.Header closeButton>
            <Modal.Title>Withdraw from Savings</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleWithdraw}>
            <Modal.Body>
              {modalError && (
                <Alert variant="danger" className="py-2 small" role="alert">
                  {modalError}
                </Alert>
              )}
              {withdrawLimitsLoading ? (
                <p className="text-muted small mb-3">Loading withdrawal limits...</p>
              ) : withdrawOperationLimits ? (
                <div className="p-3 mb-3 bg-light border rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold small">Withdrawal Limits</span>
                    <Badge bg="light" text="dark" className="border">Tier: {withdrawLimits?.tier || 'unverified'}</Badge>
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
                setModalError('');
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
        <Modal show={showQuickTransferModal} onHide={() => { setShowQuickTransferModal(false); setModalError(''); }}>
          <Modal.Header closeButton>
            <Modal.Title>Quick Transfer</Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleQuickTransfer}>
            <Modal.Body>
              {modalError && (
                <Alert variant="danger" className="py-2 small" role="alert">
                  {modalError}
                </Alert>
              )}
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
                setModalError('');
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
    </>
  );
};

export default SavingsManagement;
import { formatWithCommas, unformatCommas } from '../utils/formatAmount';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import {
  getBeneficiaries,
  createBeneficiary,
  removeBeneficiary,
  transferToBeneficiary,
} from '../services/beneficiaryService';
import { getTransactionLimits } from '../services/transactionService';
import { getPremiumStatus } from '../utils/premiumStatus';
import {
  Container, Card, Form, Button, Alert, Table, Row, Col,
  Modal
} from 'react-bootstrap';
import ZurichBrand from '../components/ZurichBrand';
import LoadingWatch from '../components/LoadingWatch';
import { renderSidebarNavLinks } from '../components/sidebarNavLinks';

const getLimitSeverity = (bucket) => {
  const limit = Number(bucket?.limit || 0);
  const remaining = Number(bucket?.remaining || 0);

  if (!Number.isFinite(limit) || limit <= 0) return 'normal';
  if (!Number.isFinite(remaining) || remaining <= 0) return 'danger';

  const ratio = remaining / limit;
  if (ratio <= 0.1) return 'danger';
  if (ratio <= 0.25) return 'warning';
  return 'normal';
};

const BeneficiaryManagement = ({ styles }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.roles === 'admin' || user?.role === 'admin' || user?.isAdmin === true;
  const [premiumStatus, setPremiumStatus] = useState({ isPremium: false });
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newBeneficiary, setNewBeneficiary] = useState({
    accountNumber: ''
  });
  const [transferData, setTransferData] = useState({
    beneficiaryId: '',
    amount: '',
    description: '',
    transactionPin: '',
  });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferLimits, setTransferLimits] = useState(null);
  const [limitsLoading, setLimitsLoading] = useState(false);

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
    fetchBeneficiaries();
    getPremiumStatus().then(setPremiumStatus);
  }, []);

  useEffect(() => {
    if (!showTransferModal) {
      setTransferLimits(null);
      return;
    }

    let isActive = true;

    const fetchTransferLimits = async () => {
      setLimitsLoading(true);
      try {
        const response = await getTransactionLimits('transfer');
        if (!isActive) return;

        if (response?.success && response?.data) {
          setTransferLimits(response.data);
        } else {
          setTransferLimits(null);
        }
      } catch (error) {
        if (isActive) {
          setTransferLimits(null);
        }
      } finally {
        if (isActive) {
          setLimitsLoading(false);
        }
      }
    };

    fetchTransferLimits();

    return () => {
      isActive = false;
    };
  }, [showTransferModal]);

  const validateAccountNumber = (accountNumber) => {
    const normalizedAccountNumber = accountNumber?.toString().replace(/\D/g, '');

    // Must be exactly 10 digits
    if (!/^\d{10}$/.test(normalizedAccountNumber)) {
      return 'Account number must be exactly 10 digits';
    }

    // Cannot add yourself
    if (normalizedAccountNumber === user?.accountNumber?.toString()) {
      return 'Cannot add yourself as beneficiary';
    }

    // Check if already added
    const exists = beneficiaries.some(
      b => b.accountNumber?.toString() === normalizedAccountNumber
    );
    if (exists) {
      return 'Beneficiary already added';
    }

    return null;
  };

  const fetchBeneficiaries = async () => {
    setLoading(true);
    try {
      const data = await getBeneficiaries();
      if (data.success) {
        setBeneficiaries(data.data);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch beneficiaries'
      });
    }
    setLoading(false);
  };

  const addBeneficiary = async (e) => {
    e.preventDefault();
    const normalizedAccountNumber = newBeneficiary.accountNumber.toString().replace(/\D/g, '');

    // Validate account number
    const validationError = validateAccountNumber(normalizedAccountNumber);
    if (validationError) {
      setMessage({
        type: 'error',
        text: validationError
      });
      return;
    }

    setLoading(true);
    try {
      const data = await createBeneficiary(normalizedAccountNumber);
      if (data.success) {
        setMessage({
          type: 'success',
          text: data.message || 'Beneficiary added successfully!'
        });
        setNewBeneficiary({
          accountNumber: ''
        });
        setShowAddModal(false);
        fetchBeneficiaries();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to add beneficiary'
      });
    }
    setLoading(false);
  };

  const deleteBeneficiary = async (beneficiaryId) => {
    if (window.confirm('Are you sure you want to delete this beneficiary?')) {
      try {
        const data = await removeBeneficiary(beneficiaryId);
        if (data.success) {
          setMessage({
            type: 'success',
            text: 'Beneficiary deleted successfully!'
          });
          fetchBeneficiaries();
        }
      } catch (error) {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Failed to delete beneficiary'
        });
      }
    }
  };

  const initiateTransfer = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setTransferData({
      beneficiaryId: beneficiary._id,
      amount: '',
      description: '',
      transactionPin: '',
    });
    setShowTransferModal(true);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    if (!selectedBeneficiary?.accountNumber) {
      setMessage({
        type: 'error',
        text: 'Recipient details are missing. Please close and reopen transfer modal.'
      });
      return;
    }

    if (!transferData.amount || Number(transferData.amount) <= 0) {
      setMessage({
        type: 'error',
        text: 'Enter a valid transfer amount.'
      });
      return;
    }

    if (String(transferData.transactionPin || '').trim().length !== 4) {
      setMessage({
        type: 'error',
        text: 'Enter your 4-digit transaction PIN.'
      });
      return;
    }

    setTransferLoading(true);
    try {
      const data = await transferToBeneficiary({
        receiverAccountNumber: selectedBeneficiary.accountNumber,
        amount: parseFloat(transferData.amount),
        description: transferData.description,
        transactionPin: transferData.transactionPin,
      });

      if (data.success) {
        setMessage({
          type: 'success',
          text: 'Transfer initiated successfully!'
        });
        setTransferData({
          beneficiaryId: '',
          amount: '',
          description: '',
          transactionPin: '',
        });
        setShowTransferModal(false);
        setSelectedBeneficiary(null);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Transfer failed'
      });
    } finally {
      setTransferLoading(false);
    }
  };

  const transferOperationLimits = transferLimits?.operations?.transfer;
  const formatCurrencyValue = (value) => `₦${Number(value || 0).toLocaleString()}`;
  const transferDailySeverity = getLimitSeverity(transferOperationLimits?.daily);
  const transferMonthlySeverity = getLimitSeverity(transferOperationLimits?.monthly);

  return (
    <>
      {styles && <style>{styles}</style>}
      <div className="fintech-dashboard beneficiary-management">
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
                <h1 className="page-title">Beneficiaries</h1>
                <p className="page-subtitle">Manage your transfer recipients</p>
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
                  <h2 className="mb-0">Beneficiary Management</h2>
                  <Button
                    variant="primary"
                    onClick={() => setShowAddModal(true)}
                    className="px-4"
                  >
                    <i className="fas fa-plus me-2"></i>
                    Add Beneficiary
                  </Button>
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

            {/* Stats Cards */}
            <Row className="g-4 mb-4">
              <Col md={4}>
                <Card className="border-0 shadow-sm premium-stat-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="mb-0">Total Beneficiaries</h6>
                        <h3 className="mb-0">{beneficiaries.length}</h3>
                      </div>
                      <div className="align-self-center">
                        <i className="fas fa-address-book fa-2x opacity-75"></i>
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
                        <h6 className="mb-0">Total Beneficiaries</h6>
                        <h3 className="mb-0">{beneficiaries.length}</h3>
                      </div>
                      <div className="align-self-center">
                        <i className="fas fa-address-book fa-2x opacity-75"></i>
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
                        <h6 className="mb-0">Quick Access</h6>
                        <h3 className="mb-0">{beneficiaries.length}</h3>
                      </div>
                      <div className="align-self-center">
                        <i className="fas fa-bolt fa-2x opacity-75"></i>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Beneficiaries Table */}
            <Card className="shadow-sm">
              <Card.Header className="bg-white border-bottom">
                <h5 className="mb-0">Your Beneficiaries</h5>
              </Card.Header>
              <Card.Body className="p-0">
                {loading ? (
                  <LoadingWatch label="Loading beneficiaries..." minHeight="160px" />
                ) : beneficiaries.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-address-book fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No beneficiaries added yet</h5>
                    <p className="text-muted">Add your first beneficiary to start making quick transfers</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <Table hover className="mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Name</th>
                          <th>Username</th>
                          <th>Account Number</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {beneficiaries.map((beneficiary) => (
                          <tr key={beneficiary._id}>
                            <td className="beneficiary-text-cell">
                              <strong>{beneficiary.firstName} {beneficiary.lastName}</strong>
                            </td>
                            <td className="beneficiary-text-cell">{beneficiary.userName}</td>
                            <td className="font-monospace beneficiary-account-cell">{beneficiary.accountNumber}</td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="me-2"
                                onClick={() => initiateTransfer(beneficiary)}
                              >
                                Transfer
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => deleteBeneficiary(beneficiary._id)}
                              >
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Add Beneficiary Modal */}
            <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
              <Modal.Header closeButton>
                <Modal.Title>Add New Beneficiary</Modal.Title>
              </Modal.Header>
              <Form onSubmit={addBeneficiary}>
                <Modal.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Account Number *</Form.Label>
                    <Form.Control
                      type="text"
                      value={newBeneficiary.accountNumber}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setNewBeneficiary({ ...newBeneficiary, accountNumber: digitsOnly });
                      }}
                      placeholder="Enter 10-digit account number"
                      required
                      maxLength="10"
                      pattern="[0-9]{10}"
                      title="Account number must be exactly 10 digits"
                    />
                    <Form.Text className="text-muted">
                      Enter the recipient&apos;s 10-digit account number. System will automatically fetch account details.
                    </Form.Text>
                  </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading || newBeneficiary.accountNumber.length !== 10}
                  >
                    {loading ? 'Adding...' : 'Add Beneficiary'}
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal>

            {/* Transfer Modal */}
            <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>
                  Transfer to {selectedBeneficiary ? `${selectedBeneficiary.firstName} ${selectedBeneficiary.lastName}` : ''}
                </Modal.Title>
              </Modal.Header>
              <Form onSubmit={handleTransfer}>
                <Modal.Body>
                  {selectedBeneficiary && (
                    <Card className="mb-3 bg-light">
                      <Card.Body className="py-2">
                        <small className="text-muted">Recipient Details:</small>
                        <p className="mb-1 beneficiary-text-cell"><strong>{selectedBeneficiary.firstName} {selectedBeneficiary.lastName}</strong></p>
                        <p className="mb-0 text-muted beneficiary-text-cell">@{selectedBeneficiary.userName} • {selectedBeneficiary.accountNumber}</p>
                      </Card.Body>
                    </Card>
                  )}

                  {limitsLoading ? (
                    <div className="beneficiary-limit-panel mb-3">
                      <p className="beneficiary-limit-muted mb-0">Loading transfer limits...</p>
                    </div>
                  ) : transferOperationLimits ? (
                    <div className="beneficiary-limit-panel mb-3">
                      <div className="beneficiary-limit-header">
                        <span className="beneficiary-limit-title">Transfer Limits</span>
                        <span className="beneficiary-limit-tier">Tier: {transferLimits?.tier || 'unverified'}</span>
                      </div>
                      <p className={`beneficiary-limit-line ${transferDailySeverity}`}>
                        Daily Remaining:
                        <strong>{formatCurrencyValue(transferOperationLimits?.daily?.remaining)}</strong>
                      </p>
                      <p className={`beneficiary-limit-line ${transferMonthlySeverity} mb-0`}>
                        Monthly Remaining:
                        <strong>{formatCurrencyValue(transferOperationLimits?.monthly?.remaining)}</strong>
                      </p>
                    </div>
                  ) : null}

                  <Form.Group className="mb-3">
                    <Form.Label>Amount *</Form.Label>
                    <Form.Control
                      type="text"
                      inputMode="decimal"
                      value={formatWithCommas(transferData.amount)}
                      onChange={e => {
                        const raw = unformatCommas(e.target.value.replace(/[^\d.]/g, ''));
                        if (/^\d*(\.\d{0,2})?$/.test(raw)) {
                          setTransferData({ ...transferData, amount: raw });
                        }
                      }}
                      placeholder="Enter amount"
                      required
                      min="1"
                      step="0.01"
                    />
                    <Form.Text className="text-muted">
                      Available Balance: ₦{user?.balance?.toLocaleString() || 0}
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Description (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={transferData.description}
                      onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                      placeholder="Payment description..."
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Transaction PIN *</Form.Label>
                    <Form.Control
                      type="password"
                      value={transferData.transactionPin}
                      onChange={(e) => {
                        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setTransferData({ ...transferData, transactionPin: digitsOnly });
                      }}
                      placeholder="Enter 4-digit PIN"
                      required
                      maxLength="4"
                      pattern="[0-9]{4}"
                      title="Transaction PIN must be exactly 4 digits"
                    />
                  </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowTransferModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={transferLoading || !transferData.amount || transferData.transactionPin.length !== 4}
                  >
                    {transferLoading ? 'Processing...' : 'Transfer'}
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

export default BeneficiaryManagement;

BeneficiaryManagement.propTypes = {
  styles: PropTypes.string,
};
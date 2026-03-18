import { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import api from '../config/api';
import {
  Card, Form, Button, Alert, Table, Row, Col,
  Badge
} from 'react-bootstrap';
import ZurichBrand from '../components/ZurichBrand';
import { renderSidebarNavLinks } from '../components/sidebarNavLinks';

const AdminDashboard = ({ styles }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.roles === 'admin' || user?.role === 'admin' || user?.isAdmin === true;

  const [allTransactions, setAllTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Close mobile sidebar on Escape and auto-close on resize to larger screens
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
    fetchAllTransactions();
  }, []);

  const fetchAllTransactions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/transactions');
      if (response.data.success) {
        setAllTransactions(response.data.data);
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to fetch transactions'
      });
    }
    setLoading(false);
  };

  const totalUsersInTransactions = new Set(
    allTransactions.flatMap((transaction) => [
      transaction.sender?.accountNumber,
      transaction.receiver?.accountNumber,
    ].filter(Boolean))
  ).size;

  const totalDeposits = allTransactions
    .filter((transaction) => transaction.type === 'deposit')
    .reduce((sum, transaction) => sum + (Number(transaction.amount) || 0), 0);

  const pendingTransactions = allTransactions
    .filter((transaction) => transaction.status === 'pending').length;

  const transactionTypes = useMemo(() => {
    return Array.from(new Set(allTransactions.map((transaction) => transaction.type).filter(Boolean)));
  }, [allTransactions]);

  const transactionStatuses = useMemo(() => {
    return Array.from(new Set(allTransactions.map((transaction) => transaction.status).filter(Boolean)));
  }, [allTransactions]);

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return allTransactions.filter((transaction) => {
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || transaction.status === statusFilter;

      const senderFullName = `${transaction.sender?.firstName || ''} ${transaction.sender?.lastName || ''}`.trim();
      const receiverFullName = `${transaction.receiver?.firstName || ''} ${transaction.receiver?.lastName || ''}`.trim();

      const searchableText = [
        transaction.type,
        transaction.status,
        transaction.sender?.accountNumber,
        transaction.receiver?.accountNumber,
        senderFullName,
        receiverFullName,
        String(transaction.amount || ''),
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch);

      return matchesType && matchesStatus && matchesSearch;
    });
  }, [allTransactions, searchTerm, typeFilter, statusFilter]);

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
  };

  return (
    <>
      {styles && <style>{styles}</style>}
      <div className="fintech-dashboard admin-dashboard-page">
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
                <h1 className="page-title">Admin Dashboard</h1>
                <p className="page-subtitle">Platform Overview & Management</p>
              </div>
            </div>
            <div className="header-right">
              <div className="user-profile">
                <div className="user-avatar" style={{ background: '#ffc107', color: '#000' }}>
                  {(user?.firstName?.[0] || user?.userName?.[0] || 'A').toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user?.firstName || user?.userName}</span>
                  <span className="user-role admin">Admin Account</span>
                </div>
              </div>
            </div>
          </header>

          <div className="p-4 admin-dashboard-inner">
            {/* System Overview Cards */}
            <Row className="g-4 mb-4">
              <Col md={3}>
                <Card className="border-0 shadow-sm premium-stat-card">
                  <Card.Body>
                    <div className="d-flex justify-content-between">
                      <div>
                        <h6 className="card-title mb-0">Observed Accounts</h6>
                        <h2 className="mb-0">{totalUsersInTransactions}</h2>
                      </div>
                      <div className="align-self-center">
                        <i className="fas fa-users fa-2x opacity-75"></i>
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
                        <h6 className="card-title mb-0">Total Deposits</h6>
                        <h2 className="mb-0">₦{totalDeposits.toLocaleString()}</h2>
                      </div>
                      <div className="align-self-center">
                        <i className="fas fa-arrow-down fa-2x opacity-75"></i>
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
                        <h6 className="card-title mb-0">Pending Transactions</h6>
                        <h2 className="mb-0">{pendingTransactions}</h2>
                      </div>
                      <div className="align-self-center">
                        <i className="fas fa-clock fa-2x opacity-75"></i>
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
                        <h6 className="card-title mb-0">Total Transactions</h6>
                        <h2 className="mb-0">{allTransactions.length}</h2>
                      </div>
                      <div className="align-self-center">
                        <i className="fas fa-check-circle fa-2x opacity-75"></i>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {message.text && (
              <Alert variant={message.type === 'success' ? 'success' : 'danger'} className="mb-4">
                {message.text}
              </Alert>
            )}

            {/* Admin Management Tabs */}
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0">All User Transactions</h5>
                  <Button variant="outline-primary" size="sm" onClick={fetchAllTransactions} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh'}
                  </Button>
                </div>

                <Row className="g-2 mb-3">
                  <Col md={5}>
                    <Form.Control
                      type="text"
                      placeholder="Search by account, name, type, status, or amount"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                      <option value="all">All Types</option>
                      {transactionTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                      <option value="all">All Statuses</option>
                      {transactionStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </Form.Select>
                  </Col>
                  <Col md={1} className="d-grid">
                    <Button variant="outline-secondary" onClick={resetFilters}>Reset</Button>
                  </Col>
                </Row>

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <small className="text-muted">
                    Showing {filteredTransactions.length} of {allTransactions.length} transactions
                  </small>
                </div>

                <div className="table-responsive">
                  <Table hover>
                    <thead className="table-dark">
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction._id}>
                          <td>{new Date(transaction.date).toLocaleDateString()}</td>
                          <td>
                            <Badge bg={
                              transaction.type === 'deposit' ? 'success' :
                                transaction.type === 'withdraw' ? 'danger' : 'info'
                            }>
                              {transaction.type?.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="amount-cell">₦{Number(transaction.amount || 0).toLocaleString()}</td>
                          <td className="party-cell">
                            {transaction.sender
                              ? `${transaction.sender.firstName || ''} ${transaction.sender.lastName || ''} (${transaction.sender.accountNumber || 'N/A'})`
                              : 'N/A'}
                          </td>
                          <td className="party-cell">
                            {transaction.receiver
                              ? `${transaction.receiver.firstName || ''} ${transaction.receiver.lastName || ''} (${transaction.receiver.accountNumber || 'N/A'})`
                              : 'N/A'}
                          </td>
                          <td>
                            <Badge bg={
                              transaction.status === 'completed' ? 'success' :
                                transaction.status === 'pending' ? 'warning' : 'danger'
                            }>
                              {transaction.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                      {filteredTransactions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="text-center text-muted py-4">
                            No transactions match the current filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>

      </div>
    </>
  );
};

export default AdminDashboard;

AdminDashboard.propTypes = {
  styles: PropTypes.string,
};
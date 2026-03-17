import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ZurichBrand from '../components/ZurichBrand';
import LoadingWatch from '../components/LoadingWatch';
import { renderSidebarNavLinks } from '../components/sidebarNavLinks';
import { DASHBOARD_STYLES } from './Dashboard.styles';
import { getAccountStatement, getLedgerHistory } from '../services/ledgerService';

const formatCurrency = (value) => `₦${Number(value || 0).toLocaleString()}`;
const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : '-');

const Ledger = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.roles === 'admin' || user?.role === 'admin' || user?.isAdmin === true;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loadingStatement, setLoadingStatement] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    accountType: '',
    referenceType: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const queryOptions = useMemo(() => ({
    accountType: filters.accountType || undefined,
    referenceType: filters.referenceType || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    page: filters.page,
    limit: filters.limit,
  }), [filters]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && sidebarOpen) setSidebarOpen(false);
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
    const fetchLedgerHistory = async () => {
      setLoadingHistory(true);
      setError('');

      try {
        const response = await getLedgerHistory(queryOptions);
        if (response?.success) {
          setEntries(response?.data?.entries || []);
          setPagination(response?.data?.pagination || {
            page: 1,
            limit: filters.limit,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          });
        } else {
          setEntries([]);
        }
      } catch (fetchError) {
        setError(fetchError?.response?.data?.message || 'Failed to fetch ledger history');
        setEntries([]);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchLedgerHistory();
  }, [queryOptions, filters.limit]);

  useEffect(() => {
    const fetchStatement = async () => {
      setLoadingStatement(true);

      try {
        const response = await getAccountStatement({
          accountType: filters.accountType || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        });

        if (response?.success) {
          setAccounts(response?.data?.accounts || []);
        } else {
          setAccounts([]);
        }
      } catch (statementError) {
        setAccounts([]);
        setError(statementError?.response?.data?.message || 'Failed to fetch account statement');
      } finally {
        setLoadingStatement(false);
      }
    };

    fetchStatement();
  }, [filters.accountType, filters.startDate, filters.endDate]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? value : 1,
    }));
  };

  const goToPage = (nextPage) => {
    setFilters((prev) => ({ ...prev, page: Math.max(1, nextPage) }));
  };

  return (
    <>
      <style>{DASHBOARD_STYLES}</style>

      <div className="fintech-dashboard">
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="brand">
              <ZurichBrand showText={!sidebarCollapsed} className="sidebar-brand" />
            </div>
            <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
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

        <div className={`sidebar-overlay ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />

        <div className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <header className="main-header">
            <div className="header-left">
              <button
                className="mobile-menu-btn"
                aria-label="Toggle menu"
                onClick={() => setSidebarOpen((prev) => !prev)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
                </svg>
              </button>
              <div>
                <h1 className="page-title">Ledger</h1>
                <p className="page-subtitle">View accounting entries and account statement.</p>
              </div>
            </div>
          </header>

          <div className="dashboard-container">
            {error && <div className="alert error">{error}</div>}

            <div className="filters-panel" style={{ marginBottom: '1rem' }}>
              <div className="filter-row">
                <div className="filter-group">
                  <label>Account Type</label>
                  <select
                    value={filters.accountType}
                    onChange={(event) => handleFilterChange('accountType', event.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Accounts</option>
                    <option value="user_main">Main Account</option>
                    <option value="user_savings">Savings Account</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Reference Type</label>
                  <select
                    value={filters.referenceType}
                    onChange={(event) => handleFilterChange('referenceType', event.target.value)}
                    className="filter-select"
                  >
                    <option value="">All References</option>
                    <option value="transaction">Transaction</option>
                    <option value="savings_transaction">Savings Transaction</option>
                    <option value="investment_trade">Investment Trade</option>
                  </select>
                </div>
              </div>

              <div className="filter-row">
                <div className="filter-group">
                  <label>Date Range</label>
                  <div className="date-range">
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(event) => handleFilterChange('startDate', event.target.value)}
                      className="date-input"
                    />
                    <span className="date-separator">to</span>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(event) => handleFilterChange('endDate', event.target.value)}
                      className="date-input"
                    />
                  </div>
                </div>

                <div className="filter-group">
                  <label>Rows</label>
                  <select
                    value={filters.limit}
                    onChange={(event) => handleFilterChange('limit', Number(event.target.value))}
                    className="filter-select"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="transactions-section">
              <div className="section-header">
                <h3>Account Statement</h3>
              </div>

              {loadingStatement ? (
                <LoadingWatch label="Loading statement..." minHeight="100px" />
              ) : (
                <div className="dashboard-grid" style={{ marginBottom: '1rem' }}>
                  {(accounts || []).map((account) => (
                    <div className="dashboard-card" key={account.accountType}>
                      <h4 className="ledger-cell-text" style={{ marginBottom: '0.75rem' }}>{account.accountType}</h4>
                      <p className="ledger-statement-line">Opening: <span className="ledger-cell-amount">{formatCurrency(account.openingBalance)}</span></p>
                      <p className="ledger-statement-line">Debits: <span className="ledger-cell-amount">{formatCurrency(account.totalDebits)}</span></p>
                      <p className="ledger-statement-line">Credits: <span className="ledger-cell-amount">{formatCurrency(account.totalCredits)}</span></p>
                      <p className="ledger-statement-line">Net: <span className="ledger-cell-amount">{formatCurrency(account.netMovement)}</span></p>
                      <p className="ledger-statement-line">Closing: <span className="ledger-cell-amount">{formatCurrency(account.closingBalance)}</span></p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="transactions-section">
              <div className="section-header">
                <h3>Ledger History</h3>
              </div>

              <div className="table-container">
                <table className="transactions-table">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Reference</th>
                      <th>Account</th>
                      <th>Debit</th>
                      <th>Credit</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingHistory ? (
                      <tr>
                        <td colSpan="6" className="text-center">
                          <LoadingWatch label="Loading ledger history..." minHeight="90px" />
                        </td>
                      </tr>
                    ) : entries.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center">No ledger entries found.</td>
                      </tr>
                    ) : (
                      entries.map((entry) => (
                        <tr key={entry._id}>
                          <td className="ledger-cell-text">{entry.description || '-'}</td>
                          <td className="ledger-cell-text">{entry.referenceType}</td>
                          <td className="ledger-cell-text">{entry.accountType}</td>
                          <td className="ledger-cell-amount">{formatCurrency(entry.debit)}</td>
                          <td className="ledger-cell-amount">{formatCurrency(entry.credit)}</td>
                          <td className="ledger-cell-text">{formatDateTime(entry.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="pagination-controls" style={{ marginTop: '1rem' }}>
                <button
                  className="pagination-btn"
                  disabled={!pagination.hasPrevPage || loadingHistory}
                  onClick={() => goToPage((pagination.page || 1) - 1)}
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {pagination.page || 1} of {pagination.totalPages || 1}
                </span>
                <button
                  className="pagination-btn"
                  disabled={!pagination.hasNextPage || loadingHistory}
                  onClick={() => goToPage((pagination.page || 1) + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Ledger;
import { useEffect, useMemo, useRef, useState } from 'react';
import LoadingWatch from '../components/LoadingWatch';
import RefreshingBadge from '../components/RefreshingBadge';
import { getAccountStatement, getLedgerHistory } from '../services/ledgerService';
import { formatDateTime, formatMoney } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

const formatCurrency = (value) => formatMoney(value);

const Ledger = () => {
  const { notify } = useToast();

  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const hasLoadedHistoryRef = useRef(false);
  const [loadingStatement, setLoadingStatement] = useState(false);
  const hasLoadedStatementRef = useRef(false);

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
    const fetchLedgerHistory = async () => {
      setLoadingHistory(true);

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
        notify({ variant: 'danger', text: fetchError?.response?.data?.message || 'Failed to fetch ledger history' });
        setEntries([]);
      } finally {
        setLoadingHistory(false);
        hasLoadedHistoryRef.current = true;
      }
    };

    fetchLedgerHistory();
    // notify is stable (from context) and intentionally excluded so this only re-runs on filter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        notify({ variant: 'danger', text: statementError?.response?.data?.message || 'Failed to fetch account statement' });
      } finally {
        setLoadingStatement(false);
        hasLoadedStatementRef.current = true;
      }
    };

    fetchStatement();
    // notify is stable (from context) and intentionally excluded so this only re-runs on filter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="dashboard-container">
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

          {loadingStatement && !hasLoadedStatementRef.current ? (
            <LoadingWatch label="Loading statement..." minHeight="100px" />
          ) : (
            <>
              {loadingStatement && <RefreshingBadge />}
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
            </>
          )}
        </div>

        <div className="transactions-section">
          <div className="section-header">
            <h3>Ledger History</h3>
          </div>

          {loadingHistory && <RefreshingBadge />}
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
                {loadingHistory && !hasLoadedHistoryRef.current ? (
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
    </>
  );
};

export default Ledger;

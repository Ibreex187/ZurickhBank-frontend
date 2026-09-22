import { formatWithCommas, unformatCommas } from '../utils/formatAmount';
import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import PasswordField from '../components/PasswordField';
import LoadingWatch from '../components/LoadingWatch';
import AppButton from '../components/AppButton';
import {
  getTransactionHistory,
  getTransactionById,
  getTransactionLimits,
  getTransactionSummary,
  resolveRecipientAccount,
  transferFunds,
  depositFunds,
  withdrawFunds,
  validateTransactionAmount,
  validateAccountNumber
} from '../services/transactionService';
import { createBeneficiary } from '../services/beneficiaryService';
import { formatDate, formatDateTime, formatMoney, formatPlainAmount } from '../utils/formatters';
import { Alert, Button, ListGroup } from 'react-bootstrap';
import CopyButton from '../components/CopyButton';
import LimitMeter from '../components/LimitMeter';
import TransactionReceipt from '../components/TransactionReceipt';

const BALANCE_VISIBILITY_COOKIE = 'dashboard_balance_visible';

const getCookieValue = (name) => {
  const cookieEntry = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`));

  return cookieEntry ? cookieEntry.split('=')[1] : null;
};

const setCookieValue = (name, value, days = 30) => {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

const formatCurrencyValue = (value) => formatMoney(value);

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

const Dashboard = ({ styles }) => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [receiverAccountNumber, setReceiverAccountNumber] = useState('');
  const [receiverLookup, setReceiverLookup] = useState({
    loading: false,
    accountName: '',
    resolvedAccountNumber: '',
    error: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showBalanceAmount, setShowBalanceAmount] = useState(() => {
    const savedPreference = getCookieValue(BALANCE_VISIBILITY_COOKIE);
    if (savedPreference === 'true') return true;
    if (savedPreference === 'false') return false;
    return false;
  });

  // Advanced filtering and pagination state
  const [filters, setFilters] = useState({
    type: 'all',
    search: '',
    searchBy: 'recipient',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalTransactions: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showPinGuardModal, setShowPinGuardModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionDetailsLoading, setTransactionDetailsLoading] = useState(false);
  const [transactionLimits, setTransactionLimits] = useState(null);
  const [limitsLoading, setLimitsLoading] = useState(false);
  const [netActivity, setNetActivity] = useState(0);
  const [transferModalSession, setTransferModalSession] = useState(0);
  const [modalStep, setModalStep] = useState('form'); // 'form' | 'review' | 'receipt'
  const [receipt, setReceipt] = useState(null);
  const [saveBeneficiaryState, setSaveBeneficiaryState] = useState({ status: 'idle', text: '' });
  const [exporting, setExporting] = useState(false);
  const [exportNotice, setExportNotice] = useState({ variant: '', text: '' });
  const hasTransactionPin = Boolean(user?.hasTransactionPin);
  const receiverAccountInputRef = useRef(null);

  const closeTransactionModal = useCallback(() => {
    setActionType('');
    setDescription('');
    setAmount('');
    setReceiverAccountNumber('');
    setTransactionPin('');
    setReceiverLookup({ loading: false, accountName: '', resolvedAccountNumber: '', error: '' });
    setMessage({ type: '', text: '' });
    setModalStep('form');
    setReceipt(null);
    setSaveBeneficiaryState({ status: 'idle', text: '' });
  }, []);

  const openProtectedAction = (nextActionType) => {
    setMessage({ type: '', text: '' });
    setModalStep('form');
    setReceipt(null);
    setSaveBeneficiaryState({ status: 'idle', text: '' });

    if (!hasTransactionPin) {
      setShowPinGuardModal(true);
      return;
    }

    setAmount('');
    setDescription('');
    setTransactionPin('');

    if (nextActionType !== 'transfer') {
      setReceiverAccountNumber('');
      setReceiverLookup({ loading: false, accountName: '', resolvedAccountNumber: '', error: '' });
    }

    if (nextActionType === 'transfer') {
      setTransferModalSession((prev) => prev + 1);
      setReceiverAccountNumber('');
      setReceiverLookup({ loading: false, accountName: '', resolvedAccountNumber: '', error: '' });
    }

    setActionType(nextActionType);
  };

  // ...existing code...

  useEffect(() => {
    setCookieValue(BALANCE_VISIBILITY_COOKIE, String(showBalanceAmount));
  }, [showBalanceAmount]);

  useEffect(() => {
    if (actionType !== 'transfer') {
      return;
    }

    setReceiverAccountNumber('');
    setReceiverLookup({ loading: false, accountName: '', resolvedAccountNumber: '', error: '' });

    const frameId = window.requestAnimationFrame(() => {
      if (receiverAccountInputRef.current) {
        receiverAccountInputRef.current.value = '';
      }
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [actionType, transferModalSession]);

  useEffect(() => {
    const normalizedAccount = receiverAccountNumber.trim();

    if (actionType !== 'transfer') {
      setReceiverLookup({ loading: false, accountName: '', resolvedAccountNumber: '', error: '' });
      return;
    }

    if (!normalizedAccount) {
      setReceiverLookup({ loading: false, accountName: '', resolvedAccountNumber: '', error: '' });
      return;
    }

    if (!/^\d{10}$/.test(normalizedAccount)) {
      setReceiverLookup({ loading: false, accountName: '', resolvedAccountNumber: '', error: '' });
      return;
    }

    let isActive = true;
    setReceiverLookup({ loading: true, accountName: '', resolvedAccountNumber: '', error: '' });

    const timer = setTimeout(async () => {
      const response = await resolveRecipientAccount(normalizedAccount);

      if (!isActive) return;

      if (response.success) {
        setReceiverLookup({
          loading: false,
          accountName: response.data?.accountName || '',
          resolvedAccountNumber: normalizedAccount,
          error: ''
        });
      } else {
        setReceiverLookup({
          loading: false,
          accountName: '',
          resolvedAccountNumber: '',
          error: response.message || 'Unable to resolve recipient account'
        });
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timer);
    };
  }, [receiverAccountNumber, actionType]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      type: 'all',
      search: '',
      searchBy: 'recipient',
      startDate: '',
      endDate: '',
      minAmount: '',
      maxAmount: ''
    });
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Export transactions to CSV
  const EXPORT_ROW_LIMIT = 500;
  const EXPORT_PAGE_SIZE = 100; // the largest page the API allows

  // A cell that starts with = + - @ would be run as a formula by Excel/Sheets,
  // and transfer notes are typed by other users, so text cells get a leading quote.
  const toCsvTextCell = (value) => {
    const text = String(value ?? '');
    const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };

  // Export every transaction matching the current filters (up to EXPORT_ROW_LIMIT), not just the visible page
  const handleExportTransactions = async () => {
    setExportNotice({ variant: '', text: '' });
    setExporting(true);

    try {
      // The API returns at most EXPORT_PAGE_SIZE rows per request, so collect the pages one by one
      const collected = [];
      let total = 0;

      for (let pageNumber = 1; collected.length < EXPORT_ROW_LIMIT; pageNumber += 1) {
        const response = await getTransactionHistory({ page: pageNumber, limit: EXPORT_PAGE_SIZE, ...filters });
        const pageRows = response?.data?.transactions || [];

        total = Number(response?.data?.pagination?.totalTransactions) || total;
        collected.push(...pageRows);

        if (pageRows.length === 0 || !response?.data?.pagination?.hasNextPage) break;
      }

      const rows = collected.slice(0, EXPORT_ROW_LIMIT);
      total = total || rows.length;

      if (rows.length === 0) {
        setExportNotice({ variant: 'warning', text: 'There are no transactions to export for the current filters.' });
        return;
      }

      const isOutgoing = (t) =>
        t.type === 'withdraw' || (t.type === 'transfer' && t.sender?._id === user?._id);

      const counterparty = (t) => {
        if (t.type !== 'transfer') return '';
        const other = t.sender?._id === user?._id ? t.receiver : t.sender;
        const name = `${other?.firstName || ''} ${other?.lastName || ''}`.trim();
        return name ? `${name} (${other?.accountNumber || ''})` : '';
      };

      const header = ['Date', 'Type', 'Direction', 'Amount (NGN)', 'Status', 'Transaction ID', 'Counterparty', 'Note']
        .map(toCsvTextCell)
        .join(',');

      const lines = rows.map((t) => [
        toCsvTextCell(formatDate(t.date)),
        toCsvTextCell(t.type),
        toCsvTextCell(isOutgoing(t) ? 'Out' : 'In'),
        (isOutgoing(t) ? -1 : 1) * Number(t.amount || 0),
        toCsvTextCell(t.status),
        toCsvTextCell(t.transactionId),
        toCsvTextCell(counterparty(t)),
        toCsvTextCell(t.description),
      ].join(','));

      // The BOM makes Excel read the file as UTF-8
      const blob = new Blob([`\uFEFF${[header, ...lines].join('\r\n')}`], { type: 'text/csv;charset=utf-8' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      setExportNotice({
        variant: 'success',
        text: total > rows.length
          ? `Exported the ${rows.length} most recent of ${total} matching transactions. Narrow the date range to export the rest.`
          : `Exported ${rows.length} transaction${rows.length === 1 ? '' : 's'}.`,
      });
    } catch (error) {
      console.error('Failed to export transactions:', error);
      setExportNotice({ variant: 'danger', text: 'Could not export transactions. Please try again.' });
    } finally {
      setExporting(false);
    }
  };

  // Show transaction details
  const handleViewTransactionDetails = async (transaction) => {
    setSelectedTransaction(transaction);
    setShowTransactionModal(true);

    if (!transaction?.transactionId) {
      return;
    }

    setTransactionDetailsLoading(true);
    try {
      const response = await getTransactionById(transaction.transactionId);
      if (response?.success && response?.data) {
        setSelectedTransaction(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch transaction details:', error);
    } finally {
      setTransactionDetailsLoading(false);
    }
  };

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getTransactionHistory({
        page: pagination.currentPage,
        limit: pagination.limit,
        ...filters
      });

      if (response.success && response.data) {
        setTransactions(response.data.transactions || []);
        setPagination(prev => ({ ...prev, ...response.data.pagination }));
      } else {
        setTransactions([]);
        setPagination(prev => ({
          ...prev,
          totalPages: 0,
          totalTransactions: 0,
          hasNextPage: false,
          hasPrevPage: false
        }));
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.limit]);

  const fetchNetActivity = useCallback(async () => {
    try {
      const now = new Date();
      const response = await getTransactionSummary({
        startDate: new Date(now.getFullYear(), now.getMonth(), 1).toISOString(),
        endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).toISOString(),
      });

      const net = Number(response?.data?.summary?.netAmount);
      setNetActivity(Number.isFinite(net) ? net : 0);
    } catch (error) {
      console.error('Failed to load net activity:', error);
      setNetActivity(0);
    }
  }, []);

  const fetchTransactionLimits = useCallback(async () => {
    setLimitsLoading(true);
    try {
      const response = await getTransactionLimits();
      if (response?.success && response?.data) {
        setTransactionLimits(response.data);
      } else {
        setTransactionLimits(null);
      }
    } catch (error) {
      console.error('Failed to fetch transaction limits:', error);
      setTransactionLimits(null);
    } finally {
      setLimitsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  useEffect(() => {
    fetchNetActivity();
  }, [fetchNetActivity]);

  useEffect(() => {
    fetchTransactionLimits();
  }, [fetchTransactionLimits]);

  // Throws an Error with a user-facing message when the form is not ready to submit
  const validateTransactionForm = () => {
    if (!actionType) {
      throw new Error('Select a transaction type first.');
    }

    const amountValidation = validateTransactionAmount(amount);
    if (amountValidation) {
      throw new Error(amountValidation);
    }

    if (actionType === 'transfer') {
      const accountValidation = validateAccountNumber(receiverAccountNumber);
      if (accountValidation) {
        throw new Error(accountValidation);
      }

      if (receiverLookup.loading) {
        throw new Error('Please wait while recipient account is being verified');
      }

      if (!receiverLookup.accountName) {
        throw new Error(receiverLookup.error || 'Recipient account must be verified before transfer');
      }
    }

    if (!/^\d{4}$/.test(String(transactionPin || '').trim())) {
      throw new Error('Enter a valid 4-digit transaction PIN.');
    }
  };

  const submitTransaction = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      validateTransactionForm();

      const parsedAmount = parseFloat(amount);
      let response;

      switch (actionType) {
        case 'transfer':
          response = await transferFunds({
            receiverAccountNumber,
            amount: parsedAmount,
            description: description.trim(),
            transactionPin
          });
          break;
        case 'deposit':
          response = await depositFunds(parsedAmount, transactionPin);
          break;
        case 'withdraw':
          response = await withdrawFunds(parsedAmount, transactionPin);
          break;
        default:
          throw new Error('Invalid transaction type');
      }

      if (!response.success) {
        throw new Error(response.message || 'Transaction failed');
      }

      const data = response.data || {};
      const reportedBalance = Number(data.newBalance ?? data.balance);
      const isTransfer = actionType === 'transfer';

      setReceipt({
        title: isTransfer ? 'Transfer successful' : actionType === 'deposit' ? 'Deposit successful' : 'Withdrawal successful',
        amount: parsedAmount,
        date: new Date(),
        transactionId: data.transactionId,
        recipientName: isTransfer ? (data.recipient?.name || receiverLookup.accountName) : undefined,
        recipientAccount: isTransfer ? (data.recipient?.accountNumber || receiverAccountNumber) : undefined,
        note: isTransfer ? description.trim() : undefined,
        newBalance: Number.isFinite(reportedBalance) ? reportedBalance : undefined,
        fee: isTransfer ? 0 : undefined,
      });
      setModalStep('receipt');
      setSaveBeneficiaryState({ status: 'idle', text: '' });

      setAmount('');
      setDescription('');
      setReceiverAccountNumber('');
      setTransactionPin('');
      setReceiverLookup({ loading: false, accountName: '', resolvedAccountNumber: '', error: '' });

      await Promise.all([
        fetchTransactions(),
        fetchNetActivity(),
        fetchTransactionLimits(),
        refreshUser(),
      ]);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Transaction failed',
      });
    } finally {
      setLoading(false);
    }
  };

  // Transfers get a review step first; deposits and withdrawals are submitted straight away
  const handleFormSubmit = (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    try {
      validateTransactionForm();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
      return;
    }

    if (actionType === 'transfer') {
      setModalStep('review');
      return;
    }

    submitTransaction();
  };

  const handleSaveBeneficiary = async () => {
    if (!receipt?.recipientAccount) return;

    setSaveBeneficiaryState({ status: 'saving', text: '' });
    try {
      const result = await createBeneficiary(receipt.recipientAccount);
      setSaveBeneficiaryState(
        result?.success
          ? { status: 'saved', text: 'Saved to your beneficiaries.' }
          : { status: 'error', text: result?.message || 'Could not save this beneficiary.' }
      );
    } catch (error) {
      setSaveBeneficiaryState({
        status: 'error',
        text: error.response?.data?.message || 'Could not save this beneficiary.',
      });
    }
  };

  const handleSendAgain = () => {
    openProtectedAction('transfer');
  };

  const isTransferSubmitDisabled =
    loading ||
    !actionType ||
    (actionType === 'transfer' && (
      receiverLookup.loading ||
      !receiverLookup.accountName ||
      receiverLookup.resolvedAccountNumber !== receiverAccountNumber.trim() ||
      !!receiverLookup.error
    )) ||
    transactionPin.trim().length !== 4;

  const balanceChangeDirection = netActivity > 0 ? 'positive' : netActivity < 0 ? 'negative' : 'neutral';
  const formattedBalanceChange = `${netActivity > 0 ? '+' : netActivity < 0 ? '-' : ''}${formatMoney(Math.abs(netActivity))}`;
  const hasActiveFilters = Boolean(
    filters.type !== 'all' || filters.search || filters.startDate || filters.endDate || filters.minAmount || filters.maxAmount
  );
  const activeLimitOperation = actionType === 'transfer' || actionType === 'withdraw' ? actionType : null;
  const activeOperationLimits = activeLimitOperation ? transactionLimits?.operations?.[activeLimitOperation] : null;
  const activeDailySeverity = getLimitSeverity(activeOperationLimits?.daily);
  const activeMonthlySeverity = getLimitSeverity(activeOperationLimits?.monthly);

  return (
    <>
      {styles && <style>{styles}</style>}

      {/* Balance Card */}
      <div className="balance-section">
        <div className="balance-card">
          <div className="card-header">
            <div className="card-title">
              <h3>Total Balance</h3>
              <span className="account-number">•••• {user?.accountNumber?.slice(-4)}</span>
              <CopyButton
                value={user?.accountNumber}
                label="Copy number"
                ariaLabel="Copy your full account number"
                className="ms-2 small"
              />
            </div>
            <button
              type="button"
              className="balance-visibility-btn"
              onClick={() => setShowBalanceAmount((prev) => !prev)}
              aria-label={showBalanceAmount ? 'Hide balance amount' : 'Show balance amount'}
            >
              {showBalanceAmount ? (
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                  <path d="M13.359 11.238l1.494 1.494a.5.5 0 0 1-.707.707l-1.57-1.57A8.7 8.7 0 0 1 8 13.5C3 13.5 0 8 0 8a16 16 0 0 1 2.249-2.993L.146 2.854a.5.5 0 1 1 .708-.708l14 14a.5.5 0 0 1-.708.708zM11.297 9.176l-1.56-1.56a2 2 0 0 1-2.56-2.56l-1.56-1.56C4.409 4.228 3.34 5.25 2.545 6.372A13 13 0 0 0 1.173 8c.411.697 1.069 1.652 1.959 2.543C4.42 11.832 6.179 13 8 13c1.518 0 2.85-.647 3.929-1.762l-.632-.632z" />
                  <path d="M10.523 7.695l-2.218-2.218a2 2 0 0 1 2.218 2.218m4.474.305a13 13 0 0 1-.672 1.104l-1.03-1.03q.175-.284.31-.565c-.411-.696-1.07-1.651-1.96-2.542C10.58 4.168 8.82 3 7 3q-.607 0-1.175.138l-.858-.859A7.1 7.1 0 0 1 7 2.5c5 0 8 5.5 8 5.5" />
                </svg>
              )}
            </button>
          </div>
          <div className="balance-amount">
            <span className="currency">₦</span>
            <span className="amount">{showBalanceAmount ? formatPlainAmount(user?.balance) : '•••••••'}</span>
          </div>
          <div className="balance-change">
            <span className={`change ${balanceChangeDirection}`}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                {balanceChangeDirection === 'negative' ? (
                  <path d="M9,4H15V12H19.84L12,19.84L4.16,12H9V4Z" />
                ) : balanceChangeDirection === 'neutral' ? (
                  <path d="M4,11H20V13H4V11Z" />
                ) : (
                  <path d="M15,20H9V12H4.16L12,4.16L19.84,12H15V20Z" />
                )}
              </svg>
              {formattedBalanceChange}
            </span>
            <span className="change-period">net activity this month</span>
          </div>
        </div>
      </div>

      {!hasTransactionPin && (
        <div className="transfer-alert error" style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', width: '100%' }}>
            <span>Set your transaction PIN to enable transfer, deposit, and withdrawal actions.</span>
            <button
              type="button"
              className="clear-filters-btn"
              onClick={() => navigate('/profile?tab=security')}
            >
              Set PIN
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="cta-btn primary" onClick={() => openProtectedAction('transfer')}>
          <div className="btn-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2,9V15H4.5L12,7.5L19.5,15H22V9L12,4L2,9Z" />
            </svg>
          </div>
          <span>Send Money</span>
        </button>
        <button className="cta-btn secondary" onClick={() => openProtectedAction('deposit')}>
          <div className="btn-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11,13H13V7H11M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
            </svg>
          </div>
          <span>Add Money</span>
        </button>
        <button className="cta-btn secondary" onClick={() => openProtectedAction('withdraw')}>
          <div className="btn-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,7V13H13V7H11M11,15V17H13V15H11Z" />
            </svg>
          </div>
          <span>Withdraw</span>
        </button>
      </div>

      <div className="limits-overview">
        <div className="limits-overview-header">
          <h3>Transaction Limits</h3>
          <span className="tier-chip">Tier: {transactionLimits?.tier || 'unverified'}</span>
        </div>

        <p className="limits-muted small mb-3">
          Your account tier sets how much you can send and withdraw each day and month. In this demo, an admin assigns tiers.
        </p>

        {limitsLoading && !transactionLimits ? (
          <p className="limits-muted">Loading current limits...</p>
        ) : !transactionLimits ? (
          <p className="limits-muted">Limits are unavailable right now.</p>
        ) : (
          <div className="limits-grid">
            <div className="limit-card">
              <h4>Withdraw</h4>
              <LimitMeter label="Daily" bucket={transactionLimits?.operations?.withdraw?.daily} />
              <LimitMeter label="Monthly" bucket={transactionLimits?.operations?.withdraw?.monthly} />
            </div>
            <div className="limit-card">
              <h4>Transfer</h4>
              <LimitMeter label="Daily" bucket={transactionLimits?.operations?.transfer?.daily} />
              <LimitMeter label="Monthly" bucket={transactionLimits?.operations?.transfer?.monthly} />
            </div>
          </div>
        )}
      </div>

      {showPinGuardModal && (
        <div className="transfer-modal-overlay">
          <div className="transfer-modal-content">
            <div className="transfer-modal-header">
              <h3>Transaction PIN Required</h3>
              <button
                className="close-modal-btn"
                onClick={() => setShowPinGuardModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>
            <div className="transfer-form-group" style={{ marginBottom: '1.2rem' }}>
              <p className="transfer-text-muted" style={{ margin: 0 }}>
                Set your 4-digit transaction PIN before you can perform transfer, deposit, or withdrawal actions.
              </p>
            </div>
            <button
              type="button"
              className="transfer-submit-btn"
              onClick={() => {
                setShowPinGuardModal(false);
                navigate('/profile?tab=security');
              }}
            >
              Go to Security Settings
            </button>
          </div>
        </div>
      )}

      {/* Transaction Modal */}
      {actionType && (
        <div className="transfer-modal-overlay">
          <div className="transfer-modal-content">
            <div className="transfer-modal-header">
              <h3>
                {modalStep === 'receipt'
                  ? 'Receipt'
                  : modalStep === 'review'
                    ? 'Review transfer'
                    : `${actionType.charAt(0).toUpperCase() + actionType.slice(1)} Money`}
              </h3>
              <button
                className="close-modal-btn"
                onClick={closeTransactionModal}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>

            {message.text && (
              <div className={`transfer-alert ${message.type === 'success' ? 'success' : 'error'}`}>
                {message.text}
              </div>
            )}

            {modalStep === 'form' && (
            <form onSubmit={handleFormSubmit} className="transfer-form">
              {actionType === 'deposit' && (
                <Alert variant="info" className="small py-2">
                  Demo top-up: this adds practice money to your account instantly. No real payment is taken.
                </Alert>
              )}

              {activeOperationLimits && (
                <div className="limit-inline-note">
                  <span className={activeDailySeverity}>{activeLimitOperation === 'transfer' ? 'Transfer' : 'Withdraw'} Daily Remaining: <strong>{formatCurrencyValue(activeOperationLimits?.daily?.remaining)}</strong></span>
                  <span className={activeMonthlySeverity}>{activeLimitOperation === 'transfer' ? 'Transfer' : 'Withdraw'} Monthly Remaining: <strong>{formatCurrencyValue(activeOperationLimits?.monthly?.remaining)}</strong></span>
                </div>
              )}

              <div className="transfer-form-group">
                <label className="transfer-form-label">Amount</label>
                <div className="transfer-input-group">
                  <span className="transfer-input-prefix">₦</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formatWithCommas(amount)}
                    onChange={e => {
                      const raw = unformatCommas(e.target.value.replace(/[^\d.]/g, ''));
                      if (/^\d*(\.\d{0,2})?$/.test(raw)) {
                        setAmount(raw);
                      }
                    }}
                    placeholder="0.00"
                    className="transfer-form-input"
                    required
                    min="1"
                    step="0.01"
                  />
                </div>
              </div>

              {actionType === 'transfer' && (
                <>
                  <div className="transfer-form-group">
                    <label className="transfer-form-label">Recipient Account Number</label>
                    <input
                      key={`receiver-account-${transferModalSession}`}
                      ref={receiverAccountInputRef}
                      type="text"
                      value={receiverAccountNumber}
                      onChange={(e) => setReceiverAccountNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit account number"
                      className="transfer-form-input"
                      required
                      maxLength="10"
                      minLength="10"
                      autoComplete="new-password"
                      name={`receiver-account-number-${transferModalSession}`}
                      id={`receiver-account-number-${transferModalSession}`}
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      data-lpignore="true"
                      inputMode="numeric"
                    />
                    {receiverLookup.loading && (
                      <small className="transfer-text-muted">Checking account name...</small>
                    )}
                    {!receiverLookup.loading && receiverLookup.accountName && (
                      <small className="transfer-text-success">Recipient: {receiverLookup.accountName}</small>
                    )}
                    {!receiverLookup.loading && receiverLookup.error && receiverAccountNumber.trim().length === 10 && (
                      <small className="transfer-text-danger">{receiverLookup.error}</small>
                    )}
                  </div>
                  <div className="transfer-form-group">
                    <label className="transfer-form-label">Description (Optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="What's this for?"
                      className="transfer-form-textarea"
                      rows="2"
                      maxLength="200"
                    />
                  </div>
                </>
              )}

              <div className="transfer-form-group">
                <PasswordField
                  label="Transaction PIN"
                  labelClassName="transfer-form-label"
                  inputClassName="transfer-form-input"
                  groupClassName=""
                  value={transactionPin}
                  onChange={(e) => setTransactionPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="Enter 4-digit transaction PIN"
                  required
                  maxLength="4"
                />
                <small className="transfer-text-muted">Required to authorize this transaction.</small>
              </div>

              <AppButton
                type="submit"
                className="transfer-submit-btn"
                disabled={isTransferSubmitDisabled}
                loading={loading}
                loadingText="Processing..."
                backgroundColor="var(--navy)"
              >
                {actionType === 'transfer'
                  ? 'Review transfer'
                  : `Confirm ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`}
              </AppButton>
            </form>
            )}

            {modalStep === 'review' && (
              <div>
                <p className="text-muted small mb-3">Check the details below. Transfers can&apos;t be undone.</p>
                <ListGroup variant="flush" className="mb-3">
                  <ListGroup.Item className="d-flex justify-content-between px-0">
                    <span className="text-muted">Amount</span>
                    <strong>{formatMoney(parseFloat(amount) || 0)}</strong>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between align-items-start gap-3 px-0">
                    <span className="text-muted">To</span>
                    <span className="text-end">
                      <strong>{receiverLookup.accountName}</strong>
                      <div className="small text-muted font-monospace">{receiverAccountNumber}</div>
                    </span>
                  </ListGroup.Item>
                  {description.trim() && (
                    <ListGroup.Item className="d-flex justify-content-between align-items-start gap-3 px-0">
                      <span className="text-muted">Note</span>
                      <span className="text-end" style={{ overflowWrap: 'anywhere' }}>{description.trim()}</span>
                    </ListGroup.Item>
                  )}
                  <ListGroup.Item className="d-flex justify-content-between px-0">
                    <span className="text-muted">Fee</span>
                    <span>{formatMoney(0)}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between px-0">
                    <span className="text-muted">Total debited</span>
                    <strong>{formatMoney(parseFloat(amount) || 0)}</strong>
                  </ListGroup.Item>
                </ListGroup>

                <div className="d-flex gap-2">
                  <Button
                    type="button"
                    variant="outline-secondary"
                    className="flex-fill"
                    onClick={() => {
                      setMessage({ type: '', text: '' });
                      setModalStep('form');
                    }}
                    disabled={loading}
                  >
                    Back
                  </Button>
                  <AppButton
                    type="button"
                    className="flex-fill"
                    backgroundColor="var(--navy)"
                    loading={loading}
                    loadingText="Sending..."
                    onClick={submitTransaction}
                  >
                    {`Send ${formatMoney(parseFloat(amount) || 0)}`}
                  </AppButton>
                </div>
              </div>
            )}

            {modalStep === 'receipt' && receipt && (
              <div>
                <TransactionReceipt receipt={receipt} />

                {saveBeneficiaryState.text && (
                  <Alert
                    variant={saveBeneficiaryState.status === 'saved' ? 'success' : 'warning'}
                    className="small py-2"
                  >
                    {saveBeneficiaryState.text}
                  </Alert>
                )}

                <div className="d-flex flex-wrap gap-2">
                  <Button type="button" variant="dark" className="flex-fill" onClick={closeTransactionModal}>
                    Done
                  </Button>
                  {receipt.recipientAccount && (
                    <>
                      <Button type="button" variant="outline-dark" className="flex-fill" onClick={handleSendAgain}>
                        Send again
                      </Button>
                      {saveBeneficiaryState.status !== 'saved' && (
                        <Button
                          type="button"
                          variant="outline-secondary"
                          className="flex-fill"
                          onClick={handleSaveBeneficiary}
                          disabled={saveBeneficiaryState.status === 'saving'}
                        >
                          {saveBeneficiaryState.status === 'saving' ? 'Saving...' : 'Save as beneficiary'}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="transactions-section">
        <div className="section-header">
          <h3>Transaction History</h3>
          <div className="header-actions">
            <button
              className="filter-toggle-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,12V19.88C14.04,20.18 13.94,20.5 13.71,20.71C13.32,21.1 12.69,21.1 12.3,20.71L10.29,18.7C10.06,18.47 9.96,18.16 10,17.87V12H9.97L4.21,4.62C3.87,4.19 3.95,3.56 4.38,3.22C4.57,3.08 4.78,3 5,3V3H19V3C19.22,3 19.43,3.08 19.62,3.22C20.05,3.56 20.13,4.19 19.79,4.62L14.03,12H14Z" />
              </svg>
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <button
              type="button"
              className="export-btn"
              onClick={handleExportTransactions}
              disabled={exporting || pagination.totalTransactions === 0}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              {exporting ? 'Exporting...' : `Export CSV (${pagination.totalTransactions})`}
            </button>
          </div>
        </div>

        {exportNotice.text && (
          <Alert
            variant={exportNotice.variant || 'info'}
            dismissible
            onClose={() => setExportNotice({ variant: '', text: '' })}
            className="small py-2"
          >
            {exportNotice.text}
          </Alert>
        )}

        {/* Advanced Filters */}
        {showFilters && (
          <div className="filters-panel">
            <div className="filter-row">
              <div className="filter-group">
                <label>Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdraw">Withdrawals</option>
                  <option value="transfer">Transfers</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Search</label>
                <div className="search-group">
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Search transactions..."
                    maxLength={100}
                    className="search-input"
                  />
                  <select
                    value={filters.searchBy}
                    onChange={(e) => handleFilterChange('searchBy', e.target.value)}
                    className="search-type-select"
                  >
                    <option value="recipient">By Recipient</option>
                    <option value="transactionId">By Transaction ID</option>
                    <option value="amount">By Amount</option>
                    <option value="all">All Fields</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="filter-row">
              <div className="filter-group">
                <label>Date Range</label>
                <div className="date-range">
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                    className="date-input"
                  />
                  <span className="date-separator">to</span>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                    className="date-input"
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Amount Range</label>
                <div className="amount-range">
                  <input
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                    placeholder="Min"
                    className="amount-input"
                    min="0"
                    step="0.01"
                  />
                  <span className="amount-separator">-</span>
                  <input
                    type="number"
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                    placeholder="Max"
                    className="amount-input"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="filter-actions">
                <button className="clear-filters-btn" onClick={handleClearFilters}>
                  Clear All
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="table-container">
          {loading ? (
            <LoadingWatch label="Loading transactions..." minHeight="200px" />
          ) : (
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Transaction</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-state">
                    <div className="empty-content">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z" />
                      </svg>
                      {hasActiveFilters ? (
                        <>
                          <p>No transactions match your filters.</p>
                          <Button type="button" variant="outline-secondary" size="sm" onClick={handleClearFilters}>
                            Clear filters
                          </Button>
                        </>
                      ) : (
                        <>
                          <p>No transactions yet. Add some practice money to get started.</p>
                          <Button type="button" variant="dark" size="sm" onClick={() => openProtectedAction('deposit')}>
                            Add money
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, index) => (
                  <tr
                    key={transaction._id || index}
                    onClick={() => handleViewTransactionDetails(transaction)}
                    style={{ cursor: 'pointer' }}
                    title="Click to view details"
                  >
                    <td className="dashboard-text-cell">
                      <div className="transaction-info">
                        <div className={`transaction-icon ${transaction.type}`}>
                          {transaction.type === 'deposit' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M11,13H13V7H11M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                            </svg>
                          )}
                          {transaction.type === 'withdraw' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,7V13H13V7H11M11,15V17H13V15H11Z" />
                            </svg>
                          )}
                          {transaction.type === 'transfer' && (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M2,9V15H4.5L12,7.5L19.5,15H22V9L12,4L2,9Z" />
                            </svg>
                          )}
                        </div>
                        <div className="transaction-details">
                          <span className="transaction-title">
                            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                          </span>

                          {/* Show transaction ID as subtitle for all transactions */}
                          <span className="transaction-subtitle">
                            ID: {transaction.transactionId}
                          </span>

                          {/* For transfers, show recipient info */}
                          {transaction.type === 'transfer' && transaction.receiver?.accountNumber && (
                            <span className="transaction-subtitle">
                              To: {transaction.receiver.firstName} {transaction.receiver.lastName} (•••• {transaction.receiver.accountNumber.slice(-4)})
                            </span>
                          )}

                          {/* For received transfers, show sender info */}
                          {transaction.type === 'transfer' && transaction.sender?._id !== user?._id && transaction.sender?.accountNumber && (
                            <span className="transaction-subtitle">
                              From: {transaction.sender.firstName} {transaction.sender.lastName} (•••• {transaction.sender.accountNumber.slice(-4)})
                            </span>
                          )}

                          {transaction.description && (
                            <span className="transaction-subtitle">Note: {transaction.description}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="dashboard-text-cell">
                      <span className={`type-badge ${transaction.type}`}>
                        {transaction.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="dashboard-amount-cell">
                      <span className={`amount dashboard-amount-cell ${
                        // For withdrawals: always negative (money leaving account)
                        transaction.type === 'withdraw' ||
                          // For transfers: negative if current user is sender (money leaving)
                          (transaction.type === 'transfer' && transaction.sender?._id?.toString() === user?._id)
                          ? 'negative'
                          : 'positive'
                        }`}>
                        {/* Show - for money leaving account, + for money coming in */}
                        {transaction.type === 'withdraw' ||
                          (transaction.type === 'transfer' && transaction.sender?._id?.toString() === user?._id)
                          ? '-'
                          : '+'}{formatMoney(transaction.amount)}
                      </span>
                    </td>
                    <td className="date dashboard-text-cell">
                      {formatDate(transaction.date)}
                    </td>
                    <td className="dashboard-text-cell">
                      <span className={`status-badge ${transaction.status}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          )}
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              <span>
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} -
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalTransactions)}
                of {pagination.totalTransactions} transactions
              </span>
            </div>

            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
                </svg>
                Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }

                  return (
                    <button
                      key={pageNum}
                      className={`page-btn ${pageNum === pagination.currentPage ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                className="pagination-btn"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
              >
                Next
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Details Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="modal-overlay" onClick={() => setShowTransactionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Transaction Details</h4>
              <button
                className="close-btn"
                onClick={() => setShowTransactionModal(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
                </svg>
              </button>
            </div>

            <div className="modal-body">
              {transactionDetailsLoading && (
                <LoadingWatch label="Loading latest transaction details..." minHeight="80px" />
              )}
              <div className="transaction-detail-grid">
                <div className="detail-item">
                  <label>Transaction ID</label>
                  <span className="transaction-id-value">{selectedTransaction.transactionId}</span>
                </div>

                <div className="detail-item">
                  <label>Type</label>
                  <span className={`type-badge ${selectedTransaction.type}`}>
                    {selectedTransaction.type.toUpperCase()}
                  </span>
                </div>

                <div className="detail-item">
                  <label>Amount</label>
                  <span className={`amount ${selectedTransaction.type === 'withdraw' ||
                    (selectedTransaction.type === 'transfer' && selectedTransaction.sender?._id?.toString() === user?._id)
                    ? 'negative'
                    : 'positive'
                    }`}>
                    {selectedTransaction.type === 'withdraw' ||
                      (selectedTransaction.type === 'transfer' && selectedTransaction.sender?._id?.toString() === user?._id)
                      ? '-'
                      : '+'}{formatMoney(selectedTransaction.amount)}
                  </span>
                </div>

                <div className="detail-item">
                  <label>Status</label>
                  <span className={`status-badge ${selectedTransaction.status}`}>
                    {selectedTransaction.status}
                  </span>
                </div>

                <div className="detail-item">
                  <label>Date</label>
                  <span>{formatDateTime(selectedTransaction.date)}</span>
                </div>

                {selectedTransaction.type === 'transfer' && selectedTransaction.sender && (
                  <div className="detail-item">
                    <label>From</label>
                    <span>
                      {selectedTransaction.sender.firstName} {selectedTransaction.sender.lastName}
                      <br />
                      <small>Account: •••• {selectedTransaction.sender.accountNumber?.slice(-4)}</small>
                    </span>
                  </div>
                )}

                {selectedTransaction.type === 'transfer' && selectedTransaction.receiver && (
                  <div className="detail-item">
                    <label>To</label>
                    <span>
                      {selectedTransaction.receiver.firstName} {selectedTransaction.receiver.lastName}
                      <br />
                      <small>Account: •••• {selectedTransaction.receiver.accountNumber?.slice(-4)}</small>
                    </span>
                  </div>
                )}

                {selectedTransaction.description && (
                  <div className="detail-item">
                    <label>Note</label>
                    <span>{selectedTransaction.description}</span>
                  </div>
                )}

                {selectedTransaction.createdAt && (
                  <div className="detail-item">
                    <label>Created</label>
                    <span>{formatDateTime(selectedTransaction.createdAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;

Dashboard.propTypes = {
  styles: PropTypes.string,
};
import { useState, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import ZurichBrand from '../components/ZurichBrand';
import PasswordField from '../components/PasswordField';
import LoadingWatch from '../components/LoadingWatch';
import AppButton from '../components/AppButton';
import { renderSidebarNavLinks } from '../components/sidebarNavLinks';
import { getPremiumStatus } from '../utils/premiumStatus';
import {
  NOTIFICATIONS_UNREAD_UPDATED_EVENT,
  readStoredUnreadNotifications,
  publishUnreadNotifications,
} from '../utils/notificationEvents';
import {
  getTransactionHistory,
  getTransactionById,
  getTransactionLimits,
  resolveRecipientAccount,
  transferFunds,
  depositFunds,
  withdrawFunds,
  validateTransactionAmount,
  validateAccountNumber
} from '../services/transactionService';
import { getUnreadNotificationCount } from '../services/notificationService';

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

const formatDateForApi = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getMonthRange = (monthOffset = 0) => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + monthOffset;

  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);

  return {
    startDate: formatDateForApi(startDate),
    endDate: formatDateForApi(endDate),
  };
};

const getSignedTransactionAmount = (transaction, currentUserId) => {
  const amount = Number(transaction?.amount) || 0;
  const type = String(transaction?.type || '').toLowerCase();

  if (type === 'deposit') return amount;
  if (type === 'withdraw') return -amount;

  if (type === 'transfer') {
    const senderId = String(transaction?.sender?._id || '');
    const userId = String(currentUserId || '');

    if (!senderId || !userId) return 0;
    return senderId === userId ? -amount : amount;
  }

  return 0;
};

const getNetActivityAmount = (transactionList, currentUserId) => {
  const settledStatuses = new Set(['completed', 'complete', 'successful', 'success']);

  return (transactionList || []).reduce((total, transaction) => {
    const status = String(transaction?.status || '').toLowerCase();

    if (status && !settledStatuses.has(status)) {
      return total;
    }

    return total + getSignedTransactionAmount(transaction, currentUserId);
  }, 0);
};

const formatCurrencyValue = (value) => `₦${Number(value || 0).toLocaleString()}`;

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
  const { user, logout, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = user?.roles === 'admin' || user?.role === 'admin' || user?.isAdmin === true;
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [premiumStatus, setPremiumStatus] = useState({ isPremium: false });
  const [actionType, setActionType] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [withdrawalMethod, setWithdrawalMethod] = useState('cash'); // 'cash', 'atm', or 'external'
  const [externalBank, setExternalBank] = useState('');
  const [externalAccount, setExternalAccount] = useState('');
  const [atmPin, setAtmPin] = useState('');
  const [transactionPin, setTransactionPin] = useState('');
  const [receiverAccountNumber, setReceiverAccountNumber] = useState('');
  const [receiverLookup, setReceiverLookup] = useState({
    loading: false,
    accountName: '',
    resolvedAccountNumber: '',
    error: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile off-canvas state
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
  const [balanceChangePercent, setBalanceChangePercent] = useState(0);
  const [unreadNotifications, setUnreadNotifications] = useState(() => readStoredUnreadNotifications());
  const [transferModalSession, setTransferModalSession] = useState(0);
  const hasTransactionPin = Boolean(user?.hasTransactionPin);
  const transactionSuccessTimeoutRef = useRef(null);
  const receiverAccountInputRef = useRef(null);

  const closeTransactionModal = useCallback(() => {
    if (transactionSuccessTimeoutRef.current) {
      clearTimeout(transactionSuccessTimeoutRef.current);
      transactionSuccessTimeoutRef.current = null;
    }

    setActionType('');
    setDescription('');
    setAmount('');
    setReceiverAccountNumber('');
    setWithdrawalMethod('cash');
    setExternalBank('');
    setExternalAccount('');
    setAtmPin('');
    setTransactionPin('');
    setReceiverLookup({ loading: false, accountName: '', resolvedAccountNumber: '', error: '' });
    setMessage({ type: '', text: '' });
  }, []);

  const openProtectedAction = (nextActionType) => {
    setMessage({ type: '', text: '' });

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

  // Close mobile sidebar when route changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    setCookieValue(BALANCE_VISIBILITY_COOKIE, String(showBalanceAmount));
  }, [showBalanceAmount]);

  useEffect(() => {
    getPremiumStatus().then(setPremiumStatus);
  }, []);

  useEffect(() => () => {
    if (transactionSuccessTimeoutRef.current) {
      clearTimeout(transactionSuccessTimeoutRef.current);
    }
  }, []);

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
  const handleExportTransactions = () => {
    if (transactions.length === 0) {
      setMessage({
        type: 'error',
        text: 'No transactions to export'
      });
      return;
    }

    const csvContent = [
      ['Date', 'Type', 'Amount', 'Status', 'Transaction ID', 'Details'],
      ...transactions.map(t => [
        new Date(t.date).toLocaleDateString(),
        t.type.toUpperCase(),
        t.amount,
        t.status,
        t.transactionId,
        t.type === 'transfer' ?
          (t.sender?._id === user?._id ?
            `To: ${t.receiver?.firstName} ${t.receiver?.lastName}` :
            `From: ${t.sender?.firstName} ${t.sender?.lastName}`) :
          ''
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    setMessage({
      type: 'success',
      text: 'Transactions exported successfully'
    });
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

  const fetchBalanceChange = useCallback(async () => {
    try {
      const currentMonthRange = getMonthRange(0);
      const lastMonthRange = getMonthRange(-1);

      const [currentMonthResponse, lastMonthResponse] = await Promise.all([
        getTransactionHistory({
          page: 1,
          limit: 500,
          startDate: currentMonthRange.startDate,
          endDate: currentMonthRange.endDate,
        }),
        getTransactionHistory({
          page: 1,
          limit: 500,
          startDate: lastMonthRange.startDate,
          endDate: lastMonthRange.endDate,
        }),
      ]);

      const currentMonthTransactions = currentMonthResponse?.data?.transactions || [];
      const lastMonthTransactions = lastMonthResponse?.data?.transactions || [];

      const currentMonthNet = getNetActivityAmount(currentMonthTransactions, user?._id);
      const lastMonthNet = getNetActivityAmount(lastMonthTransactions, user?._id);

      const base = Math.abs(lastMonthNet);
      let computedPercent = 0;

      if (base < 0.01) {
        if (Math.abs(currentMonthNet) < 0.01) {
          computedPercent = 0;
        } else {
          computedPercent = currentMonthNet > 0 ? 100 : -100;
        }
      } else {
        computedPercent = ((currentMonthNet - lastMonthNet) / base) * 100;
      }

      setBalanceChangePercent(Number.isFinite(computedPercent) ? computedPercent : 0);
    } catch (error) {
      console.error('Failed to compute balance change:', error);
      setBalanceChangePercent(0);
    }
  }, [user?._id]);

  const fetchUnreadNotifications = useCallback(async () => {
    try {
      const response = await getUnreadNotificationCount();

      if (response?.success) {
        const nextUnreadCount = Number(response?.data?.unreadCount) || 0;
        setUnreadNotifications(nextUnreadCount);
        publishUnreadNotifications(nextUnreadCount);
      } else {
        setUnreadNotifications(0);
        publishUnreadNotifications(0);
      }
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
      setUnreadNotifications(0);
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
    fetchBalanceChange();
  }, [fetchBalanceChange]);

  useEffect(() => {
    fetchUnreadNotifications();
  }, [fetchUnreadNotifications]);

  useEffect(() => {
    fetchTransactionLimits();
  }, [fetchTransactionLimits]);

  useEffect(() => {
    const onUnreadNotificationsUpdated = (event) => {
      const nextUnreadCount = Number(event?.detail?.unreadCount);
      if (Number.isFinite(nextUnreadCount) && nextUnreadCount >= 0) {
        setUnreadNotifications(nextUnreadCount);
      }
    };

    window.addEventListener(NOTIFICATIONS_UNREAD_UPDATED_EVENT, onUnreadNotificationsUpdated);
    return () => {
      window.removeEventListener(NOTIFICATIONS_UNREAD_UPDATED_EVENT, onUnreadNotificationsUpdated);
    };
  }, []);

  const handleTransaction = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Validate amount
      const amountValidation = validateTransactionAmount(amount);
      if (amountValidation) {
        throw new Error(amountValidation);
      }

      // Validate account number for transfer
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

      if (!actionType) {
        throw new Error('Select a transaction type first.');
      }

      if (!/^\d{4}$/.test(String(transactionPin || '').trim())) {
        throw new Error('Enter a valid 4-digit transaction PIN.');
      }

      let response;

      // Call the appropriate service function
      switch (actionType) {
        case 'transfer':
          response = await transferFunds({
            receiverAccountNumber,
            amount: parseFloat(amount),
            description: description.trim(),
            transactionPin
          });
          // Set a very specific success message mapped to the transaction type
          if (response.success) {
            response.message = 'Transfer completed successfully.';
          }
          break;
        case 'deposit':
          response = await depositFunds(parseFloat(amount), transactionPin);
          if (response.success) {
            response.message = 'Deposit completed successfully.';
          }
          break;
        case 'withdraw':
          response = await withdrawFunds(parseFloat(amount), transactionPin);
          if (response.success) {
            response.message = 'Withdrawal completed successfully.';
          }
          break;
        default:
          throw new Error('Invalid transaction type');
      }

      if (response.success) {
        setMessage({
          type: 'success',
          text: response.message || 'Transaction completed successfully.',
        });
        setAmount('');
        setDescription('');
        setReceiverAccountNumber('');
        setTransactionPin('');
        setReceiverLookup({ loading: false, accountName: '', resolvedAccountNumber: '', error: '' });
        await fetchTransactions();
        await fetchBalanceChange();
        await fetchTransactionLimits();
        await refreshUser();

        if (transactionSuccessTimeoutRef.current) {
          clearTimeout(transactionSuccessTimeoutRef.current);
        }

        transactionSuccessTimeoutRef.current = setTimeout(() => {
          closeTransactionModal();
        }, 4000);
      } else {
        throw new Error(response.message || 'Transaction failed');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || error.message || 'Transaction failed',
      });
    } finally {
      setLoading(false);
    }
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
    (actionType === 'withdraw' && (
      (withdrawalMethod === 'atm' && atmPin.length < 4) ||
      (withdrawalMethod === 'external' && (!externalBank || externalAccount.length < 10))
    )) ||
    transactionPin.trim().length !== 4;

  const balanceChangeDirection = balanceChangePercent > 0 ? 'positive' : balanceChangePercent < 0 ? 'negative' : 'neutral';
  const formattedBalanceChange = `${balanceChangePercent > 0 ? '+' : ''}${balanceChangePercent.toFixed(1)}%`;
  const activeLimitOperation = actionType === 'transfer' || actionType === 'withdraw' ? actionType : null;
  const activeOperationLimits = activeLimitOperation ? transactionLimits?.operations?.[activeLimitOperation] : null;
  const withdrawDailySeverity = getLimitSeverity(transactionLimits?.operations?.withdraw?.daily);
  const withdrawMonthlySeverity = getLimitSeverity(transactionLimits?.operations?.withdraw?.monthly);
  const transferDailySeverity = getLimitSeverity(transactionLimits?.operations?.transfer?.daily);
  const transferMonthlySeverity = getLimitSeverity(transactionLimits?.operations?.transfer?.monthly);
  const activeDailySeverity = getLimitSeverity(activeOperationLimits?.daily);
  const activeMonthlySeverity = getLimitSeverity(activeOperationLimits?.monthly);

  return (
    <>
      {styles && <style>{styles}</style>}
      <div className="fintech-dashboard">
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

        {/* Mobile overlay - appears when sidebar is open on small screens */}
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
                <h1 className="page-title">Dashboard</h1>
                <p className="page-subtitle">Welcome back, {user?.firstName || user?.userName}</p>
              </div>
            </div>
            <div className="header-right">
              <button
                type="button"
                className="notifications-btn"
                aria-label="Open notifications"
                onClick={() => navigate('/notifications')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12,22A2,2 0 0,0 14,20H10A2,2 0 0,0 12,22M18,16V11A6,6 0 0,0 12,5A6,6 0 0,0 6,11V16L4,18V19H20V18L18,16Z" />
                </svg>
                {unreadNotifications > 0 && (
                  <span className="notifications-badge">{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>
                )}
              </button>
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

          {/* Balance Card */}
          <div className="balance-section">
            <div className="balance-card">
              <div className="card-header">
                <div className="card-title">
                  <h3>Total Balance</h3>
                  <span className="account-number">•••• {user?.accountNumber?.slice(-4)}</span>
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
                <span className="amount">{showBalanceAmount ? (user?.balance?.toLocaleString() || '0') : '•••••••'}</span>
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
                <span className="change-period">vs last month activity</span>
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

            {limitsLoading ? (
              <p className="limits-muted">Loading current limits...</p>
            ) : (
              <div className="limits-grid">
                <div className="limit-card">
                  <h4>Withdraw</h4>
                  <p className={`limit-line ${withdrawDailySeverity}`}>Daily Remaining: <strong>{formatCurrencyValue(transactionLimits?.operations?.withdraw?.daily?.remaining)}</strong></p>
                  <p className={`limit-line ${withdrawMonthlySeverity}`}>Monthly Remaining: <strong>{formatCurrencyValue(transactionLimits?.operations?.withdraw?.monthly?.remaining)}</strong></p>
                </div>
                <div className="limit-card">
                  <h4>Transfer</h4>
                  <p className={`limit-line ${transferDailySeverity}`}>Daily Remaining: <strong>{formatCurrencyValue(transactionLimits?.operations?.transfer?.daily?.remaining)}</strong></p>
                  <p className={`limit-line ${transferMonthlySeverity}`}>Monthly Remaining: <strong>{formatCurrencyValue(transactionLimits?.operations?.transfer?.monthly?.remaining)}</strong></p>
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
                  <h3>{actionType.charAt(0).toUpperCase() + actionType.slice(1)} Money</h3>
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

                <form onSubmit={handleTransaction} className="transfer-form">
                  {activeOperationLimits && (
                    <div className="limit-inline-note">
                      <span className={activeDailySeverity}>{activeLimitOperation === 'transfer' ? 'Transfer' : 'Withdraw'} Daily Remaining: <strong>{formatCurrencyValue(activeOperationLimits?.daily?.remaining)}</strong></span>
                      <span className={activeMonthlySeverity}>{activeLimitOperation === 'transfer' ? 'Transfer' : 'Withdraw'} Monthly Remaining: <strong>{formatCurrencyValue(activeOperationLimits?.monthly?.remaining)}</strong></span>
                    </div>
                  )}

                  {actionType === 'withdraw' && (
                    <div className="transfer-method-selector">
                      <label className="transfer-form-label">Withdrawal Method</label>
                      <div className="method-cards-grid">
                        <button
                          type="button"
                          className={`method-card ${withdrawalMethod === 'cash' ? 'active' : ''}`}
                          onClick={() => setWithdrawalMethod('cash')}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3,6H21V18H3V6M12,9A3,3 0 0,1 15,12A3,3 0 0,1 12,15A3,3 0 0,1 9,12A3,3 0 0,1 12,9M7,8A2,2 0 0,1 5,10V14A2,2 0 0,1 7,16H17A2,2 0 0,1 19,14V10A2,2 0 0,1 17,8H7Z" />
                          </svg>
                          <span>Cash</span>
                        </button>
                        <button
                          type="button"
                          className={`method-card ${withdrawalMethod === 'atm' ? 'active' : ''}`}
                          onClick={() => setWithdrawalMethod('atm')}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M4,3H20A2,2 0 0,1 22,5V19A2,2 0 0,1 20,21H4A2,2 0 0,1 2,19V5A2,2 0 0,1 4,3M4,7V19H20V7H4M10,9H14V13H10V9M11,10V12H13V10H11M6,14H8V16H6V14M6,17H8V19H6V17M9,14H11V16H9V14M9,17H11V19H9V17M12,14H14V16H12V14M12,17H14V19H12V17M15,14H18V16H15V14M15,17H18V19H15V17Z" />
                          </svg>
                          <span>ATM</span>
                        </button>
                        <button
                          type="button"
                          className={`method-card ${withdrawalMethod === 'external' ? 'active' : ''}`}
                          onClick={() => setWithdrawalMethod('external')}
                        >
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.5,1L2,6V8H21V6M16,10V17H19V10M2,22H21V19H2M10,10V17H13V10M4,10V17H7V10H4Z" />
                          </svg>
                          <span>Bank</span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="transfer-form-group">
                    <label className="transfer-form-label">Amount</label>
                    <div className="transfer-input-group">
                      <span className="transfer-input-prefix">₦</span>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
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

                  {actionType === 'withdraw' && withdrawalMethod === 'atm' && (
                    <div className="transfer-form-group">
                      <PasswordField
                        label="ATM PIN"
                        labelClassName="transfer-form-label"
                        inputClassName="transfer-form-input"
                        groupClassName=""
                        value={atmPin}
                        onChange={(e) => setAtmPin(e.target.value.replace(/\D/g, '').substring(0, 4))}
                        placeholder="••••"
                        required
                        maxLength="4"
                      />
                      <small className="transfer-text-muted">Enter a 4-digit PIN for verification.</small>
                    </div>
                  )}

                  {actionType === 'withdraw' && withdrawalMethod === 'external' && (
                    <>
                      <div className="transfer-form-group">
                        <label className="transfer-form-label">Destination Bank Name</label>
                        <select
                          value={externalBank}
                          onChange={(e) => setExternalBank(e.target.value)}
                          className="transfer-form-input"
                          required
                        >
                          <option value="">Select a Bank...</option>
                          <option value="chase">Chase Bank</option>
                          <option value="bofa">Bank of America</option>
                          <option value="wells">Wells Fargo</option>
                          <option value="citi">Citibank</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="transfer-form-group">
                        <label className="transfer-form-label">Account Number</label>
                        <input
                          type="text"
                          value={externalAccount}
                          onChange={(e) => setExternalAccount(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter account number"
                          className="transfer-form-input"
                          required
                          minLength="5"
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
                    {`Confirm ${actionType.charAt(0).toUpperCase() + actionType.slice(1)}`}
                  </AppButton>
                </form>
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
                <button className="export-btn" onClick={handleExportTransactions}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                  </svg>
                  Export ({pagination.totalTransactions})
                </button>
              </div>
            </div>

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
                          <p>{filters.type === 'all' ? 'No transactions found' : `No ${filters.type} transactions found`}</p>
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
                              : '+'}₦{transaction.amount?.toLocaleString()}
                          </span>
                        </td>
                        <td className="date dashboard-text-cell">
                          {new Date(transaction.date).toLocaleDateString()}
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
                        : '+'}₦{selectedTransaction.amount?.toLocaleString()}
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
                    <span>{new Date(selectedTransaction.date).toLocaleString()}</span>
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

                  {selectedTransaction.createdAt && (
                    <div className="detail-item">
                      <label>Created</label>
                      <span>{new Date(selectedTransaction.createdAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;

Dashboard.propTypes = {
  styles: PropTypes.string,
};
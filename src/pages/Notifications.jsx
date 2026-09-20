import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ZurichBrand from '../components/ZurichBrand';
import LoadingWatch from '../components/LoadingWatch';
import { renderSidebarNavLinks } from '../components/sidebarNavLinks';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService';
import { publishUnreadNotifications } from '../utils/notificationEvents';
import AppButton from '../components/AppButton';
import { formatDateTime } from '../utils/formatters';

const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: '' },
  { label: 'Debit', value: 'debit' },
  { label: 'Credit', value: 'credit' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'Security', value: 'security' },
];

const LIMIT_OPTIONS = [10, 20, 50, 100];

const Notifications = ({ styles }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isAdmin = user?.roles === 'admin' || user?.role === 'admin' || user?.isAdmin === true;

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    unreadOnly: false,
    category: '',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalNotifications: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [unreadCount, setUnreadCount] = useState(0);

  const [markingNotificationId, setMarkingNotificationId] = useState('');
  const [markingAll, setMarkingAll] = useState(false);

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

  const fetchNotificationList = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await getNotifications({
        page: filters.page,
        limit: filters.limit,
        unreadOnly: filters.unreadOnly,
        category: filters.category,
      });

      if (response?.success) {
        const data = response?.data || {};
        const nextUnreadCount = Number(data?.unreadCount) || 0;
        setNotifications(data?.notifications || []);
        setUnreadCount(nextUnreadCount);
        publishUnreadNotifications(nextUnreadCount);
        setPagination(data?.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalNotifications: 0,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } else {
        setNotifications([]);
        setUnreadCount(0);
        publishUnreadNotifications(0);
      }
    } catch (fetchError) {
      setError(fetchError?.response?.data?.message || 'Failed to fetch notifications');
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchNotificationList();
  }, [fetchNotificationList]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? value : 1,
    }));
  };

  const handleMarkAsRead = async (notificationId) => {
    setMarkingNotificationId(notificationId);
    setError('');

    try {
      const response = await markNotificationAsRead(notificationId);
      if (response?.success) {
        await fetchNotificationList();
      }
    } catch (markError) {
      setError(markError?.response?.data?.message || 'Failed to mark notification as read');
    } finally {
      setMarkingNotificationId('');
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);
    setError('');

    try {
      const response = await markAllNotificationsAsRead();
      if (response?.success) {
        await fetchNotificationList();
      }
    } catch (markAllError) {
      setError(markAllError?.response?.data?.message || 'Failed to mark all notifications as read');
    } finally {
      setMarkingAll(false);
    }
  };

  const hasUnreadNotifications = unreadCount > 0;

  return (
    <>
      {styles && <style>{styles}</style>}
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
                <h1 className="page-title">Notifications</h1>
                <p className="page-subtitle">Track activity alerts and control email preference by category.</p>
              </div>
            </div>
            <div className="header-right">
              <span className={`notification-status ${hasUnreadNotifications ? 'unread' : ''}`}>
                {hasUnreadNotifications ? `${unreadCount} unread` : 'All caught up'}
              </span>
            </div>
          </header>

          <div className="dashboard-container">
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="notifications-controls">
              <div className="filter-row">
                <div className="filter-group">
                  <label>Category</label>
                  <select
                    className="filter-select"
                    value={filters.category}
                    onChange={(event) => handleFilterChange('category', event.target.value)}
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value || 'all'} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-group">
                  <label>Show</label>
                  <select
                    className="filter-select"
                    value={filters.unreadOnly ? 'unread' : 'all'}
                    onChange={(event) => handleFilterChange('unreadOnly', event.target.value === 'unread')}
                  >
                    <option value="all">All Notifications</option>
                    <option value="unread">Unread Only</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Rows</label>
                  <select
                    className="filter-select"
                    value={filters.limit}
                    onChange={(event) => handleFilterChange('limit', Number(event.target.value))}
                  >
                    {LIMIT_OPTIONS.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-actions" style={{ display: 'flex', gap: '12px' }}>
                  <AppButton
                    type="button"
                    className="clear-filters-btn"
                    backgroundColor="transparent"
                    textColor="var(--navy)"
                    borderColor="var(--border-light, #D1D5DB)"
                    onClick={() => setFilters({ unreadOnly: false, category: '', page: 1, limit: 20 })}
                  >
                    Reset
                  </AppButton>
                  <AppButton
                    type="button"
                    className="submit-btn primary"
                    backgroundColor="var(--navy)"
                    onClick={handleMarkAllAsRead}
                    disabled={markingAll || !hasUnreadNotifications}
                  >
                    {markingAll ? 'Marking...' : 'Mark all as read'}
                  </AppButton>
                </div>
              </div>
            </div>

            <div className="transactions-section" style={{ marginBottom: '1rem' }}>
              <div className="section-header">
                <h3>Inbox</h3>
              </div>

              {loading ? (
                <LoadingWatch label="Loading notifications..." minHeight="120px" />
              ) : (
                <div className="table-container">
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-4">
                            <p className="mb-1 fw-semibold">
                              {filters.unreadOnly || filters.category ? 'No notifications match these filters.' : "You're all caught up."}
                            </p>
                            <p className="text-muted small mb-0">
                              {filters.unreadOnly || filters.category
                                ? 'Try resetting the filters to see everything.'
                                : 'Alerts about your money and account security will show up here.'}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        notifications.map((notification) => (
                          <tr key={notification._id}>
                            <td>{notification.title}</td>
                            <td>
                              <span className={`notification-category notification-${notification.category}`}>
                                {String(notification.category || '').toUpperCase()}
                              </span>
                            </td>
                            <td>{notification.message}</td>
                            <td>{notification.isRead ? 'Read' : 'Unread'}</td>
                            <td>{formatDateTime(notification.createdAt)}</td>
                            <td>
                              {!notification.isRead ? (
                                <AppButton
                                  type="button"
                                  size="sm"
                                  backgroundColor="transparent"
                                  textColor="var(--accent, #3B82F6)"
                                  borderColor="var(--accent, #3B82F6)"
                                  className="mark-read-btn"
                                  onClick={() => handleMarkAsRead(notification._id)}
                                  disabled={markingNotificationId === notification._id}
                                >
                                  {markingNotificationId === notification._id ? 'Marking...' : 'Mark as read'}
                                </AppButton>
                              ) : (
                                <span className="notification-read-tag">Done</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="pagination-controls" style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '1rem', justifyContent: 'flex-start' }}>
                <AppButton
                  type="button"
                  size="sm"
                  backgroundColor="var(--silver-light, #f4f4f5)"
                  textColor="var(--navy)"
                  className="pagination-btn"
                  onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                  disabled={!pagination.hasPrevPage || loading}
                >
                  Previous
                </AppButton>
                <span className="pagination-info" style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Page {pagination.currentPage || filters.page} of {pagination.totalPages || 1}
                </span>
                <AppButton
                  type="button"
                  size="sm"
                  backgroundColor="var(--silver-light, #f4f4f5)"
                  textColor="var(--navy)"
                  className="pagination-btn"
                  onClick={() => handleFilterChange('page', filters.page + 1)}
                  disabled={!pagination.hasNextPage || loading}
                >
                  Next
                </AppButton>
              </div>
            </div>

            
          </div>
        </div>
      </div>
    </>
  );
};

Notifications.propTypes = {
  styles: PropTypes.string,
};

export default Notifications;

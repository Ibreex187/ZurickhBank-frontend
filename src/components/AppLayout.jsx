import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import ZurichBrand from './ZurichBrand';
import LoadingWatch from './LoadingWatch';
import { renderSidebarNavLinks } from './sidebarNavLinks';
import { getPageMeta } from './pageMeta';
import { DASHBOARD_STYLES } from '../pages/Dashboard.styles';
import { getPremiumStatus } from '../utils/premiumStatus';
import { getUnreadNotificationCount } from '../services/notificationService';
import {
  NOTIFICATIONS_UNREAD_UPDATED_EVENT,
  publishUnreadNotifications,
  readStoredUnreadNotifications,
} from '../utils/notificationEvents';

const COLLAPSED_STORAGE_KEY = 'zb.sidebarCollapsed';
const DEMO_NOTICE_STORAGE_KEY = 'zb.demoNoticeDismissed';
const MOBILE_BREAKPOINT = 768;

const readFlag = (storage, key) => {
  try {
    return storage.getItem(key) === 'true';
  } catch {
    return false; // storage can be blocked (private mode); the preference is optional
  }
};

const writeFlag = (storage, key, value) => {
  try {
    storage.setItem(key, String(value));
  } catch {
    // ignore
  }
};

/**
 * The frame every signed-in page shares: sidebar, header, notification bell and the demo notice.
 * It stays mounted while people move between pages, so the sidebar does not reload
 * and its collapsed state is remembered.
 */
const AppLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = user?.roles === 'admin' || user?.role === 'admin' || user?.isAdmin === true;
  const meta = getPageMeta(location.pathname, user);
  const isAdminHeader = meta.variant === 'admin';

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => readFlag(window.localStorage, COLLAPSED_STORAGE_KEY));
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [premiumStatus, setPremiumStatus] = useState({ isPremium: false });
  const [unreadNotifications, setUnreadNotifications] = useState(() => readStoredUnreadNotifications());
  const [demoNoticeDismissed, setDemoNoticeDismissed] = useState(() => readFlag(window.sessionStorage, DEMO_NOTICE_STORAGE_KEY));

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((previous) => {
      writeFlag(window.localStorage, COLLAPSED_STORAGE_KEY, !previous);
      return !previous;
    });
  };

  const dismissDemoNotice = () => {
    writeFlag(window.sessionStorage, DEMO_NOTICE_STORAGE_KEY, true);
    setDemoNoticeDismissed(true);
  };

  // Browser tab shows which page you are on
  useEffect(() => {
    document.title = `${meta.title} | Zurich Bank`;
  }, [meta.title]);

  // Close the mobile drawer when the page changes
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Escape closes the drawer; growing the window to desktop width closes it too
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth > MOBILE_BREAKPOINT) setSidebarOpen(false);
    };

    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    let isActive = true;
    getPremiumStatus().then((status) => {
      if (isActive) setPremiumStatus(status);
    });
    return () => {
      isActive = false;
    };
  }, []);

  // Unread count for the bell: load it once, then follow updates from the Notifications page
  useEffect(() => {
    let isActive = true;

    getUnreadNotificationCount()
      .then((response) => {
        if (!isActive) return;
        const count = response?.success ? Number(response?.data?.unreadCount) || 0 : 0;
        setUnreadNotifications(count);
        publishUnreadNotifications(count);
      })
      .catch(() => {
        // The bell just keeps the last known count if this fails
      });

    const onUnreadUpdated = (event) => {
      const count = Number(event?.detail?.unreadCount);
      if (Number.isFinite(count) && count >= 0) setUnreadNotifications(count);
    };

    window.addEventListener(NOTIFICATIONS_UNREAD_UPDATED_EVENT, onUnreadUpdated);
    return () => {
      isActive = false;
      window.removeEventListener(NOTIFICATIONS_UNREAD_UPDATED_EVENT, onUnreadUpdated);
    };
  }, []);

  const initial = (user?.firstName?.[0] || user?.userName?.[0] || (isAdminHeader ? 'A' : 'U')).toUpperCase();
  const roleLabel = isAdminHeader ? 'Admin Account' : premiumStatus.isPremium ? 'Premium Account' : 'Standard Account';
  const roleClass = isAdminHeader ? 'admin' : premiumStatus.isPremium ? 'premium' : 'standard';

  return (
    <>
      <style>{DASHBOARD_STYLES}</style>
      <a href="#main-content" className="visually-hidden-focusable position-absolute p-2 bg-white text-dark" style={{ zIndex: 2000 }}>
        Skip to main content
      </a>

      <div className={`fintech-dashboard ${meta.className}`.trim()}>
        {/* Sidebar */}
        <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''} ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="brand">
              <ZurichBrand showText={!sidebarCollapsed} className="sidebar-brand" />
            </div>
            <button
              type="button"
              className="collapse-btn"
              onClick={toggleSidebarCollapsed}
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-expanded={!sidebarCollapsed}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M3,6V8H21V6H3M3,11H21V13H3V11M3,16H21V18H3V16Z" />
              </svg>
            </button>
          </div>

          <nav className="sidebar-nav" aria-label="Main">
            <ul>
              {renderSidebarNavLinks({
                pathname: location.pathname,
                sidebarCollapsed,
                onNavClick: () => setSidebarOpen(false),
                isAdmin,
              })}
            </ul>

            <div className="sidebar-footer">
              <button type="button" onClick={logout} className="logout-btn">
                <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
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
          <header className="main-header">
            <div className="header-left">
              <button
                type="button"
                className="mobile-menu-btn"
                aria-label="Toggle menu"
                aria-expanded={sidebarOpen}
                onClick={() => setSidebarOpen((previous) => !previous)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z" />
                </svg>
              </button>
              <div>
                <h1 className="page-title">{meta.title}</h1>
                {meta.subtitle && <p className="page-subtitle">{meta.subtitle}</p>}
              </div>
            </div>

            <div className="header-right">
              <button
                type="button"
                className="notifications-btn"
                aria-label={unreadNotifications > 0 ? `Open notifications, ${unreadNotifications} unread` : 'Open notifications'}
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
                <div className="user-avatar" style={isAdminHeader ? { background: '#ffc107', color: '#000' } : undefined}>
                  {initial}
                </div>
                <div className="user-info">
                  <span className="user-name">
                    {isAdminHeader ? user?.firstName || user?.userName : `${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                  </span>
                  <span className={`user-role ${roleClass}`}>{roleLabel}</span>
                </div>
              </div>
            </div>
          </header>

          {!demoNoticeDismissed && (
            <Alert
              variant="warning"
              dismissible
              onClose={dismissDemoNotice}
              className="rounded-0 border-0 border-bottom py-1 px-3 small mb-0 text-center"
            >
              Demo application: no real money is held or moved.
            </Alert>
          )}

          <main id="main-content" tabIndex={-1} style={{ outline: 'none' }}>
            <Suspense fallback={<LoadingWatch minHeight="40vh" />}>
              <Outlet />
            </Suspense>
          </main>
        </div>
      </div>
    </>
  );
};

export default AppLayout;

import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ZurichBrand from '../components/ZurichBrand';
import ProfileCard from '../components/ProfileCard';
import ActionButtons from '../components/ActionButtons';
import LoadingWatch from '../components/LoadingWatch';
import PasswordField from '../components/PasswordField';
import { renderSidebarNavLinks } from '../components/sidebarNavLinks';
import PROFILE_STYLES from './Profile.styles.js';
import {
  getCurrentUserProfile,
  getUserAccountSummary,
  updateUserProfile,
  changeUserPassword,
  setUserTransactionPin,
  requestProfileUpdateOtp,
  validateProfileData,
  validatePasswordData,
  validateTransactionPinData
} from '../services/profileService';

const Profile = ({ styles }) => {
  const { user, logout, refreshUser } = useAuth();
  const isAdmin = user?.roles === 'admin' || user?.role === 'admin' || user?.isAdmin === true;

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState({ type: '', text: '' });

  // Profile data state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    accountNumber: '',
    balance: 0,
    savingsBalance: 0,
    hasTransactionPin: false
  });

  // Account summary state
  const [accountSummary, setAccountSummary] = useState(null);

  // Edit profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [editOtp, setEditOtp] = useState('');
  const [editOtpLoading, setEditOtpLoading] = useState(false);

  // Change password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showPinForm, setShowPinForm] = useState(false);
  const [pinData, setPinData] = useState({
    currentPassword: '',
    transactionPin: '',
    confirmTransactionPin: ''
  });
  const [pinErrors, setPinErrors] = useState({});

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
    if (user) {
      const mappedUser = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        userName: user.userName || user.username || '',
        email: user.email || '',
        accountNumber: user.accountNumber || '',
        balance: user.balance || 0,
        savingsBalance: user.savingsBalance || 0,
        hasTransactionPin: Boolean(user.hasTransactionPin),
      };
      setProfileData(mappedUser);
      setEditFormData(mappedUser);
    }

    fetchProfileData();
    fetchAccountSummary();
  }, [user]);

  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    const allowedTabs = new Set(['overview', 'personal', 'security']);

    if (tab && allowedTabs.has(tab)) {
      setActiveTab(tab);
      if (tab === 'security' && !profileData.hasTransactionPin) {
        setShowPinForm(true);
      }
    }
  }, [location.search, profileData.hasTransactionPin]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const response = await getCurrentUserProfile();
      if (response.success) {
        setProfileData(response.data);
        setEditFormData(response.data);
      } else {
        setMessage({
          type: 'error',
          text: response.message || 'Failed to load profile data'
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Error loading profile data'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountSummary = async () => {
    try {
      const response = await getUserAccountSummary();
      if (response.success) {
        setAccountSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Failed to fetch account summary:', error);
    }
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setEditFormData({ ...profileData });
    setEditErrors({});
    setEditOtp('');
    setMessage({ type: '', text: '' });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditFormData({ ...profileData });
    setEditErrors({});
    setEditOtp('');
  };

  const handleRequestProfileOtp = async () => {
    setEditOtpLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await requestProfileUpdateOtp();
      setMessage({
        type: response.success ? 'success' : 'error',
        text: response.message || (response.success ? 'OTP sent' : 'Failed to send OTP')
      });
    } finally {
      setEditOtpLoading(false);
    }
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    // Clear specific field error when user starts typing
    if (editErrors[field]) {
      setEditErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSaveProfile = async () => {
    // Validate data
    const validation = validateProfileData(editFormData);
    if (!validation.isValid) {
      setEditErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      // Only send changed fields
      const changedFields = {};
      Object.keys(editFormData).forEach(key => {
        if (editFormData[key] !== profileData[key] && key !== 'accountNumber' && key !== 'balance' && key !== 'savingsBalance') {
          changedFields[key] = editFormData[key];
        }
      });

      if (Object.keys(changedFields).length === 0) {
        setMessage({ type: 'info', text: 'No changes to save' });
        setIsEditing(false);
        return;
      }

      if (!editOtp) {
        setMessage({ type: 'error', text: 'Enter OTP sent to your email before saving changes' });
        setLoading(false);
        return;
      }

      changedFields.otp = editOtp;

      const response = await updateUserProfile(changedFields);
      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Profile updated successfully'
        });
        setProfileData(response.data);
        setEditFormData(response.data);
        setIsEditing(false);
        setEditOtp('');
        // Refresh user data in context
        await refreshUser();
      } else {
        setMessage({
          type: 'error',
          text: response.message || 'Failed to update profile'
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Error updating profile'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    // Clear specific field error when user starts typing
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    // Validate password data
    const validation = validatePasswordData(passwordData);
    if (!validation.isValid) {
      setPasswordErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      const response = await changeUserPassword(passwordData);
      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Password changed successfully'
        });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
        setPasswordErrors({});
      } else {
        setMessage({
          type: 'error',
          text: response.message || 'Failed to change password'
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Error changing password'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTransactionPinChange = (field, value) => {
    const nextValue = field.includes('Pin') ? value.replace(/\D/g, '').slice(0, 4) : value;
    setPinData(prev => ({ ...prev, [field]: nextValue }));

    if (pinErrors[field]) {
      setPinErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSetTransactionPin = async (e) => {
    e.preventDefault();

    const validation = validateTransactionPinData(pinData);
    if (!validation.isValid) {
      setPinErrors(validation.errors);
      return;
    }

    setLoading(true);
    try {
      const response = await setUserTransactionPin(pinData);

      if (response.success) {
        setMessage({
          type: 'success',
          text: response.message || 'Transaction PIN updated successfully'
        });
        setPinData({
          currentPassword: '',
          transactionPin: '',
          confirmTransactionPin: ''
        });
        setPinErrors({});
        setShowPinForm(false);
        await refreshUser();
        await fetchProfileData();
      } else {
        setMessage({
          type: 'error',
          text: response.message || 'Failed to set transaction PIN'
        });
      }
    } catch {
      setMessage({
        type: 'error',
        text: 'Error setting transaction PIN'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return `₦${(amount || 0).toLocaleString()}`;
  };

  return (
    <>
      <style>{styles || PROFILE_STYLES}</style>
      <div className="fintech-dashboard profile-page">
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
                <h1 className="page-title">My Profile</h1>
                <p className="page-subtitle">Manage your account information securely</p>
              </div>
            </div>
            <div className="header-right">
              <div className="user-profile">
                <div className="user-avatar">
                  {(profileData.firstName?.[0] || profileData.userName?.[0] || 'U').toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{profileData.firstName} {profileData.lastName}</span>
                  <span className="user-role premium">Premium Account</span>
                </div>
              </div>
            </div>
          </header>

          <div className="profile-container">
            {/* Messages */}
            {message.text && (
              <div className={`alert alert-${message.type}`}>
                <span>{message.text}</span>
                <button
                  className="alert-close"
                  onClick={() => setMessage({ type: '', text: '' })}
                >
                  ×
                </button>
              </div>
            )}

            {/* Profile Tabs */}
            <div className="profile-tabs">
              <button
                className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
                Overview
              </button>
              <button
                className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
                onClick={() => setActiveTab('personal')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22,3H2C0.91,3.04 0.04,3.91 0,5V19C0.04,20.09 0.91,20.96 2,21H22C23.09,20.96 23.96,20.09 24,19V5C23.96,3.91 23.09,3.04 22,3M22,19H2V5H22V19Z" />
                </svg>
                Personal Info
              </button>
              <button
                className={`tab-button ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11C15.4,11 16,11.4 16,12V16C16,16.6 15.6,17 15,17H9C8.4,17 8,16.6 8,16V12C8,11.4 8.4,11 9,11V10C9,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.2,9.2 10.2,10V11H13.8V10C13.8,9.2 12.8,8.2 12,8.2Z" />
                </svg>
                Security
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="overview-content">
                  <div className="profile-grid">
                    {/* Account Summary Card */}
                    <div className="profile-card account-summary premium-stat-card">
                      <div className="card-header">
                        <h3>Account Summary</h3>
                        <div className="account-status active">
                          <span className="status-dot"></span>
                          Active
                        </div>
                      </div>
                      <div className="card-body">
                        <div className="balance-info">
                          <div className="balance-item">
                            <span className="label">Total Balance</span>
                            <span className="value">{formatCurrency(profileData.balance)}</span>
                          </div>
                          <div className="balance-item">
                            <span className="label">Savings Balance</span>
                            <span className="value">{formatCurrency(profileData.savingsBalance)}</span>
                          </div>
                          <div className="balance-item">
                            <span className="label">Available Balance</span>
                            <span className="value available">{formatCurrency((profileData.balance || 0) - (profileData.savingsBalance || 0))}</span>
                          </div>
                        </div>
                        <div className="account-details">
                          <div className="detail-item">
                            <span className="label">Account Number</span>
                            <span className="value">{profileData.accountNumber}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Member Since</span>
                            <span className="value">{accountSummary?.memberSince || new Date().getFullYear()}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Profile Info Card */}
                    <ProfileCard
                      title={<span>Profile Information</span>}
                      actions={
                        <ActionButtons
                          actions={[
                            { key: 'edit', label: 'Edit', onClick: () => setActiveTab('personal'), backgroundColor: 'rgba(255,255,255,0.1)', textColor: '#ffffff', borderColor: 'rgba(255,255,255,0.2)' },
                          ]}
                        />
                      }
                      className="profile-card profile-info premium-stat-card"
                    >
                      <div className="profile-avatar-section d-flex align-items-center gap-3">
                        <div className="profile-avatar large" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                          {(profileData.firstName?.[0] || profileData.userName?.[0] || 'U').toUpperCase()}
                        </div>
                        <div className="profile-basic">
                          <h4 className="mb-1 text-white">{profileData.firstName} {profileData.lastName}</h4>
                          <div className="d-flex gap-2 align-items-center">
                            <div className="username" style={{ color: 'rgba(255,255,255,0.7)' }}>@{profileData.userName}</div>
                            <div className="profile-email" style={{ color: 'rgba(255,255,255,0.7)' }}>{profileData.email}</div>
                          </div>
                        </div>
                      </div>
                    </ProfileCard>

                    {/* Quick actions moved into profile-info header for a cleaner layout */}
                  </div>
                </div>
              )}

              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="personal-content">
                  <div className="profile-card premium-stat-card">
                    <div className="card-header">
                      <h3>Personal Information</h3>
                      {!isEditing && (
                        <button className="edit-btn action-btn-custom" onClick={handleEditProfile} style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z" />
                          </svg>
                          Edit
                        </button>
                      )}
                    </div>
                    <div className="card-body">
                      {!isEditing ? (
                        <div className="info-grid">
                          <div className="info-item">
                            <label style={{ color: 'rgba(255,255,255,0.7)' }}>First Name</label>
                            <span className="text-white">{profileData.firstName}</span>
                          </div>
                          <div className="info-item">
                            <label style={{ color: 'rgba(255,255,255,0.7)' }}>Last Name</label>
                            <span className="text-white">{profileData.lastName}</span>
                          </div>
                          <div className="info-item">
                            <label style={{ color: 'rgba(255,255,255,0.7)' }}>Username</label>
                            <span className="text-white">{profileData.userName}</span>
                          </div>
                          <div className="info-item">
                            <label style={{ color: 'rgba(255,255,255,0.7)' }}>Email Address</label>
                            <span className="text-white">{profileData.email}</span>
                          </div>
                          <div className="info-item">
                            <label style={{ color: 'rgba(255,255,255,0.7)' }}>Account Number</label>
                            <span className="text-white">{profileData.accountNumber}</span>
                          </div>
                        </div>
                      ) : (
                        <form className="edit-form">
                          <div className="form-grid">
                            <div className="form-group">
                              <label style={{ color: 'var(--white)' }}>First Name</label>
                              <input
                                type="text"
                                value={editFormData.firstName || ''}
                                onChange={(e) => handleEditInputChange('firstName', e.target.value)}
                                className={`form-input ${editErrors.firstName ? 'error' : ''}`}
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--white)', borderColor: 'rgba(255,255,255,0.1)' }}
                              />
                              {editErrors.firstName && <span className="error-text">{editErrors.firstName}</span>}
                            </div>

                            <div className="form-group">
                              <label style={{ color: 'var(--white)' }}>Last Name</label>
                              <input
                                type="text"
                                value={editFormData.lastName || ''}
                                onChange={(e) => handleEditInputChange('lastName', e.target.value)}
                                className={`form-input ${editErrors.lastName ? 'error' : ''}`}
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--white)', borderColor: 'rgba(255,255,255,0.1)' }}
                              />
                              {editErrors.lastName && <span className="error-text">{editErrors.lastName}</span>}
                            </div>

                            <div className="form-group">
                              <label style={{ color: 'var(--white)' }}>Username</label>
                              <input
                                type="text"
                                value={editFormData.userName || ''}
                                onChange={(e) => handleEditInputChange('userName', e.target.value)}
                                className={`form-input ${editErrors.userName ? 'error' : ''}`}
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--white)', borderColor: 'rgba(255,255,255,0.1)' }}
                              />
                              {editErrors.userName && <span className="error-text">{editErrors.userName}</span>}
                            </div>

                            <div className="form-group">
                              <label style={{ color: 'var(--white)' }}>Email Address</label>
                              <input
                                type="email"
                                value={editFormData.email || ''}
                                onChange={(e) => handleEditInputChange('email', e.target.value)}
                                className={`form-input ${editErrors.email ? 'error' : ''}`}
                                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--white)', borderColor: 'rgba(255,255,255,0.1)' }}
                              />
                              {editErrors.email && <span className="error-text">{editErrors.email}</span>}
                            </div>

                            <div className="form-group">
                              <label style={{ color: 'var(--white)' }}>Account Number</label>
                              <input
                                type="text"
                                value={editFormData.accountNumber || ''}
                                disabled
                                className="form-input readonly"
                                style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.05)' }}
                              />
                              <span className="help-text" style={{ color: 'rgba(255,255,255,0.4)' }}>Account number cannot be changed</span>
                            </div>

                              <div className="form-group">
                                <label style={{ color: 'var(--white)' }}>OTP (required to save changes)</label>
                                <input
                                  type="text"
                                  value={editOtp}
                                  onChange={(e) => setEditOtp(e.target.value)}
                                  className="form-input"
                                  placeholder="Enter 6-digit OTP"
                                  style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--white)', borderColor: 'rgba(255,255,255,0.1)' }}
                                />
                              </div>
                          </div>

                          <div className="form-actions mt-4">
                              <button
                                type="button"
                                className="action-btn-custom"
                                onClick={handleRequestProfileOtp}
                                disabled={editOtpLoading}
                                style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                              >
                                {editOtpLoading ? 'Sending OTP...' : 'Send OTP'}
                              </button>
                            <button
                              type="button"
                              className="action-btn-custom"
                              onClick={handleCancelEdit}
                              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              className="action-btn-custom"
                              onClick={handleSaveProfile}
                              disabled={loading}
                              style={{ background: 'var(--accent)', color: 'var(--navy)', borderColor: 'var(--accent)', fontWeight: 'bold' }}
                            >
                              {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="security-content">
                  <div className="profile-card premium-stat-card">
                    <div className="card-header">
                      <h3>Password & Security</h3>
                    </div>
                    <div className="card-body">
                      {!showPasswordForm ? (
                        <div className="security-overview">
                          <div className="security-item" style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.1)' }}>
                            <div className="security-icon" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--white)' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11C15.4,11 16,11.4 16,12V16C16,16.6 15.6,17 15,17H9C8.4,17 8,16.6 8,16V12C8,11.4 8.4,11 9,11V10C9,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.2,9.2 10.2,10V11H13.8V10C13.8,9.2 12.8,8.2 12,8.2Z" />
                              </svg>
                            </div>
                            <div className="security-info">
                              <h4 className="text-white">Password</h4>
                              <p style={{ color: 'rgba(255,255,255,0.7)' }}>Your password was last updated recently. Keep it secure!</p>
                            </div>
                            <button
                              className="action-btn-custom ms-auto"
                              onClick={() => setShowPasswordForm(true)}
                              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                            >
                              Change Password
                            </button>
                          </div>

                          <div className="security-item" style={{ background: 'transparent', borderColor: 'rgba(255,255,255,0.1)' }}>
                            <div className="security-icon" style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--white)' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12,1A9,9 0 0,0 3,10V12A2,2 0 0,0 1,14V20A2,2 0 0,0 3,22H21A2,2 0 0,0 23,20V14A2,2 0 0,0 21,12V10A9,9 0 0,0 12,1M12,3A7,7 0 0,1 19,10V12H5V10A7,7 0 0,1 12,3M12,15A2,2 0 0,1 14,17A2,2 0 0,1 12,19A2,2 0 0,1 10,17A2,2 0 0,1 12,15Z" />
                              </svg>
                            </div>
                            <div className="security-info">
                              <h4 className="text-white">Transaction PIN</h4>
                              <p style={{ color: 'rgba(255,255,255,0.7)' }}>
                                {profileData.hasTransactionPin
                                  ? 'Your transaction PIN is set and required for money movements.'
                                  : 'Set your 4-digit transaction PIN to authorize transfers and savings actions.'}
                              </p>
                            </div>
                            <button
                              className="action-btn-custom ms-auto"
                              onClick={() => setShowPinForm(true)}
                              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                            >
                              {profileData.hasTransactionPin ? 'Update PIN' : 'Set PIN'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <form className="password-form" onSubmit={handleChangePassword}>
                          <div className="form-group">
                            <PasswordField
                              label="Current Password"
                              value={passwordData.currentPassword}
                              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                              inputClassName="form-input"
                              labelClassName=""
                              isInvalid={!!passwordErrors.currentPassword}
                              feedback={passwordErrors.currentPassword}
                              feedbackClassName="error-text"
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--white)', borderColor: 'rgba(255,255,255,0.1)' }}
                              buttonStyle={{ color: 'var(--white)' }}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <PasswordField
                              label="New Password"
                              value={passwordData.newPassword}
                              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                              inputClassName="form-input"
                              labelClassName=""
                              isInvalid={!!passwordErrors.newPassword}
                              feedback={passwordErrors.newPassword}
                              feedbackClassName="error-text"
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--white)', borderColor: 'rgba(255,255,255,0.1)' }}
                              buttonStyle={{ color: 'var(--white)' }}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <PasswordField
                              label="Confirm New Password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                              inputClassName="form-input"
                              labelClassName=""
                              isInvalid={!!passwordErrors.confirmPassword}
                              feedback={passwordErrors.confirmPassword}
                              feedbackClassName="error-text"
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--white)', borderColor: 'rgba(255,255,255,0.1)' }}
                              buttonStyle={{ color: 'var(--white)' }}
                              required
                            />
                          </div>
                          <div className="form-actions mt-4">
                            <button
                              type="button"
                              className="action-btn-custom"
                              onClick={() => {
                                setShowPasswordForm(false);
                                setPasswordData({
                                  currentPassword: '',
                                  newPassword: '',
                                  confirmPassword: ''
                                });
                                setPasswordErrors({});
                              }}
                              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="action-btn-custom"
                              disabled={loading}
                              style={{ background: 'var(--accent)', color: 'var(--navy)', borderColor: 'var(--accent)', fontWeight: 'bold' }}
                            >
                              {loading ? 'Changing...' : 'Change Password'}
                            </button>
                          </div>
                        </form>
                      )}

                      {showPinForm && (
                        <form className="password-form mt-4" onSubmit={handleSetTransactionPin}>
                          <div className="form-group">
                            <PasswordField
                              label="Current Password"
                              value={pinData.currentPassword}
                              onChange={(e) => handleTransactionPinChange('currentPassword', e.target.value)}
                              inputClassName="form-input"
                              labelClassName=""
                              isInvalid={!!pinErrors.currentPassword}
                              feedback={pinErrors.currentPassword}
                              feedbackClassName="error-text"
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--white)', borderColor: 'rgba(255,255,255,0.1)' }}
                              buttonStyle={{ color: 'var(--white)' }}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <PasswordField
                              label="Transaction PIN"
                              value={pinData.transactionPin}
                              onChange={(e) => handleTransactionPinChange('transactionPin', e.target.value)}
                              inputClassName="form-input"
                              labelClassName=""
                              isInvalid={!!pinErrors.transactionPin}
                              feedback={pinErrors.transactionPin}
                              feedbackClassName="error-text"
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--white)', borderColor: 'rgba(255,255,255,0.1)' }}
                              buttonStyle={{ color: 'var(--white)' }}
                              maxLength={4}
                              required
                            />
                          </div>

                          <div className="form-group">
                            <PasswordField
                              label="Confirm Transaction PIN"
                              value={pinData.confirmTransactionPin}
                              onChange={(e) => handleTransactionPinChange('confirmTransactionPin', e.target.value)}
                              inputClassName="form-input"
                              labelClassName=""
                              isInvalid={!!pinErrors.confirmTransactionPin}
                              feedback={pinErrors.confirmTransactionPin}
                              feedbackClassName="error-text"
                              style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--white)', borderColor: 'rgba(255,255,255,0.1)' }}
                              buttonStyle={{ color: 'var(--white)' }}
                              maxLength={4}
                              required
                            />
                          </div>

                          <div className="form-actions mt-4">
                            <button
                              type="button"
                              className="action-btn-custom"
                              onClick={() => {
                                setShowPinForm(false);
                                setPinData({ currentPassword: '', transactionPin: '', confirmTransactionPin: '' });
                                setPinErrors({});
                              }}
                              style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.2)' }}
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="action-btn-custom"
                              disabled={loading}
                              style={{ background: 'var(--accent)', color: 'var(--navy)', borderColor: 'var(--accent)', fontWeight: 'bold' }}
                            >
                              {loading ? 'Saving...' : (profileData.hasTransactionPin ? 'Update PIN' : 'Set PIN')}
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>

                  <div className="profile-card premium-stat-card mt-4">
                    <div className="card-header">
                      <h3>Email Preferences</h3>
                    </div>
                    <div className="card-body">
                      {preferencesLoading ? (
                        <LoadingWatch label="Loading preferences..." minHeight="100px" />
                      ) : (
                        <div className="preferences-grid">
                          {Object.keys(preferences).map((categoryKey) => (
                            <div className="preference-item" key={categoryKey}>
                              <div>
                                <p className="preference-title text-white">{categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1)}</p>
                                <p className="preference-subtitle" style={{ color: 'rgba(255,255,255,0.7)' }}>Send email for {categoryKey} notifications</p>
                              </div>
                              <label className="preference-toggle">
                                <input
                                  type="checkbox"
                                  checked={Boolean(preferences[categoryKey])}
                                  onChange={(event) => handlePreferenceToggle(categoryKey, event.target.checked)}
                                  disabled={preferencesSavingKey === categoryKey}
                                />
                                <span>{preferences[categoryKey] ? 'On' : 'Off'}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;

Profile.propTypes = {
  styles: PropTypes.string,
};
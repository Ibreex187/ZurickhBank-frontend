import { DASHBOARD_STYLES } from './Dashboard.styles.js';

export const PROFILE_STYLES = `
/* Inherit premium Dashboard Shell styles (Sidebar, Header, Main Content) */
${DASHBOARD_STYLES}

/* Premium Statistics Cards */
.premium-stat-card {
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%) !important;
  color: var(--white) !important;
  border: 1px solid rgba(255,255,255,0.05) !important;
}

.premium-stat-card .card-header {
  border-bottom: 1px solid rgba(255,255,255,0.1) !important;
}

.premium-stat-card .card-title,
.premium-stat-card h3 {
  color: var(--white) !important;
  font-weight: var(--font-weight-bold);
}

.premium-stat-card .card-label,
.premium-stat-card .label {
  color: rgba(255,255,255,0.7) !important;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: var(--font-weight-medium);
}

.premium-stat-card .value {
  color: var(--white) !important;
  font-weight: var(--font-weight-bold);
}

.premium-stat-card .value.available {
  color: var(--accent) !important;
}

/* Fix for inherited detail-items from global Dashboard styles to match dark Navy theme */
.premium-stat-card .detail-item {
  background: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.premium-stat-card .detail-item span {
  color: var(--white) !important;
}

.premium-stat-card .detail-item .label {
  color: rgba(255, 255, 255, 0.7) !important;
}

.profile-page {
  font-family: var(--font-family);
  color: var(--text-main);
  background: var(--silver-light);
  min-height: 100vh;
}

/* Navigation Header */
.profile-nav {
  background: var(--glass);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-light);
  padding: var(--space-lg) 0;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
}

.nav-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 var(--space-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: var(--space-xl);
}

.back-link {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--accent);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: var(--transition);
  padding: var(--space-sm) var(--space-lg);
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-size: var(--font-sizes-sm);
}

.back-link:hover {
  background: var(--accentSoft);
  border-color: var(--accent);
  transform: translateX(-2px);
}

.page-title {
  font-size: var(--font-sizes-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--navy);
  margin: 0;
}

.nav-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accentDark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-weight: var(--font-weight-bold);
  font-size: var(--font-sizes-base);
  box-shadow: var(--shadow-sm);
}

.user-avatar.large {
  width: 80px;
  height: 80px;
  font-size: var(--font-sizes-2xl);
}

.user-name {
  font-weight: var(--font-weight-semibold);
  color: var(--navy);
  font-size: var(--font-sizes-base);
}

/* Main Container */
.profile-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-2xl) var(--space-xl);
}

.profile-header {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  margin-bottom: var(--space-2xl);
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  gap: var(--space-2xl);
  border: 1px solid var(--border-light);
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-lg);
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accentDark) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-size: var(--font-sizes-4xl);
  font-weight: var(--font-weight-bold);
  box-shadow: var(--shadow-lg);
  border: 4px solid var(--white);
}

.profile-edit-btn {
  padding: var(--space-md) var(--space-lg);
  background-color: var(--accent);
  color: var(--white);
  border: none;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition);
  font-size: var(--font-sizes-sm);
}

.profile-edit-btn:hover {
  background-color: var(--accentDark);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.profile-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.profile-name {
  font-size: var(--font-sizes-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--navy);
}

.profile-email {
  font-size: var(--font-sizes-base);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.profile-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-lg);
  background-color: var(--successLight);
  color: var(--success);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-sizes-sm);
  width: fit-content;
}

.profile-status.inactive {
  background-color: var(--dangerLight);
  color: var(--danger);
}

/* Tabs */
.profile-tabs {
  display: flex;
  gap: var(--space-lg);
  border-bottom: 2px solid var(--border-light);
  margin-bottom: var(--space-2xl);
  background: var(--white);
  padding: 0 var(--space-xl);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.tab-button {
  padding: var(--space-lg) var(--space-md);
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition);
  font-size: var(--font-sizes-sm);
}

.tab-button:hover {
  color: var(--navy);
}

.tab-button.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

/* Cards Grid */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: calc(var(--space-xl) + 6px);
  margin-bottom: var(--space-2xl);
}

.profile-card {
  background: var(--white);
  border-radius: var(--radius-md);
  padding: calc(var(--space-xl) + 6px);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  transition: var(--transition);
}

.profile-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}

.account-summary .card-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.account-summary .balance-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.account-summary .balance-item {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--space-lg);
  padding: var(--space-sm) 0 var(--space-md);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.account-summary .balance-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.account-summary .balance-item .label {
  margin: 0;
}

.account-summary .balance-item .value {
  font-size: clamp(1.05rem, 1.2vw, 1.25rem);
  line-height: 1.2;
}

.account-summary .account-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-md);
}

.account-summary .account-details .detail-item {
  padding: var(--space-lg);
}

.account-summary .account-details .detail-item .label {
  display: block;
  margin-bottom: var(--space-sm);
}

.account-summary .account-details .detail-item .value {
  display: block;
  line-height: 1.35;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--border-light);
}

.card-title {
  font-size: var(--font-sizes-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--navy);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--accentSoft);
  color: var(--accent);
  font-size: var(--font-sizes-lg);
}

.card-icon.danger {
  background-color: var(--dangerLight);
  color: var(--danger);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--border-light);
}

.card-row:last-child {
  border-bottom: none;
}

.card-label {
  font-size: var(--font-sizes-sm);
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
}

.card-value {
  font-size: var(--font-sizes-base);
  color: var(--navy);
  font-weight: var(--font-weight-semibold);
}

/* Form Styles */
.form-group {
  margin-bottom: var(--space-lg);
}

.form-label {
  display: block;
  margin-bottom: var(--space-sm);
  font-weight: var(--font-weight-medium);
  color: var(--navy);
  font-size: var(--font-sizes-sm);
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: var(--space-md) var(--space-lg);
  border: 1px solid var(--border-rich);
  border-radius: var(--radius-sm);
  font-family: var(--font-family);
  font-size: var(--font-sizes-sm);
  color: var(--text-main);
  transition: var(--transition);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.form-input::placeholder {
  color: var(--text-muted);
}

.form-error {
  color: var(--danger);
  font-size: var(--font-sizes-xs);
  margin-top: var(--space-sm);
}

/* Personal info + Edit form specific styles */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item label {
  font-size: var(--font-sizes-sm);
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
}

.info-item span {
  font-size: var(--font-sizes-base);
  color: var(--navy);
  font-weight: var(--font-weight-semibold);
}

.edit-form .form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-md);
  margin-top: var(--space-lg);
}

.error-text {
  color: var(--danger);
  font-size: var(--font-sizes-xs);
  margin-top: 6px;
}

.readonly {
  background: var(--silver-light);
  border: 1px solid var(--border-rich);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-sm);
}

.help-text {
  display: block;
  font-size: var(--font-sizes-xs);
  color: var(--text-muted);
  margin-top: var(--space-sm);
}

/* Quick action buttons */
.action-buttons {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.action-btn-custom {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  height: 38px;
  border-radius: 10px;
  border: 1px solid var(--border-rich);
  background: transparent;
  color: var(--text-main);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-sizes-sm);
  transition: var(--transition);
}

.action-btn-custom:hover {
  box-shadow: var(--shadow-sm);
  transform: translateY(-2px);
}

.action-btn-custom svg {
  opacity: 0.9;
}

/* Security section styles */
.security-overview {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.security-item {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  background: var(--white);
  padding: var(--space-md);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
}

.security-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accentSoft);
  color: var(--accent);
  border-radius: 12px;
  font-size: var(--font-sizes-lg);
}

.security-info h4 {
  margin: 0 0 4px 0;
  font-size: var(--font-sizes-lg);
  color: var(--navy);
}

.security-info p {
  margin: 0;
  color: var(--text-muted);
}

.change-password-btn {
  margin-left: auto;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  background: var(--silver-light);
  border: 1px solid var(--border-rich);
  color: var(--text-main);
}

.password-form .form-group {
  margin-bottom: var(--space-lg);
}

/* Button Styles */
.btn {
  padding: var(--space-md) var(--space-lg);
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-sizes-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
}

.btn-primary {
  background-color: var(--accent);
  color: var(--white);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background-color: var(--accentDark);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: var(--silver-light);
  color: var(--text-main);
  border: 1px solid var(--border-rich);
}

.btn-secondary:hover {
  background-color: var(--border-light);
}

.btn-danger {
  background-color: var(--danger);
  color: var(--white);
}

.btn-danger:hover {
  background-color: #b91c1c;
  box-shadow: var(--shadow-md);
}

.btn-ghost {
  background: none;
  color: var(--accent);
  border: none;
  padding: 0;
}

.btn-ghost:hover {
  color: var(--accentDark);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.modal-content {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  max-width: 600px;
  width: 90%;
  box-shadow: var(--shadow-xl);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--border-light);
}

.modal-title {
  font-size: var(--font-sizes-xl);
  font-weight: var(--font-weight-bold);
  color: var(--navy);
}

.modal-close {
  background: none;
  border: none;
  font-size: var(--font-sizes-xl);
  cursor: pointer;
  color: var(--text-muted);
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.modal-close:hover {
  color: var(--text-main);
}

/* Alert Styles */
.alert {
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}

.alert-success {
  background-color: var(--successLight);
  color: var(--success);
  border: 1px solid rgba(5, 150, 105, 0.2);
}

.alert-danger {
  background-color: var(--dangerLight);
  color: var(--danger);
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.alert-warning {
  background-color: #fffbeb;
  color: var(--warning);
  border: 1px solid rgba(251, 191, 36, 0.2);
}

/* Responsive Styles */
@media (max-width: 1024px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }

  .profile-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: var(--space-lg);
  }

  .profile-header,
  .profile-card {
    padding: var(--space-xl);
  }

  .nav-container {
    padding: 0 var(--space-lg);
  }

  .page-title {
    font-size: var(--font-sizes-xl);
  }

  .profile-tabs {
    gap: var(--space-md);
    padding: 0 var(--space-lg);
  }

  .tab-button {
    padding: var(--space-md) var(--space-sm);
    font-size: var(--font-sizes-xs);
  }

  .account-summary .balance-item {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .account-summary .account-details {
    grid-template-columns: 1fr;
  }
}
`;

export default PROFILE_STYLES;

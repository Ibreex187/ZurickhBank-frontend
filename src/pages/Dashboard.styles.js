import { THEME_CSS_VARIABLES } from '../theme/index.js';

export const DASHBOARD_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

${THEME_CSS_VARIABLES}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background: var(--silver-light);
  color: var(--text-main);
  overflow-x: hidden;
}

.fintech-dashboard {
  display: flex;
  min-height: 100vh;
  background: var(--silver-light);
  min-width: 0;
}

.sidebar {
  width: 280px;
  background: linear-gradient(180deg, var(--navy) 0%, var(--navy-light) 100%);
  color: var(--white);
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 1000;
  overflow-y: auto;
  box-shadow: none;
  border-right: 1px solid rgba(255,255,255,0.04);
}

.sidebar.collapsed {
  width: 80px;
}

.sidebar.open {
  /* when open on mobile, ensure visible via transform override */
  transform: translateX(0) !important;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: calc(var(--space-sm) + 2px) var(--space-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.brand {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.brand-icon {
  width: 32px;
  height: 32px;
  background: var(--accent);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
  font-weight: bold;
}

.brand-text {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.2px;
  color: rgba(255,255,255,0.96);
  display: inline-block;
  vertical-align: middle;
}

/* Zurich brand specific tweaks to ensure logo and name are visually balanced */
.zurich-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  line-height: 1;
}

.zurich-brand .logo-mark {
  display: inline-flex;
  width: 34px;
  height: 34px;
}

.zurich-brand .logo-mark svg {
  width: 34px;
  height: 34px;
  display: block;
}

.zurich-brand .brand-text {
  font-size: 15px;
  font-weight: 700;
  color: var(--white);
}

/* When sidebar is collapsed show only the mark and center it */
.sidebar.collapsed .zurich-brand .brand-text,
.sidebar.collapsed .brand-text {
  display: none;
}

.sidebar.collapsed .zurich-brand .logo-mark,
.sidebar.collapsed .brand-icon {
  margin: 0 auto;
}

/* Header visual polish */
.main-header {
  background: var(--white);
  padding: calc(var(--space-lg) + 2px) var(--space-xl);
  box-shadow: 0 1px 0 rgba(15,23,42,0.03);
}

.page-title {
  margin: 0;
  color: var(--navy);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.2px;
}

.page-subtitle {
  margin-top: 4px;
  color: var(--text-muted);
  font-size: 13px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  min-width: 0;
}

.notifications-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--border-light);
  border-radius: 999px;
  background: var(--white);
  color: var(--navy);
  cursor: pointer;
}

.notifications-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 18px;
  height: 18px;
  border-radius: 999px;
  background: var(--danger);
  color: var(--white);
  font-size: 10px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.notification-status {
  border-radius: 999px;
  padding: 6px 10px;
  background: var(--silver-light);
  color: var(--text-muted);
  border: 1px solid var(--border-light);
  font-size: 12px;
  font-weight: 700;
}

.notification-status.unread {
  color: var(--danger);
  border-color: rgba(220, 38, 38, 0.2);
  background: var(--danger-light);
}

.notifications-controls {
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: var(--space-lg);
  margin-bottom: 1rem;
}

.filter-actions {
  display: flex;
  align-items: end;
  gap: var(--space-sm);
  margin-left: auto;
}

.notification-category {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 700;
  border: 1px solid var(--border-light);
  color: var(--navy);
  background: var(--silver-light);
}

.notification-debit {
  color: var(--danger);
  border-color: rgba(220, 38, 38, 0.2);
  background: var(--danger-light);
}

.notification-credit {
  color: var(--success);
  border-color: rgba(5, 150, 105, 0.2);
  background: var(--success-light);
}

.notification-transfer,
.notification-security {
  color: var(--accent-dark);
  border-color: rgba(30, 64, 175, 0.2);
  background: var(--accent-soft);
}

.mark-read-btn {
  border: 1px solid var(--border-rich);
  background: var(--white);
  color: var(--navy);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 700;
  padding: 6px 10px;
  cursor: pointer;
}

.mark-read-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.notification-read-tag {
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 700;
}

.preferences-grid {
  display: grid;
  gap: var(--space-md);
  padding: var(--space-lg);
}

.preference-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  padding: var(--space-md) var(--space-lg);
}

.preference-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--navy);
}

.preference-subtitle {
  margin: 4px 0 0;
  font-size: 12px;
  color: var(--text-muted);
}

.preference-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-main);
}

.preference-toggle input {
  width: 16px;
  height: 16px;
}

/* Cards: more breathing room and subtle border */
.dashboard-card {
  padding: calc(var(--space-xl) + 4px);
  border: 1px solid rgba(15,23,42,0.04);
}

/* Quick actions - make icons aligned */
.cta-btn .btn-icon {
  width: 40px;
  height: 40px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.collapse-btn {
  background: none;
  border: none;
  color: var(--white);
  cursor: pointer;
  padding: var(--space-sm);
  border-radius: var(--radius-sm);
  transition: var(--transition);
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

.sidebar-nav {
  padding: var(--space-lg) 0;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
}

.sidebar-nav ul {
  list-style: none;
  padding: 0 var(--space-lg);
  flex: 1;
}

.nav-item {
  margin-bottom: var(--space-sm);
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: calc(var(--space-sm) + 2px) var(--space-lg);
  color: rgba(255, 255, 255, 0.9);
  text-decoration: none;
  border-radius: 6px;
  transition: background 160ms ease, color 160ms ease;
  font-size: 14px;
  font-weight: 600;
}

.nav-link:hover {
  background: rgba(255,255,255,0.06);
  color: var(--white);
}

.nav-item.active .nav-link {
  background: rgba(255,255,255,0.02);
  color: var(--white);
  border-left: 4px solid var(--accent);
  padding-left: calc(var(--space-lg) - 4px);
}

/* Desktop: hide mobile-only menu button; it will be shown in the mobile media query */
.mobile-menu-btn {
  display: none;
  border: none;
  background: transparent;
  padding: 0;
}

.main-content {
  flex: 1;
  margin-left: 280px;
  background: var(--silver-light);
  overflow-y: auto;
}

.sidebar.collapsed ~ .main-content {
  margin-left: 80px;
}

.dashboard-header {
  background: var(--white);
  border-bottom: 1px solid var(--border-light);
  padding: calc(var(--space-sm) + 6px) var(--space-xl);
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}

.dashboard-header h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--navy);
  margin: 0;
}

.dashboard-container {
  padding: calc(var(--space-lg) + 4px);
  max-width: 1200px;
  margin: 0 auto;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: calc(var(--space-lg) + 8px);
  margin-bottom: var(--space-2xl);
}

.dashboard-card {
  background: var(--white);
  border-radius: 12px;
  padding: calc(var(--space-lg) + 6px);
  box-shadow: 0 1px 6px rgba(15,23,42,0.04);
  border: 1px solid rgba(15,23,42,0.04);
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.dashboard-card:hover {
  box-shadow: 0 6px 20px rgba(15,23,42,0.06);
  transform: translateY(-3px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: calc(var(--space-md) + 2px);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--navy);
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.card-value {
  font-size: 26px;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: var(--space-sm);
}

.card-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}

.card-change {
  font-size: 12px;
  margin-top: var(--space-md);
  font-weight: 500;
}

.card-change.positive {
  color: var(--success);
}

.card-change.negative {
  color: var(--danger);
}

.btn {
  padding: var(--space-md) var(--space-lg);
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
}

.btn-primary {
  background: var(--navy);
  color: var(--white);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  background: var(--navy-light);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--silver-light);
  color: var(--text-main);
  border: 1px solid var(--border-rich);
}

.btn-secondary:hover {
  background: var(--border-light);
}

.table-container {
  overflow-x: auto;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  background: var(--white);
}

.table thead {
  background: var(--silver-light);
  border-bottom: 1px solid var(--border-rich);
}

.table thead th {
  padding: var(--space-md) var(--space-lg);
  text-align: left;
  font-weight: 600;
  color: var(--navy);
}

.table tbody td {
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--border-light);
  color: var(--text-main);
}

.table tbody tr:hover {
  background: var(--accent-soft);
}

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
  font-size: 18px;
  font-weight: 700;
  color: var(--navy);
}

.form-group {
  margin-bottom: var(--space-lg);
}

.form-label {
  display: block;
  margin-bottom: var(--space-sm);
  font-weight: 500;
  color: var(--navy);
  font-size: 12px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: var(--space-md) var(--space-lg);
  border: 1px solid var(--border-rich);
  border-radius: var(--radius-sm);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--text-main);
  transition: var(--transition);
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); /* Using the electric blue highlight color */
}

.form-input::placeholder {
  color: var(--text-muted);
}

.alert {
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}

.alert-success {
  background: var(--success-light);
  color: var(--success);
  border: 1px solid rgba(5, 150, 105, 0.2);
}

.alert-danger {
  background: var(--danger-light);
  color: var(--danger);
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.main-header {
  background: var(--white);
  border-bottom: 1px solid var(--border-light);
  padding: var(--space-xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.page-title {
  margin: 0;
  color: var(--navy);
  font-size: 28px;
  font-weight: 800;
}

.page-subtitle {
  margin-top: 6px;
  color: var(--text-muted);
  font-size: 14px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  background: var(--silver-light);
  border: 1px solid var(--border-light);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--navy);
  color: var(--white);
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 13px;
  font-weight: 700;
  color: var(--navy);
}

.user-role {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-rich);
  background: var(--silver-light);
  color: var(--navy);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.3px;
  padding: 3px 10px;
  text-transform: uppercase;
  line-height: 1.2;
}

.user-role.standard {
  background: var(--silver-light);
  border-color: var(--border-rich);
  color: var(--text-muted);
}

.user-role.premium {
  background: var(--accent-soft);
  border-color: rgba(30, 64, 175, 0.25);
  color: var(--accent-dark);
}

.user-role.admin {
  background: var(--warning-light, #FEF3C7);
  border-color: rgba(217, 119, 6, 0.25);
  color: var(--warning);
}

.balance-section {
  padding: var(--space-xl);
  padding-bottom: var(--space-lg);
}

.balance-card {
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%);
  color: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--space-2xl);
  box-shadow: var(--shadow-lg);
}

.balance-card .card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.balance-visibility-btn {
  border: 1px solid rgba(255, 255, 255, 0.25);
  background: rgba(255, 255, 255, 0.08);
  color: var(--white);
  border-radius: 999px;
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease;
}

.balance-visibility-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.45);
}

.balance-card .card-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  opacity: 0.95;
}

.account-number {
  margin-top: var(--space-sm);
  display: block;
  font-size: 12px;
  opacity: 0.8;
}

.balance-amount {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: var(--space-md);
}

.balance-amount .currency {
  font-size: 24px;
  font-weight: 600;
  opacity: 0.8; /* Subtle transparency for contrast with the actual amount digits */
}

.balance-amount .amount {
  font-size: clamp(30px, 4vw, 44px);
  font-weight: 800;
  line-height: 1;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-variant-numeric: tabular-nums;
}

.balance-change {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.change {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
}

.change.positive {
  color: var(--success);
}

.change.negative {
  color: var(--danger);
}

.change.neutral {
  color: var(--text-muted);
}

.change-period {
  font-size: 13px;
  opacity: 0.8;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-lg);
  padding: 0 var(--space-xl) var(--space-xl);
}

.limits-overview {
  margin: 0 var(--space-xl) var(--space-xl);
  padding: var(--space-lg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--white);
  box-shadow: var(--shadow-sm);
}

.limits-overview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
}

.limits-overview-header h3 {
  margin: 0;
  font-size: 16px;
  color: var(--navy);
  font-weight: 700;
}

.tier-chip {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  border: 1px solid var(--border-rich);
  background: var(--silver-light);
  color: var(--navy);
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  text-transform: uppercase;
}

.limits-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-md);
}

.limit-card {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: var(--space-md);
  background: var(--silver-light);
  min-width: 0;
}

.limit-card h4 {
  margin: 0 0 var(--space-sm);
  font-size: 13px;
  color: var(--navy);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.limit-line {
  margin: 0;
  font-size: 13px;
  color: var(--text-main);
  display: flex;
  justify-content: space-between;
  gap: var(--space-sm);
}

.limit-line + .limit-line {
  margin-top: 6px;
}

.limit-line strong {
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
  word-break: break-word;
  text-align: right;
}

.limit-line.warning strong,
.limit-inline-note .warning strong {
  color: var(--warning);
}

.limit-line.danger strong,
.limit-inline-note .danger strong {
  color: var(--danger);
}

.limits-muted {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
}

.limit-inline-note {
  border: 1px solid var(--border-light);
  background: var(--silver-light);
  border-radius: var(--radius-sm);
  padding: var(--space-md);
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-sm);
  margin-bottom: var(--space-md);
  font-size: 12px;
  color: var(--text-main);
}

.limit-inline-note span {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.limit-inline-note strong {
  font-variant-numeric: tabular-nums;
}

.cta-btn {
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--white);
  color: var(--navy);
  padding: var(--space-lg);
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: var(--space-md);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.cta-btn .btn-icon {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--accent-soft);
  color: var(--accent-dark);
}

.cta-btn.primary {
  background: var(--navy);
  color: var(--white);
  border-color: var(--navy);
}

.cta-btn.primary .btn-icon {
  background: rgba(255, 255, 255, 0.14);
  color: var(--white);
}

.cta-btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.transactions-section {
  padding: 0 var(--space-xl) var(--space-xl);
}

.form-card,
.transactions-section {
  background: var(--white);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
}

.form-card {
  padding: var(--space-xl);
}

.form-header,
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.section-header {
  padding: var(--space-xl) var(--space-xl) 0;
}

.section-header h3,
.form-header h3 {
  margin: 0;
  color: var(--navy);
  font-size: 18px;
  font-weight: 700;
}

.close-btn {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-rich);
  background: var(--white);
  color: var(--text-muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: var(--silver-light);
}

.input-group {
  position: relative;
}

.input-prefix {
  position: absolute;
  left: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  font-weight: 600;
}

.input-group .form-input {
  padding-left: 30px;
}

.submit-btn {
  width: 100%;
  border: none;
  border-radius: var(--radius-sm);
  padding: var(--space-md) var(--space-lg);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

.submit-btn.primary {
  background: var(--navy);
  color: var(--white);
}

.submit-btn.primary:hover:not(:disabled) {
  background: var(--navy-light);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: var(--white);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* =========================================================================
   Transfer / Send Money Modal (Premium Glassmorphism Design)
   ========================================================================= */

.transfer-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 15, 17, 0.6); /* Slightly more opaque dark background */
  backdrop-filter: blur(12px); /* High blur for premium glass effect */
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease forwards;
}

.transfer-modal-content {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-xl);
  padding: var(--space-2xl);
  max-width: 480px;
  width: 90%;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.4) inset;
  transform: translateY(20px) scale(0.95);
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  position: relative;
  overflow: hidden;
}

/* Optional subtle gradient glow behind the modal content */
.transfer-modal-content::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(59, 130, 246, 0.05) 0%, transparent 60%);
  pointer-events: none;
  z-index: -1;
}

.transfer-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.transfer-modal-header h3 {
  margin: 0;
  color: var(--navy);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.5px;
}

.close-modal-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: var(--silver-light);
  color: var(--text-muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-modal-btn:hover {
  background: var(--border-light);
  color: var(--danger);
  transform: rotate(90deg);
}

.transfer-alert {
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
  font-size: 13px;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

.transfer-alert.success {
  background: var(--success-light);
  color: var(--success);
  border: 1px solid rgba(5, 150, 105, 0.2);
}

.transfer-alert.error {
  background: var(--danger-light);
  color: var(--danger);
  border: 1px solid rgba(220, 38, 38, 0.2);
}

.transfer-form-group {
  margin-bottom: var(--space-lg);
}

.transfer-form-label {
  display: block;
  margin-bottom: var(--space-sm);
  font-weight: 600;
  color: var(--navy-light);
  font-size: 13px;
}

.transfer-form-input,
.transfer-form-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border-rich);
  border-radius: var(--radius-md);
  font-family: 'Inter', sans-serif;
  font-size: 15px;
  color: var(--navy);
  background: var(--white);
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0,0,0,0.02) inset;
}

.transfer-form-textarea {
  resize: none;
  line-height: 1.5;
}

.transfer-form-input:focus,
.transfer-form-textarea:focus {
  outline: none;
  border-color: var(--highlight);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15), 0 1px 2px rgba(0,0,0,0.02) inset;
  background: var(--white);
}

.transfer-form-input::placeholder,
.transfer-form-textarea::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.transfer-input-group {
  position: relative;
}

.transfer-input-prefix {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--navy);
  font-weight: 700;
  font-size: 16px;
}

.transfer-input-group .transfer-form-input {
  padding-left: 36px;
  font-size: 18px;
  font-weight: 700;
}

.transfer-text-muted {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--text-muted);
}

.transfer-text-success {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--success);
  font-weight: 600;
}

.transfer-text-danger {
  display: block;
  margin-top: 6px;
  font-size: 12px;
  color: var(--danger);
  font-weight: 500;
}

.transfer-submit-btn {
  width: 100%;
  border: none;
  border-radius: var(--radius-md);
  padding: 16px;
  font-size: 15px;
  font-weight: 700;
  background: var(--navy);
  color: var(--white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: var(--space-xl);
  box-shadow: 0 4px 12px rgba(15, 15, 17, 0.15);
  transition: all 0.2s ease;
}

.transfer-submit-btn:hover:not(:disabled) {
  background: var(--navy-light);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(15, 15, 17, 0.2);
}

.transfer-submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.transfer-submit-btn:disabled {
  opacity: 0.65;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.transfer-loading-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.transfer-loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: var(--white);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ========================================================================= */

.header-actions {
  display: flex;
  gap: var(--space-sm);
}

.filter-toggle-btn,
.export-btn,
.clear-filters-btn,
.pagination-btn,
.page-btn {
  border: 1px solid var(--border-rich);
  background: var(--white);
  color: var(--navy);
  border-radius: var(--radius-sm);
  padding: var(--space-sm) var(--space-md);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.filter-toggle-btn:hover,
.export-btn:hover,
.clear-filters-btn:hover,
.pagination-btn:hover,
.page-btn:hover {
  background: var(--silver-light);
}

.filters-panel {
  margin: var(--space-lg) var(--space-xl);
  padding: var(--space-lg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--silver-light);
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
  margin-bottom: var(--space-md);
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: var(--navy);
}

.filter-select,
.search-input,
.search-type-select,
.date-input,
.amount-input {
  border: 1px solid var(--border-rich);
  border-radius: var(--radius-sm);
  padding: 9px 10px;
  width: 100%;
  background: var(--white);
  color: var(--text-main);
}

.search-group,
.date-range,
.amount-range {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
}

.search-group {
  grid-template-columns: 1fr 180px;
}

.date-range,
.amount-range {
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}

.date-separator,
.amount-separator {
  color: var(--text-muted);
  font-size: 12px;
}

.filter-actions {
  display: flex;
  align-items: flex-end;
}

.table-container {
  margin: var(--space-lg) var(--space-xl) var(--space-xl);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.transactions-table thead th {
  text-align: left;
  padding: var(--space-md);
  font-weight: 700;
  color: var(--navy);
  border-bottom: 1px solid var(--border-light);
  background: var(--silver-light);
  min-width: 0;
}

.transactions-table tbody td {
  padding: var(--space-md);
  border-bottom: 1px solid var(--border-light);
  min-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.transactions-table tbody tr:hover {
  background: var(--accent-soft);
}

.transaction-info {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}

.transaction-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.transaction-icon.deposit {
  background: var(--success-light);
  color: var(--success);
}

.transaction-icon.withdraw {
  background: var(--danger-light);
  color: var(--danger);
}

.transaction-icon.transfer {
  background: var(--accent-soft);
  color: var(--accent-dark);
}

.transaction-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.transaction-title {
  font-weight: 700;
  color: var(--navy);
}

.transaction-subtitle {
  font-size: 12px;
  color: var(--text-muted);
  overflow-wrap: anywhere;
  word-break: break-word;
}

.dashboard-text-cell {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.dashboard-amount-cell {
  font-variant-numeric: tabular-nums;
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.type-badge,
.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  padding: 4px 10px;
}

.type-badge.deposit {
  background: var(--success-light);
  color: var(--success);
}

.type-badge.withdraw {
  background: var(--danger-light);
  color: var(--danger);
}

.type-badge.transfer {
  background: var(--accent-soft);
  color: var(--accent-dark);
}

.status-badge.completed {
  background: var(--success-light);
  color: var(--success);
}

.status-badge.pending {
  background: #fffbeb;
  color: #b45309;
}

.status-badge.failed {
  background: var(--danger-light);
  color: var(--danger);
}

.amount.positive {
  color: var(--success);
  font-weight: 700;
  max-width: 100%;
  display: inline-block;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-variant-numeric: tabular-nums;
}

.amount.negative {
  color: var(--danger);
  font-weight: 700;
  max-width: 100%;
  display: inline-block;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-variant-numeric: tabular-nums;
}

.date {
  color: var(--text-muted);
}

.empty-state {
  padding: var(--space-2xl);
}

.empty-content {
  text-align: center;
  color: var(--text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
}

.pagination {
  margin: 0 var(--space-xl) var(--space-xl);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
}

.pagination-info {
  font-size: 12px;
  color: var(--text-muted);
}

.pagination-controls,
.page-numbers {
  display: flex;
  align-items: center;
  gap: 6px;
}

.page-btn.active {
  background: var(--navy);
  color: var(--white);
  border-color: var(--navy);
}

.pagination-btn:disabled,
.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.sidebar-footer {
  margin-top: auto;
  padding: 0 var(--space-lg) var(--space-lg);
}

.logout-btn {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: var(--white);
  border-radius: var(--radius-sm);
  padding: var(--space-md);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.16);
}

.transaction-detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--space-md);
}

.detail-item {
  background: var(--silver-light);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: var(--space-md);
}

.detail-item label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 6px;
}

.detail-item span {
  color: var(--text-main);
  font-size: 13px;
  font-weight: 600;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.ledger-cell-text {
  overflow-wrap: anywhere;
  word-break: break-word;
}

.ledger-cell-amount {
  font-variant-numeric: tabular-nums;
  max-width: 100%;
  display: inline-block;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.ledger-statement-line {
  margin-bottom: var(--space-sm);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* =========================================================================
   Withdrawal Method Cards Grid
   ========================================================================= */

.transfer-method-selector {
  margin-bottom: var(--space-xl);
}

.method-cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
  margin-top: var(--space-sm);
}

.method-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: var(--space-md) var(--space-sm);
  border: 1px solid var(--border-rich);
  border-radius: var(--radius-md);
  background: var(--white);
  color: var(--navy);
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
}

.method-card svg {
  color: var(--text-muted);
  transition: color 0.2s ease;
}

.method-card span {
  font-size: 13px;
  font-weight: 600;
}

.method-card:hover {
  border-color: var(--navy);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.method-card.active {
  border-color: var(--highlight);
  background: rgba(59, 130, 246, 0.04);
  box-shadow: 0 0 0 1px var(--highlight);
}

.method-card.active svg {
  color: var(--highlight);
}

@media (max-width: 768px) {
  /* Use transform-based off-canvas so we can animate and keep accessibility */
  .sidebar {
    width: 280px;
    transform: translateX(-100%);
    transition: transform 240ms ease-in-out;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 1200;
    box-shadow: var(--shadow-lg);
    overflow-y: auto;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  /* overlay behind the sidebar when open */
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.45);
    opacity: 0;
    pointer-events: none;
    transition: opacity 200ms ease-in-out;
    z-index: 1100;
  }

  .sidebar-overlay.active {
    opacity: 1;
    pointer-events: auto;
  }

  .main-content {
    margin-left: 0;
  }

  .dashboard-header {
    padding: var(--space-lg) var(--space-md);
  }

  .dashboard-container {
    padding: var(--space-lg);
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

  .main-header,
  .balance-section,
  .quick-actions,
  .transaction-form-section,
  .transactions-section {
    padding-left: var(--space-lg);
    padding-right: var(--space-lg);
  }

  .main-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);
  }

  .header-left,
  .user-profile,
  .user-info {
    min-width: 0;
    max-width: 100%;
  }

  .page-title {
    font-size: 22px;
    line-height: 1.25;
    overflow-wrap: anywhere;
  }

  .user-name,
  .user-role {
    overflow-wrap: anywhere;
    word-break: break-word;
  }

  .balance-amount .currency {
    font-size: 20px;
  }

  .balance-amount .amount {
    font-size: clamp(24px, 8vw, 34px);
  }

  /* Mobile menu button - visible on small screens */
  .mobile-menu-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-rich);
    background: var(--white);
    color: var(--navy);
    margin-right: var(--space-md);
    cursor: pointer;
  }

  .mobile-menu-btn:hover {
    background: var(--silver-light);
  }

  /* Place the mobile menu button to the left of the header content */
  .main-header .header-left {
    display: flex;
    align-items: center;
    gap: var(--space-md);
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .limits-overview {
    margin-left: var(--space-lg);
    margin-right: var(--space-lg);
  }

  .limits-overview-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .limits-grid,
  .limit-inline-note {
    grid-template-columns: 1fr;
  }

  .filter-row {
    grid-template-columns: 1fr;
  }

  .search-group,
  .date-range,
  .amount-range {
    grid-template-columns: 1fr;
  }

  .date-separator,
  .amount-separator {
    display: none;
  }

  .table-container,
  .section-header,
  .pagination,
  .filters-panel {
    margin-left: 0;
    margin-right: 0;
  }

  .pagination {
    flex-direction: column;
    align-items: flex-start;
  }

  .table {
    font-size: 11px;
  }

  .table thead th,
  .table tbody td {
    padding: var(--space-sm) var(--space-md);
  }

  .transactions-table {
    min-width: 640px;
  }

  .ledger-statement-line {
    font-size: var(--font-sizes-sm);
    line-height: 1.4;
  }

  .modal-content {
    width: 95%;
    padding: var(--space-xl);
  }
}
`;

export default DASHBOARD_STYLES;

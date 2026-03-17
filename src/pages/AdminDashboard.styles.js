import { DASHBOARD_STYLES } from './Dashboard.styles.js';

export const ADMIN_DASHBOARD_STYLES = `
/* Inherit premium Dashboard Shell styles (Sidebar, Header, Main Content) */
${DASHBOARD_STYLES}

.admin-dashboard-page {
  background-color: var(--silver-light);
  min-height: 100vh;
  font-family: var(--font-family);
  color: var(--text-main);
}

.admin-dashboard-page .navbar {
  box-shadow: var(--shadow-sm);
  background: var(--white) !important;
  border-bottom: 1px solid var(--border-light);
}

.admin-dashboard-page .card {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  background: var(--white);
  transition: var(--transition);
}

.admin-dashboard-page .card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--accent);
}

/* Premium Statistics Cards instead of default Bootstrap colors */
.premium-stat-card {
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%) !important;
  color: var(--white) !important;
  border: 1px solid rgba(255,255,255,0.05) !important;
}

.premium-stat-card h6 {
  color: rgba(255,255,255,0.7);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 12px;
}

.premium-stat-card h2 {
  font-weight: var(--font-weight-bold);
  max-width: 100%;
  overflow-wrap: anywhere;
  word-break: break-word;
  font-variant-numeric: tabular-nums;
}

.premium-stat-card i {
  color: var(--accent); /* Electric Blue icons */
}

/* Table Enhancements */
.admin-dashboard-page .table {
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 0;
  background: var(--white);
  border: 1px solid var(--border-light);
}

.admin-dashboard-page .table thead th {
  border: none;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.5px;
  padding: var(--space-lg);
  background-color: var(--silver-light);
  color: var(--navy);
  font-size: var(--font-sizes-sm);
  text-transform: uppercase;
}

.admin-dashboard-page .table tbody tr {
  border: none;
  transition: background-color var(--transition);
  border-bottom: 1px solid var(--border-light);
}

.admin-dashboard-page .table tbody tr:hover {
  background-color: var(--accentSoft);
}

.admin-dashboard-page .table tbody td {
  vertical-align: middle;
  padding: var(--space-md) var(--space-lg);
  color: var(--text-main);
  font-size: var(--font-sizes-sm);
  max-width: 0;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.admin-dashboard-page .amount-cell {
  font-variant-numeric: tabular-nums;
  font-weight: var(--font-weight-semibold);
}

.admin-dashboard-page .party-cell {
  overflow-wrap: anywhere;
  word-break: break-word;
}

/* Customizing Badges with Theme Tokens */
.admin-dashboard-page .badge {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-sizes-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.5px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
}

.admin-dashboard-page .bg-success {
  background-color: var(--successLight) !important;
  color: var(--success) !important;
}

.admin-dashboard-page .bg-danger {
  background-color: var(--dangerLight) !important;
  color: var(--danger) !important;
}

.admin-dashboard-page .bg-info {
  background-color: var(--accentSoft) !important;
  color: var(--accent) !important;
}

.admin-dashboard-page .bg-warning {
  background-color: var(--warning-light, #FEF3C7) !important;
  color: var(--warning) !important;
}

/* Buttons */
.admin-dashboard-page .btn-sm {
  padding: var(--space-xs) var(--space-sm);
  font-size: var(--font-sizes-xs);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-sm);
}

.admin-dashboard-page .btn-outline-primary {
  color: var(--accent);
  border-color: var(--accent);
}

.admin-dashboard-page .btn-outline-primary:hover {
  background-color: var(--accentSoft);
  color: var(--accentDark);
}

.admin-dashboard-page .btn-outline-secondary {
  color: var(--navy);
  border-color: var(--border-rich);
}

.admin-dashboard-page .btn-outline-secondary:hover {
  background-color: var(--silver-light);
  color: var(--navy);
}

/* Admin Badge specifically on header */
.badge-admin {
  background-color: var(--warning-light, #FEF3C7) !important;
  color: var(--warning) !important;
  letter-spacing: 1px;
}

/* Forms Filters */
.admin-dashboard-page .form-control,
.admin-dashboard-page .form-select {
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-rich);
  padding: var(--space-md) var(--space-lg);
  font-size: var(--font-sizes-sm);
  color: var(--text-main);
  transition: var(--transition);
  font-family: var(--font-family);
  background-color: var(--white);
}

.admin-dashboard-page .form-control:focus,
.admin-dashboard-page .form-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
  outline: none;
}

.admin-dashboard-page .form-control::placeholder {
  color: var(--text-muted);
}

/* Modals */
.admin-dashboard-page .modal-content {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-xl);
  background: var(--white);
}

.admin-dashboard-page .modal-header {
  border-bottom: 1px solid var(--border-light);
  padding: var(--space-xl);
}

.admin-dashboard-page .modal-body {
  padding: var(--space-xl);
}

/* Wrapper paddings over overrides */
.admin-dashboard-inner {
  padding-bottom: var(--space-2xl) !important;
}

@media (max-width: 768px) {
  .admin-dashboard-inner {
    padding: var(--space-lg) !important;
    padding-bottom: var(--space-xl) !important;
  }

  .premium-stat-card h2 {
    font-size: clamp(1.15rem, 5.2vw, 1.6rem);
    line-height: 1.25;
  }

  .admin-dashboard-page .table thead th,
  .admin-dashboard-page .table tbody td {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--font-sizes-xs);
  }

  .admin-dashboard-page .form-control,
  .admin-dashboard-page .form-select,
  .admin-dashboard-page .btn {
    min-height: 40px;
  }
}
`;

export default ADMIN_DASHBOARD_STYLES;

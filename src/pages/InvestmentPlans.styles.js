import { DASHBOARD_STYLES } from './Dashboard.styles.js';

export const INVESTMENT_PLANS_STYLES = `
/* Inherit premium Dashboard Shell styles (Sidebar, Header, Main Content) */
${DASHBOARD_STYLES}

.investment-plans {
  background-color: var(--silver-light);
  min-height: 100vh;
  font-family: var(--font-family);
  color: var(--text-main);
}

.investment-plans .navbar {
  background: var(--white) !important;
  box-shadow: var(--shadow-sm);
  border-bottom: 1px solid var(--border-light);
}

.investment-plans .navbar-brand {
  font-weight: var(--font-weight-bold);
  color: var(--navy) !important;
  font-size: var(--font-sizes-lg);
}

.investment-plans .nav-link {
  color: var(--text-muted) !important;
  font-weight: var(--font-weight-medium);
  transition: var(--transition);
  font-size: var(--font-sizes-sm);
}

.investment-plans .nav-link:hover,
.investment-plans .nav-link.active {
  color: var(--accent) !important;
}

/* Page Header */
.investment-plans-header {
  padding: var(--space-2xl) var(--space-xl);
  background: var(--white);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--space-2xl);
}

.investment-plans-header h1 {
  font-size: var(--font-sizes-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--navy);
  margin: 0;
}

/* Cards */
.investment-plans .investment-plan-card,
.investment-plans .card {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  background: var(--white);
}

/* Premium Statistics Cards */
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

.premium-stat-card h3 {
  font-weight: var(--font-weight-bold);
}

.premium-stat-card i {
  color: var(--accent); /* Electric Blue icons */
}

.investment-plans .investment-plan-card:hover,
.investment-plans .card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent);
}

.investment-plans .investment-plan-card .card-header {
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  border: none;
  padding: var(--space-xl);
  /* The color classes success/warning/danger on JSX are removed and driven by CSS */
}

.investment-plans .investment-plan-card.conservative .card-header {
  background: linear-gradient(135deg, var(--successDark, #065f46) 0%, var(--success, #10b981) 100%);
  color: var(--white);
}

.investment-plans .investment-plan-card.balanced .card-header {
  background: linear-gradient(135deg, var(--warningDark, #d97706) 0%, var(--warning, #f59e0b) 100%);
  color: var(--white);
}

.investment-plans .investment-plan-card.aggressive .card-header {
  background: linear-gradient(135deg, var(--dangerDark, #991b1b) 0%, var(--danger, #ef4444) 100%);
  color: var(--white);
}

.investment-plans .investment-plan-card .card-header h5 {
  margin: 0;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-sizes-lg);
}

.investment-plans .investment-plan-card .card-body {
  padding: var(--space-xl);
}

.investment-plans .card {
  border-radius: var(--radius-md);
}

.investment-plans .table {
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 0;
  background: var(--white);
}

.investment-plans .table thead th {
  border: none;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.5px;
  padding: var(--space-lg);
  background-color: var(--silver-light);
  color: var(--navy);
  font-size: var(--font-sizes-sm);
  text-transform: uppercase;
}

.investment-plans .table tbody tr {
  border: none;
  transition: background-color var(--transition);
  border-bottom: 1px solid var(--border-light);
}

.investment-plans .table tbody tr:hover {
  background-color: var(--accentSoft);
}

.investment-plans .table tbody tr:last-child {
  border-bottom: none;
}

.investment-plans .table tbody td {
  vertical-align: middle;
  padding: var(--space-lg);
  color: var(--text-main);
  font-size: var(--font-sizes-sm);
}

/* Progress Bars */
.investment-plans .progress {
  height: 8px;
  border-radius: var(--radius-md);
  background-color: var(--border-light);
  margin-bottom: var(--space-md);
  overflow: hidden;
}

.investment-plans .progress-bar {
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, var(--accent) 0%, var(--accentDark) 100%);
  transition: width 0.6s ease;
}

/* Badges */
.investment-plans .badge {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-sizes-xs);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.investment-plans .badge-primary {
  background-color: var(--accentSoft);
  color: var(--accent);
}

.investment-plans .badge-success {
  background-color: var(--successLight);
  color: var(--success);
}

.investment-plans .badge-warning {
  background-color: var(--warning-light, #FEF3C7);
  color: var(--warning);
}

.investment-plans .badge-danger {
  background-color: var(--dangerLight);
  color: var(--danger);
}

/* Buttons */
.investment-plans .btn {
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-semibold);
  transition: var(--transition);
  border: none;
  padding: var(--space-md) var(--space-lg);
  font-size: var(--font-sizes-sm);
}

.investment-plans .btn-primary {
  background-color: var(--accent);
  color: var(--white);
  box-shadow: var(--shadow-sm);
}

.investment-plans .btn-primary:hover {
  background-color: var(--accentDark);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.investment-plans .btn-secondary {
  background-color: var(--silver-light);
  color: var(--navy);
  border: 1px solid var(--border-rich);
}

.investment-plans .btn-secondary:hover {
  background-color: var(--border-light);
}

.investment-plans .btn-outline-primary {
  color: var(--accent);
  border: 2px solid var(--accent);
  background: transparent;
}

.investment-plans .btn-outline-primary:hover {
  background-color: var(--accentSoft);
  color: var(--accentDark);
}

/* Form Styles */
.investment-plans .form-label {
  font-weight: var(--font-weight-semibold);
  color: var(--navy);
  margin-bottom: var(--space-sm);
  font-size: var(--font-sizes-sm);
}

.investment-plans .form-control {
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-rich);
  padding: var(--space-md) var(--space-lg);
  font-size: var(--font-sizes-sm);
  color: var(--text-main);
  transition: var(--transition);
}

.investment-plans .form-control:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); /* Electric Blue highlight */
  outline: none;
}

.investment-plans .form-control::placeholder {
  color: var(--text-muted);
}

/* Modal Styles */
.investment-plans .modal-content {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-xl);
}

.investment-plans .modal-header {
  border-bottom: 1px solid var(--border-light);
  padding: var(--space-xl);
  background: var(--white);
}

.investment-plans .modal-title {
  font-weight: var(--font-weight-bold);
  color: var(--navy);
  font-size: var(--font-sizes-lg);
}

.investment-plans .modal-body {
  padding: var(--space-xl);
}

.investment-plans .modal-footer {
  border-top: 1px solid var(--border-light);
  padding: var(--space-xl);
}

/* Alert Styles */
.investment-plans .alert {
  border-radius: var(--radius-md);
  border: 1px solid;
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.investment-plans .alert-info {
  background-color: var(--accentSoft);
  border-color: var(--accent);
  color: var(--accent);
}

.investment-plans .alert-success {
  background-color: var(--successLight);
  border-color: var(--success);
  color: var(--success);
}

.investment-plans .alert-danger {
  background-color: var(--dangerLight);
  border-color: var(--danger);
  color: var(--danger);
}

/* Responsive Styles */
@media (max-width: 768px) {
  .investment-plans-header {
    padding: var(--space-xl) var(--space-lg);
  }

  .investment-plans-header h1 {
    font-size: var(--font-sizes-2xl);
  }

  .investment-plans .table {
    font-size: var(--font-sizes-xs);
  }

  .investment-plans .table thead th,
  .investment-plans .table tbody td {
    padding: var(--space-md);
  }

  .investment-plans .btn {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--font-sizes-xs);
  }
}
`;

export default INVESTMENT_PLANS_STYLES;

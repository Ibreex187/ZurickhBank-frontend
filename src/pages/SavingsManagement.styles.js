import { DASHBOARD_STYLES } from './Dashboard.styles.js';

export const SAVINGS_MANAGEMENT_STYLES = `
/* Inherit premium Dashboard Shell styles (Sidebar, Header, Main Content) */
${DASHBOARD_STYLES}

.savings-management {
  background-color: var(--silver-light);
  min-height: 100vh;
  font-family: var(--font-family);
  color: var(--text-main);
}

.savings-management .navbar {
  background: var(--white) !important;
  box-shadow: var(--shadow-sm);
  border-bottom: 1px solid var(--border-light);
}

.savings-management .navbar-brand {
  font-weight: var(--font-weight-bold);
  color: var(--navy) !important;
  font-size: var(--font-sizes-lg);
}

.savings-management .nav-link {
  color: var(--text-muted) !important;
  font-weight: var(--font-weight-medium);
  transition: var(--transition);
  font-size: var(--font-sizes-sm);
}

.savings-management .nav-link:hover,
.savings-management .nav-link.active {
  color: var(--accent) !important;
}

/* Page Header */
.savings-management-header {
  padding: var(--space-2xl) var(--space-xl);
  background: var(--white);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--space-2xl);
}

.savings-management-header h1 {
  font-size: var(--font-sizes-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--navy);
  margin: 0;
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

/* Cards */
.savings-management .savings-goal-card,
.savings-management .account-type-card,
.savings-management .card {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  background: var(--white);
  overflow: hidden;
}

.savings-management .savings-goal-card:hover,
.savings-management .account-type-card:hover,
.savings-management .card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent);
}

.savings-management .card-header {
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  border: none;
  padding: var(--space-xl);
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%);
  color: var(--white);
}

.savings-management .card-header h5 {
  margin: 0;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-sizes-lg);
}

.savings-management .card-body {
  padding: var(--space-xl);
}

.savings-management .table {
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 0;
  background: var(--white);
}

.savings-management .table thead th {
  border: none;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.5px;
  padding: var(--space-lg);
  background-color: var(--silver-light);
  color: var(--navy);
  font-size: var(--font-sizes-sm);
  text-transform: uppercase;
}

.savings-management .table tbody tr {
  border: none;
  transition: background-color var(--transition);
  border-bottom: 1px solid var(--border-light);
}

.savings-management .table tbody tr:hover {
  background-color: var(--accentSoft);
}

.savings-management .table tbody tr:last-child {
  border-bottom: none;
}

.savings-management .table tbody td {
  vertical-align: middle;
  padding: var(--space-lg);
  color: var(--text-main);
  font-size: var(--font-sizes-sm);
}

/* Progress Bars */
.savings-management .progress {
  height: 10px;
  border-radius: var(--radius-md);
  background-color: var(--border-light);
  margin-bottom: var(--space-md);
  overflow: hidden;
}

.savings-management .progress-bar {
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, var(--success) 0%, var(--accent) 100%);
  transition: width 0.6s ease;
}

/* Badges */
.savings-management .badge {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-sizes-xs);
  font-weight: var(--font-weight-semibold);
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.savings-management .badge-primary {
  background-color: var(--accentSoft);
  color: var(--accent);
}

.savings-management .badge-success {
  background-color: var(--successLight);
  color: var(--success);
}

.savings-management .badge-warning {
  background-color: #fffbeb;
  color: var(--warning);
}

.savings-management .badge-danger {
  background-color: var(--dangerLight);
  color: var(--danger);
}

/* Buttons */
.savings-management .btn {
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-semibold);
  transition: var(--transition);
  border: none;
  padding: var(--space-md) var(--space-lg);
  font-size: var(--font-sizes-sm);
}

.savings-management .btn-primary {
  background-color: var(--accent);
  color: var(--white);
  box-shadow: var(--shadow-sm);
}

.savings-management .btn-primary:hover {
  background-color: var(--accentDark);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.savings-management .btn-secondary {
  background-color: var(--silver-light);
  color: var(--navy);
  border: 1px solid var(--border-rich);
}

.savings-management .btn-secondary:hover {
  background-color: var(--border-light);
}

.savings-management .btn-outline-primary {
  color: var(--accent);
  border: 2px solid var(--accent);
  background: transparent;
}

.savings-management .btn-outline-primary:hover {
  background-color: var(--accentSoft);
  color: var(--accentDark);
}

/* Form Styles */
.savings-management .form-label {
  font-weight: var(--font-weight-semibold);
  color: var(--navy);
  margin-bottom: var(--space-sm);
  font-size: var(--font-sizes-sm);
}

.savings-management .form-control {
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-rich);
  padding: var(--space-md) var(--space-lg);
  font-size: var(--font-sizes-sm);
  color: var(--text-main);
  transition: var(--transition);
}

.savings-management .form-control:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
  outline: none;
}

.savings-management .form-control::placeholder {
  color: var(--text-muted);
}

/* Modal Styles */
.savings-management .modal-content {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-xl);
}

.savings-management .modal-header {
  border-bottom: 1px solid var(--border-light);
  padding: var(--space-xl);
  background: var(--white);
}

.savings-management .modal-title {
  font-weight: var(--font-weight-bold);
  color: var(--navy);
  font-size: var(--font-sizes-lg);
}

.savings-management .modal-body {
  padding: var(--space-xl);
}

.savings-management .modal-footer {
  border-top: 1px solid var(--border-light);
  padding: var(--space-xl);
}

/* Alert Styles */
.savings-management .alert {
  border-radius: var(--radius-md);
  border: 1px solid;
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
}

.savings-management .alert-info {
  background-color: var(--accentSoft);
  border-color: var(--accent);
  color: var(--accent);
}

.savings-management .alert-success {
  background-color: var(--successLight);
  border-color: var(--success);
  color: var(--success);
}

.savings-management .alert-danger {
  background-color: var(--dangerLight);
  border-color: var(--danger);
  color: var(--danger);
}

/* Stats Container */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-xl);
  margin-bottom: var(--space-2xl);
}

.stat-card {
  background: var(--white);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
}

.stat-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.stat-label {
  font-size: var(--font-sizes-sm);
  color: var(--text-muted);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-sm);
}

.stat-value {
  font-size: var(--font-sizes-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--navy);
}

.stat-change {
  font-size: var(--font-sizes-sm);
  margin-top: var(--space-sm);
  font-weight: var(--font-weight-medium);
}

.stat-change.positive {
  color: var(--success);
}

.stat-change.negative {
  color: var(--danger);
}

/* Responsive Styles */
@media (max-width: 768px) {
  .savings-management-header {
    padding: var(--space-xl) var(--space-lg);
  }

  .savings-management-header h1 {
    font-size: var(--font-sizes-2xl);
  }

  .stats-container {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

  .savings-management .table {
    font-size: var(--font-sizes-xs);
  }

  .savings-management .table thead th,
  .savings-management .table tbody td {
    padding: var(--space-md);
  }

  .savings-management .btn {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--font-sizes-xs);
  }
}
`;

export default SAVINGS_MANAGEMENT_STYLES;

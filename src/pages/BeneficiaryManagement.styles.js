import { DASHBOARD_STYLES } from './Dashboard.styles.js';

export const BENEFICIARY_MANAGEMENT_STYLES = `
/* Inherit premium Dashboard Shell styles (Sidebar, Header, Main Content) */
${DASHBOARD_STYLES}

.beneficiary-management {
  background-color: var(--silver-light);
  min-height: 100vh;
  font-family: var(--font-family);
  color: var(--text-main);
}

.beneficiary-management .navbar {
  background: var(--white) !important;
  box-shadow: var(--shadow-sm);
  border-bottom: 1px solid var(--border-light);
}

.beneficiary-management .navbar-brand {
  font-weight: var(--font-weight-bold);
  color: var(--navy) !important;
  font-size: var(--font-sizes-lg);
}

.beneficiary-management .nav-link {
  color: var(--text-muted) !important;
  font-weight: var(--font-weight-medium);
  transition: var(--transition);
  font-size: var(--font-sizes-sm);
}

.beneficiary-management .nav-link:hover,
.beneficiary-management .nav-link.active {
  color: var(--accent) !important;
}

/* Page Header */
.beneficiary-management-header {
  padding: var(--space-2xl) var(--space-xl);
  background: var(--white);
  border-bottom: 1px solid var(--border-light);
  margin-bottom: var(--space-2xl);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-lg);
}

.beneficiary-management-header h1 {
  font-size: var(--font-sizes-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--navy);
  margin: 0;
}

/* Cards */
.beneficiary-management .card {
  border-radius: var(--radius-md);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  background: var(--white);
  overflow: hidden;
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

.premium-stat-card h3 {
  font-weight: var(--font-weight-bold);
}

.premium-stat-card i {
  color: var(--accent); /* Electric Blue icons */
}

.beneficiary-management .card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent);
}

.beneficiary-management .card-header {
  border: none;
  padding: var(--space-xl);
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-light) 100%);
  color: var(--white);
}

.beneficiary-management .card-header h5 {
  margin: 0;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-sizes-lg);
}

.beneficiary-management .card-body {
  padding: var(--space-xl);
}

/* Table */
.beneficiary-management .table {
  border-radius: var(--radius-md);
  overflow: hidden;
  margin-bottom: 0;
  background: var(--white);
  border: 1px solid var(--border-light);
}

.beneficiary-management .table thead th {
  border: none;
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.5px;
  padding: var(--space-lg);
  background-color: var(--silver-light);
  color: var(--navy);
  font-size: var(--font-sizes-sm);
  text-transform: uppercase;
}

.beneficiary-management .table tbody tr {
  border: none;
  transition: background-color var(--transition);
  border-bottom: 1px solid var(--border-light);
}

.beneficiary-management .table tbody tr:hover {
  background-color: var(--accentSoft);
}

.beneficiary-management .table tbody tr:last-child {
  border-bottom: none;
}

.beneficiary-management .table tbody td {
  vertical-align: middle;
  padding: var(--space-lg);
  color: var(--text-main);
  font-size: var(--font-sizes-sm);
}

.beneficiary-management .table-action {
  display: flex;
  gap: var(--space-md);
  justify-content: flex-start;
}

/* Badges */
.beneficiary-management .badge {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-sizes-xs);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.5px;
  border-radius: var(--radius-full);
  text-transform: uppercase;
}

.beneficiary-management .badge-primary {
  background-color: var(--accentSoft);
  color: var(--accent);
}

.beneficiary-management .badge-success {
  background-color: var(--successLight);
  color: var(--success);
}

.beneficiary-management .badge-danger {
  background-color: var(--dangerLight);
  color: var(--danger);
}

.beneficiary-management .badge-warning {
  background-color: var(--warning-light, #FEF3C7);
  color: var(--warning);
}

/* Buttons */
.beneficiary-management .btn {
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-semibold);
  transition: var(--transition);
  border: none;
  padding: var(--space-md) var(--space-lg);
  font-size: var(--font-sizes-sm);
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
}

.beneficiary-management .btn-sm {
  padding: var(--space-sm) var(--space-md);
  font-size: var(--font-sizes-xs);
}

.beneficiary-management .btn-primary {
  background-color: var(--accent);
  color: var(--white);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--accent);
}

.beneficiary-management .btn-primary:hover {
  background-color: var(--accentDark);
  border-color: var(--accentDark);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.beneficiary-management .btn-secondary {
  background-color: var(--silver-light);
  color: var(--navy);
  border: 1px solid var(--border-rich);
}

.beneficiary-management .btn-secondary:hover {
  background-color: var(--border-light);
}

.beneficiary-management .btn-outline-primary {
  color: var(--accent);
  border: 2px solid var(--accent);
  background: transparent;
}

.beneficiary-management .btn-outline-primary:hover {
  background-color: var(--accentSoft);
  color: var(--accentDark);
}

.beneficiary-management .btn-danger {
  background-color: var(--danger);
  color: var(--white);
  border: 1px solid var(--danger);
}

.beneficiary-management .btn-danger:hover {
  background-color: var(--red, #B91C1C);
  border-color: var(--red, #B91C1C);
  box-shadow: var(--shadow-md);
}

/* Form Styles */
.beneficiary-management .form-label {
  font-weight: var(--font-weight-semibold);
  color: var(--navy);
  margin-bottom: var(--space-sm);
  font-size: var(--font-sizes-sm);
}

.beneficiary-management .form-control,
.beneficiary-management .form-select {
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-rich);
  padding: var(--space-md) var(--space-lg);
  font-size: var(--font-sizes-sm);
  color: var(--text-main);
  transition: var(--transition);
  font-family: var(--font-family);
}

.beneficiary-management .form-control:focus,
.beneficiary-management .form-select:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2); /* Electric Blue highlight */
  outline: none;
}

.beneficiary-management .form-control::placeholder {
  color: var(--text-muted);
}

/* Modal Styles */
.beneficiary-management .modal-content {
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-xl);
  background: var(--white);
}

.beneficiary-management .modal-header {
  border-bottom: 1px solid var(--border-light);
  padding: var(--space-xl);
  background: var(--white);
}

.beneficiary-management .modal-title {
  font-weight: var(--font-weight-bold);
  color: var(--navy);
  font-size: var(--font-sizes-lg);
}

.beneficiary-management .modal-body {
  padding: var(--space-xl);
}

.beneficiary-management .modal-footer {
  border-top: 1px solid var(--border-light);
  padding: var(--space-xl);
  background: var(--silver-light);
}

.beneficiary-management .btn-close {
  filter: brightness(0.5);
}

.beneficiary-management .btn-close:hover {
  filter: brightness(0.3);
}

/* Alert Styles */
.beneficiary-management .alert {
  border-radius: var(--radius-md);
  border: 1px solid;
  padding: var(--space-lg);
  margin-bottom: var(--space-lg);
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}

.beneficiary-management .alert-info {
  background-color: var(--accentSoft);
  border-color: var(--accent);
  color: var(--accent);
}

.beneficiary-management .alert-success {
  background-color: var(--successLight);
  border-color: var(--success);
  color: var(--success);
}

.beneficiary-management .alert-danger {
  background-color: var(--dangerLight);
  border-color: var(--danger);
  color: var(--danger);
}

.beneficiary-management .alert-warning {
  background-color: var(--warning-light, #FEF3C7);
  border-color: var(--warning);
  color: var(--warning);
}

/* Beneficiary Card Grid */
.beneficiary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--space-xl);
  margin-bottom: var(--space-2xl);
}

.beneficiary-card {
  background: var(--white);
  border-radius: var(--radius-md);
  padding: var(--space-xl);
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.beneficiary-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
  border-color: var(--accent);
}

.beneficiary-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-md);
}

.beneficiary-name {
  font-size: var(--font-sizes-lg);
  font-weight: var(--font-weight-bold);
  color: var(--navy);
  margin: 0;
}

.beneficiary-account {
  font-size: var(--font-sizes-sm);
  color: var(--text-muted);
  margin: var(--space-sm) 0 0 0;
}

.beneficiary-bank {
  font-size: var(--font-sizes-xs);
  color: var(--accent);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  margin-top: var(--space-sm);
}

.beneficiary-actions {
  display: flex;
  gap: var(--space-sm);
  justify-content: flex-end;
  border-top: 1px solid var(--border-light);
  padding-top: var(--space-lg);
}

/* Spinner/Loading */
.spinner-border {
  color: var(--accent);
}

.spinner-border-sm {
  width: 1.5rem;
  height: 1.5rem;
}

/* Responsive Styles */
@media (max-width: 768px) {
  .beneficiary-management-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .beneficiary-management-header h1 {
    font-size: var(--font-sizes-2xl);
  }

  .beneficiary-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

  .beneficiary-management .table {
    font-size: var(--font-sizes-xs);
  }

  .beneficiary-management .table thead th,
  .beneficiary-management .table tbody td {
    padding: var(--space-md);
  }

  .beneficiary-management .btn {
    padding: var(--space-sm) var(--space-md);
    font-size: var(--font-sizes-xs);
    flex: 1;
  }

  .beneficiary-management .btn-sm {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--font-sizes-xs);
  }

  .table-action {
    flex-direction: column;
  }
}
`;

export default BENEFICIARY_MANAGEMENT_STYLES;

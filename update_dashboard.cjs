const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.styles.js', 'utf8');
const index = code.indexOf('@media (max-width: 768px) {');
if(index !== -1) {
  code = code.substring(0, index);
  
  const newStyles = `
  /* RESPONSIVENESS OVERHAUL */

  /* Breakpoint: Tablet (1024px) */
  @media (max-width: 1024px) {
    .dashboard-grid { grid-template-columns: 1fr; gap: var(--space-xl); }
    .method-cards-grid { grid-template-columns: repeat(2, 1fr); }
    .quick-actions { grid-template-columns: repeat(3, 1fr); }
  }

  /* Breakpoint: Mobile Large (768px) */
  @media (max-width: 768px) {
    .sidebar { width: 280px; transform: translateX(-100%); transition: transform 240ms ease-in-out; position: fixed; left: 0; top: 0; height: 100vh; z-index: 1200; box-shadow: var(--shadow-lg); overflow-y: auto; }
    .sidebar.open { transform: translateX(0); }
    .sidebar-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); opacity: 0; pointer-events: none; transition: opacity 200ms ease-in-out; z-index: 1100; }
    .sidebar-overlay.active { opacity: 1; pointer-events: auto; }
    .main-content { margin-left: 0; }
    .dashboard-header { padding: var(--space-md); }
    .dashboard-container { padding: var(--space-md); }
    .dashboard-grid { gap: var(--space-md); }
    .main-header, .balance-section, .quick-actions, .transaction-form-section, .transactions-section { padding-left: var(--space-md); padding-right: var(--space-md); }
    .main-header { flex-direction: column; align-items: flex-start; gap: var(--space-sm); }
    .header-left, .user-profile, .user-info { min-width: 0; max-width: 100%; }
    .page-title { font-size: 20px; line-height: 1.25; overflow-wrap: anywhere; }
    .user-name, .user-role { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .balance-amount .currency { font-size: 18px; }
    .balance-amount .amount { font-size: clamp(20px, 8vw, 28px); }
    .mobile-menu-btn { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-sm); border: 1px solid var(--border-rich); background: var(--white); color: var(--navy); margin-right: var(--space-md); cursor: pointer; }
    .mobile-menu-btn:hover { background: var(--silver-light); }
    .main-header .header-left { display: flex; align-items: center; gap: var(--space-sm); }
    .quick-actions { grid-template-columns: repeat(2, 1fr); }
    .limits-overview { margin-left: var(--space-md); margin-right: var(--space-md); }
    .limits-overview-header { flex-direction: column; align-items: flex-start; }
    .limits-grid, .limit-inline-note { grid-template-columns: 1fr; }
    .filter-row { grid-template-columns: 1fr; }
    .search-group, .date-range, .amount-range { grid-template-columns: 1fr; }
    .date-separator, .amount-separator { display: none; }
    .table-container, .section-header, .pagination, .filters-panel { margin-left: 0; margin-right: 0; }
    .pagination { flex-direction: column; align-items: flex-start; gap: var(--space-sm); }
    .table { font-size: 11px; }
    .table thead th, .table tbody td { padding: var(--space-sm) var(--space-md); }
    .transactions-table { min-width: 640px; }
    .ledger-statement-line { font-size: var(--font-sizes-sm); line-height: 1.4; }
    .modal-content { width: 95%; padding: var(--space-lg); }
  }

  /* Breakpoint: Mobile Small (480px) */
  @media (max-width: 480px) {
    .quick-actions { grid-template-columns: 1fr; }
    .method-cards-grid { grid-template-columns: 1fr; }
    .page-title { font-size: 18px; }
    .balance-amount .amount { font-size: 24px; }
    .transaction-icon { width: 28px; height: 28px; }
    .transaction-title { font-size: 12px; }
    .dashboard-header, .dashboard-container { padding: var(--space-sm); }
    .main-header, .balance-section, .quick-actions, .transaction-form-section, .transactions-section { padding-left: var(--space-sm); padding-right: var(--space-sm); }
  }

  /* Breakpoint: Extra Small Mobile (375px) */
  @media (max-width: 375px) {
    .balance-amount .amount { font-size: 20px; }
    .action-btn { flex-direction: column; text-align: center; padding: var(--space-sm); }
    .modal-content { padding: var(--space-md); }
  }
`;

  code += newStyles + '`' + ';\n\nexport default DASHBOARD_STYLES;\n';
  fs.writeFileSync('src/pages/Dashboard.styles.js', code);
  console.log('Successfully updated Dashboard.styles.js');
} else {
  console.log('Could not find @media block');
}

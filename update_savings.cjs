const fs = require('fs');
let code = fs.readFileSync('src/pages/SavingsManagement.styles.js', 'utf8');
const index = code.indexOf('@media (max-width: 768px) {');
if(index !== -1) {
  code = code.substring(0, index);
  
  const newStyles = `
  /* RESPONSIVENESS OVERHAUL */

  /* Breakpoint: Tablet (1024px) */
  @media (max-width: 1024px) {
    .stats-container { gap: var(--space-lg); margin-bottom: var(--space-xl); }
    .savings-management-header { padding: var(--space-xl) var(--space-xl); margin-bottom: var(--space-xl); }
    .savings-management .card-body { padding: var(--space-lg); }
    .savings-management .card-header { padding: var(--space-lg); }
  }

  /* Breakpoint: Mobile Large (768px) */
  @media (max-width: 768px) {
    .savings-management-header { padding: var(--space-xl) var(--space-lg); }
    .savings-management-header h1 { font-size: var(--font-sizes-2xl); }
    .stats-container { grid-template-columns: 1fr; gap: var(--space-lg); }
    .savings-management .table { font-size: var(--font-sizes-xs); min-width: 620px; }
    .savings-management .table thead th, .savings-management .table tbody td { padding: var(--space-md); }
    
    .savings-recent-transactions-table { min-width: 0 !important; }
    .savings-recent-transactions-table-wrap { overflow: visible; }
    .savings-recent-transactions-table thead { display: none; }
    .savings-recent-transactions-table, .savings-recent-transactions-table tbody, .savings-recent-transactions-table tr, .savings-recent-transactions-table td { display: block !important; width: 100% !important; }
    .savings-recent-transactions-table tbody { display: grid !important; gap: var(--space-md); }
    .savings-recent-transactions-table tr { border: 1px solid var(--border-light) !important; border-radius: var(--radius-md) !important; background: var(--white); padding: var(--space-md) !important; box-shadow: var(--shadow-sm); }
    .savings-recent-transactions-table td { border: none !important; padding: var(--space-xs) 0 !important; max-width: 100% !important; overflow-wrap: anywhere; word-break: break-word; }
    .savings-recent-transactions-table td::before { content: attr(data-label); display: block; color: var(--text-muted); font-size: var(--font-sizes-xs); font-weight: var(--font-weight-semibold); text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 2px; }
    .savings-recent-transactions-table .savings-amount-cell { font-size: var(--font-sizes-sm); }
    .savings-recent-transactions-table .badge { width: fit-content; max-width: 100%; }
    
    .premium-stat-card h3, .savings-management .card h4 { font-size: clamp(1.05rem, 4.8vw, 1.35rem); line-height: 1.25; }
    .savings-management .btn { padding: var(--space-sm) var(--space-md); font-size: var(--font-sizes-xs); }
    .savings-limit-header { flex-direction: column; align-items: flex-start; }
    .savings-limit-line { flex-direction: column; align-items: flex-start; }
    .stat-card { padding: var(--space-lg); }
    .savings-recent-transactions-table td, .savings-recent-transactions-table .savings-text-cell, .savings-recent-transactions-table .savings-amount-cell { white-space: normal !important; overflow: visible !important; }
  }

  /* Breakpoint: Mobile Small (480px) */
  @media (max-width: 480px) {
    .savings-management-header { padding: var(--space-lg) var(--space-md); margin-bottom: var(--space-lg); }
    .savings-management-header h1 { font-size: var(--font-sizes-xl); }
    .stat-card { padding: var(--space-md); }
    .savings-management .card-header { padding: var(--space-md); }
    .savings-management .card-body { padding: var(--space-md); }
    .savings-management .btn { width: 100%; margin-top: var(--space-sm); padding: var(--space-md); }
  }

  /* Breakpoint: Extra Small Mobile (375px) */
  @media (max-width: 375px) {
    .premium-stat-card h3 { font-size: 1.1rem; }
  }
`;

  code += newStyles + '\`' + ';\n\nexport default SAVINGS_MANAGEMENT_STYLES;\n';
  fs.writeFileSync('src/pages/SavingsManagement.styles.js', code);
  console.log('Successfully updated SavingsManagement.styles.js');
} else {
  console.log('Could not find @media block');
}

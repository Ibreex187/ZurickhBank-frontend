const fs = require('fs');

let styles = fs.readFileSync('src/pages/Dashboard.styles.js', 'utf8');

// Remove the wrongly appended CSS at the very end
styles = styles.replace(/\.transaction-id-value \{ word-break: break-all; white-space: normal !important; \}/g, '');

// Insert it right before the export
styles = styles.replace(
  /`;\s*export default DASHBOARD_STYLES;\s*$/g,
  `
.transaction-id-value {
  word-break: break-all;
  white-space: normal !important;
}
\`;

export default DASHBOARD_STYLES;
`
);

fs.writeFileSync('src/pages/Dashboard.styles.js', styles);
console.log('Fixed Dashboard.styles.js syntax');

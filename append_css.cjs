const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src', 'pages', 'SavingsManagement.styles.js');

let content = fs.readFileSync(file, 'utf8');

// The CSS to append that fixes the mobile Table cell overrides
const cssToAppend = `
@media (max-width: 768px) {
  .savings-recent-transactions-table td,
  .savings-recent-transactions-table .savings-text-cell,
  .savings-recent-transactions-table .savings-amount-cell {
    white-space: normal !important;
    overflow: visible !important;
  }
}
`;

if (!content.includes(cssToAppend.trim())) {
    content += '\n' + cssToAppend + '\n';
    fs.writeFileSync(file, content, 'utf8');
    console.log('Appended mobile fixes successfully');
} else {
    console.log('Already appended.');
}

const fs = require('fs');

// Fix Dashboard.styles.js
let styles = fs.readFileSync('src/pages/Dashboard.styles.js', 'utf8');

styles = styles.replace(
  /.modal-overlay \{\s*position: fixed;\s*top: 0;\s*left: 0;\s*right: 0;\s*bottom: 0;\s*background: rgba\(15, 23, 42, 0\.5\);\s*display: flex;\s*align-items: center;\s*justify-content: center;\s*z-index: 2000;\s*\}/g,
  `.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 3rem 0;
  overflow-y: auto;
  z-index: 2000;
}`
);

styles = styles.replace(
  /.transfer-modal-overlay \{\s*position: fixed;\s*top: 0;\s*left: 0;\s*right: 0;\s*bottom: 0;\s*background: rgba\(15, 15, 17, 0\.6\);\s*\/\* Slightly more opaque dark background \*\/\s*backdrop-filter: blur\(12px\);\s*\/\* High blur for premium glass effect \*\/\s*-webkit-backdrop-filter: blur\(12px\);\s*display: flex;\s*align-items: center;\s*justify-content: center;\s*z-index: 9999;\s*animation: fadeIn 0\.3s ease forwards;\s*\}/g,
  `.transfer-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 15, 17, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 3rem 0;
  overflow-y: auto;
  z-index: 9999;
  animation: fadeIn 0.3s ease forwards;
}`
);

styles = styles.replace(
  /width: 90%;\s*box-shadow: var\(--shadow-xl\);\s*\}/g,
  `width: 90%;\n  box-shadow: var(--shadow-xl);\n  margin: auto;\n}`
);

styles = styles.replace(
  /box-shadow: 0 24px 48px rgba\(0, 0, 0, 0\.12\), 0 0 0 1px rgba\(255, 255, 255, 0\.4\) inset;\s*transform: translateY\(20px\) scale\(0\.95\);\s*animation: slideUp 0\.4s cubic-bezier\(0\.16, 1, 0\.3, 1\) forwards;\s*position: relative;\s*overflow: hidden;\s*\}/g,
  `box-shadow: 0 24px 48px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.4) inset;
  transform: translateY(20px) scale(0.95);
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  position: relative;
  overflow: visible;
  margin: auto;
}`
);

styles += `\n\n.transaction-id-value { word-break: break-all; white-space: normal !important; }\n`;

fs.writeFileSync('src/pages/Dashboard.styles.js', styles);

// Fix Dashboard_new.jsx
let jsx = fs.readFileSync('src/pages/Dashboard_new.jsx', 'utf8');
jsx = jsx.replace(
  /<label>Transaction ID<\/label>\s*<span>\{selectedTransaction\.transactionId\}<\/span>/g,
  `<label>Transaction ID</label>\n                    <span className="transaction-id-value">{selectedTransaction.transactionId}</span>`
);
fs.writeFileSync('src/pages/Dashboard_new.jsx', jsx);

console.log("Fixes applied.");

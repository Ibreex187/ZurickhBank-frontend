const fs = require('fs');

let styles = fs.readFileSync('src/pages/Dashboard.styles.js', 'utf8');

// Replace margin: auto with margin: 0 auto in both places we patched previously.
// `.modal-content`
styles = styles.replace(
  /width: 90%;\s*box-shadow: var\(--shadow-xl\);\s*margin: auto;\s*\}/g,
  `width: 90%;\n  box-shadow: var(--shadow-xl);\n  margin: 0 auto;\n}`
);

// `.transfer-modal-content`
styles = styles.replace(
  /position: relative;\s*overflow: visible;\s*margin: auto;\s*\}/g,
  `position: relative;\n  overflow: visible;\n  margin: 0 auto;\n}`
);

// We need to also check if we can add a bit of bottom margin to ensure it scrolls past the bottom nicely.
// the overlay has padding: 3rem 0; which gives 3rem top and 3rem bottom padding. So it should scroll nicely.
// On mobile, maybe 3rem is too much padding at the top:
// I'll add a mobile media query for the overlay to reduce padding.
styles = styles.replace(
  /\/\* Breakpoint: Mobile Large \(768px\) \*\//,
  `/* Breakpoint: Mobile Large (768px) */
  @media (max-width: 768px) {
    .modal-overlay, .transfer-modal-overlay { padding: 1rem 0; }
  }`
);

fs.writeFileSync('src/pages/Dashboard.styles.js', styles);
console.log('Fixed margin: auto causing vertical jumps.');

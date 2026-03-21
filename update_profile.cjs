const fs = require('fs');
let code = fs.readFileSync('src/pages/Profile.styles.js', 'utf8');

const marker = '/* Responsive Styles */';
const markerIndex = code.indexOf(marker);
const backupIndex = code.indexOf('@media (max-width: 1024px) {');

const cutIndex = markerIndex !== -1 ? markerIndex : backupIndex;

if(cutIndex !== -1) {
  code = code.substring(0, cutIndex);
  
  const newStyles = `
/* RESPONSIVENESS OVERHAUL */

@media (max-width: 1024px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  .profile-grid {
    grid-template-columns: 1fr;
  }
  .profile-avatar-section {
    gap: var(--space-md);
  }
}

@media (max-width: 768px) {
  .profile-container {
    padding: var(--space-lg);
  }
  .profile-header,
  .profile-card {
    padding: var(--space-xl);
  }
  .nav-container {
    padding: 0 var(--space-lg);
    align-items: flex-start;
  }
  .nav-left,
  .nav-right,
  .user-info {
    width: 100%;
    min-width: 0;
  }
  .nav-left {
    flex-wrap: wrap;
    gap: var(--space-md);
  }
  .page-title {
    font-size: var(--font-sizes-xl);
  }
  .profile-tabs {
    gap: var(--space-md);
    padding: 0 var(--space-lg);
    flex-wrap: nowrap;
  }
  .tab-button {
    padding: var(--space-md) var(--space-sm);
    font-size: var(--font-sizes-xs);
  }
  .account-summary .balance-item {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--space-sm);
  }
  .profile-avatar {
    width: 96px;
    height: 96px;
    font-size: var(--font-sizes-3xl);
  }
  .profile-name,
  .profile-email {
    text-align: center;
    justify-content: center;
  }
  .account-summary .account-details {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .profile-container {
    padding: var(--space-md);
  }
  .profile-header,
  .profile-card {
    padding: var(--space-md);
  }
  .page-title {
    font-size: var(--font-sizes-lg);
  }
  .profile-avatar {
    width: 80px;
    height: 80px;
    font-size: var(--font-sizes-2xl);
  }
  .info-grid {
    grid-template-columns: 1fr;
  }
  .edit-form .form-grid {
    grid-template-columns: 1fr;
  }
  .form-actions {
    justify-content: center;
  }
  .btn {
    width: 100%;
    justify-content: center;
  }
  .security-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }
  .change-password-btn {
    margin-left: 0;
    width: 100%;
    margin-top: var(--space-md);
  }
  .modal-content {
    padding: var(--space-lg);
  }
}

@media (max-width: 375px) {
  .nav-container {
    padding: 0 var(--space-md);
  }
  .profile-name {
    font-size: var(--font-sizes-xl);
  }
  .account-summary .balance-item .value {
    font-size: 1.1rem;
  }
}
`;

  code += newStyles + '`' + ';\n\nexport default PROFILE_STYLES;\n';
  fs.writeFileSync('src/pages/Profile.styles.js', code);
  console.log('Successfully updated Profile.styles.js');
} else {
  console.log('Could not find marker');
}

const fs = require('fs');
let code = fs.readFileSync('src/pages/Auth.styles.js', 'utf8');
const index = code.indexOf('@media (max-width: 991px) {');
if(index !== -1) {
  code = code.substring(0, index);
  
  const newStyles = `/* RESPONSIVENESS OVERHAUL */
@media (max-width: 1024px) {
  .auth-container {
    display: block !important;
    position: relative;
    background: var(--navy) !important;
  }
  .auth-left {
    min-height: 100vh;
    padding: 48px 24px;
    justify-content: center;
  }
  .auth-left::before, .auth-left::after {
    display: none;
  }
  .auth-brand {
    top: 24px;
    left: 24px;
  }
  .auth-panel-body {
    margin-top: 20px;
  }
  .auth-panel-body h2 {
    font-size: 2.2rem;
  }
  .auth-testimonial {
    display: none;
  }
  .auth-right {
    padding: 32px 20px !important;
    background: transparent !important;
  }
}

.auth-offcanvas {
  background: var(--bg) !important;
  border-radius: 32px 32px 0 0 !important;
  height: 85vh !important;
  padding: 16px 8px !important;
}

.auth-offcanvas-header {
  border-bottom: none !important;
  padding-bottom: 0 !important;
}

.auth-offcanvas-title {
  font-family: 'Syne', sans-serif;
  font-weight: 800;
  color: var(--navy);
  font-size: 1.4rem;
}

@media (max-width: 768px) {
  .auth-form-wrapper {
    padding: 0 !important;
  }
  .auth-steps {
    gap: 8px !important;
    margin-bottom: 24px !important;
  }
  .auth-step {
    font-size: 0.75rem !important;
  }
}

@media (max-width: 480px) {
  .auth-panel-body h2 {
    font-size: 1.8rem;
  }
  .auth-card {
    box-shadow: none !important;
    border: none !important;
    border-radius: 0 !important;
    background: transparent !important;
  }
  .auth-card .card-body {
    padding: 0 !important;
  }
  .auth-form-title {
    font-size: 1.6rem !important;
  }
}

@media (max-width: 375px) {
  .auth-panel-body h2 {
    font-size: 1.5rem;
  }
  .auth-form-title {
    font-size: 1.4rem !important;
  }
  .auth-left {
    padding: 32px 16px;
  }
  .auth-right {
    padding: 24px 16px !important;
  }
}
`;

  code += newStyles + '\`' + ';\n\nexport default AUTH_STYLES;\n';
  fs.writeFileSync('src/pages/Auth.styles.js', code);
  console.log('Successfully updated Auth.styles.js');
} else {
  console.log('Could not find @media block in Auth');
}

import { THEME_CSS_VARIABLES } from '../theme/index.js';

export const LANDING_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

${THEME_CSS_VARIABLES}

.landing-page {
  font-family: 'Inter', sans-serif;
  color: var(--text-main);
  background: var(--white);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}

h1,
h2,
h3,
h4,
h5,
.brand-logo {
  font-family: 'Inter', sans-serif;
  letter-spacing: -0.03em;
}

.landing-navbar {
  background: rgba(15, 15, 17, 0.85) !important; /* Premium Obsidian Glass */
  -webkit-backdrop-filter: blur(16px);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08); /* Subtle highlight border */
  padding: 16px 0 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.brand-logo {
  font-weight: 800 !important;
  font-size: 1.5rem !important;
  color: var(--white) !important;
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-mark {
  width: 28px;
  height: 32px;
  flex-shrink: 0;
}

.brand-logo .brand-dot {
  color: var(--accent);
}

.landing-navbar .nav-link {
  color: rgba(255, 255, 255, 0.65) !important;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.25s ease;
  padding: 8px 16px !important;
  position: relative;
}

.landing-navbar .nav-link:hover {
  color: var(--white) !important;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.3);
}

.nav-btn-ghost {
  background: transparent !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  color: var(--white) !important;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 10px 24px !important;
  border-radius: 12px !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.nav-btn-ghost:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.5) !important;
  transform: translateY(-1px);
}

.nav-btn-primary {
  background: linear-gradient(135deg, #FDE047 0%, #D97706 100%) !important; /* Exotic Gold Gradient */
  border: none !important;
  color: var(--navy) !important;
  font-size: 0.9rem;
  font-weight: 700;
  padding: 10px 24px !important;
  border-radius: 12px !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  box-shadow: 0 4px 16px rgba(217, 119, 6, 0.25);
}

.nav-btn-primary:hover {
  background: linear-gradient(135deg, #FEF08A 0%, #F59E0B 100%) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(217, 119, 6, 0.4);
}

/* Mobile Toggler Overrides */
.landing-navbar .navbar-toggler {
  border: none !important;
  padding: 8px !important;
}

.landing-navbar .navbar-toggler:focus {
  box-shadow: none !important;
  outline: none !important;
}

.landing-navbar .navbar-toggler-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 30 30'%3e%3cpath stroke='rgba%28255, 255, 255, 0.85%29' stroke-linecap='round' stroke-miterlimit='10' stroke-width='2' d='M4 7h22M4 15h22M4 23h22'/%3e%3c/svg%3e") !important;
}

.hero-section {
  background-color: var(--bg);
  min-height: 90vh;
  padding-top: 120px;
  position: relative;
  display: flex;
  align-items: center;
}

.hero-visual-container {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dashboard-preview {
  background: var(--white);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid var(--border-rich);
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.08);
  width: 100%;
  max-width: 500px;
}

.preview-header {
  background: var(--silver-light);
  padding: 12px 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid var(--border-light);
}

.preview-dots {
  display: flex;
  gap: 6px;
}

.preview-dots span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot-red {
  background: var(--danger);
}

.dot-yellow {
  background: var(--warning);
}

.dot-green {
  background: var(--success);
}

.preview-content {
  padding: 24px;
}

.preview-balance-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.preview-balance-amount {
  font-size: 2.2rem;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 12px;
}

.balance-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--success);
  background: var(--success-light);
  padding: 4px 10px;
  border-radius: 8px;
}

.preview-divider {
  height: 1px;
  background: var(--border-light);
  margin: 20px 0;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}

.action-btn {
  padding: 10px 8px;
  border-radius: 12px;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  background: var(--silver-light);
  color: var(--navy);
}

.action-transfer {
  background: var(--accent-soft);
  color: var(--accent-dark);
}

.action-deposit {
  background: var(--success-light);
  color: var(--success);
}

.action-withdraw {
  background: var(--danger-light);
  color: var(--danger);
}

.txn-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: var(--silver-light);
  border-radius: 12px;
  margin-bottom: 8px;
}

.txn-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.txn-name {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--navy);
}

.txn-date {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.txn-amount {
  font-size: 0.9rem;
  font-weight: 800;
}

.txn-positive {
  color: var(--success);
}

.txn-negative {
  color: var(--danger);
}

.hero-left {
  position: relative;
  z-index: 10;
}

.hero-right {
  position: relative;
  z-index: 1;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--accent-soft);
  border: 1px solid var(--accent);
  color: var(--accent-dark);
  padding: 6px 16px;
  border-radius: 100px;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  margin-bottom: 24px;
}

.hero-title {
  font-family: 'Inter', sans-serif !important;
  font-size: clamp(2.5rem, 5vw, 4rem) !important;
  font-weight: 900 !important;
  color: var(--navy) !important;
  line-height: 1 !important;
  margin-bottom: 20px !important;
  letter-spacing: -0.04em !important;
}

.gradient-text {
  color: var(--accent);
}

.hero-subtitle {
  color: var(--text-muted) !important;
  font-size: 1.1rem !important;
  line-height: 1.6 !important;
  max-width: 480px;
  margin-bottom: 32px !important;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

.hero-btn-primary {
  background: var(--navy) !important;
  border: none !important;
  color: var(--white) !important;
  font-size: 1rem !important;
  font-weight: 700 !important;
  padding: 14px 32px !important;
  border-radius: 12px !important;
  text-decoration: none;
  display: inline-block;
}

.hero-btn-secondary {
  font-size: 1rem !important;
  font-weight: 600 !important;
  padding: 14px 32px !important;
  border-radius: 12px !important;
  border: 1.5px solid var(--border-rich) !important;
  color: var(--navy) !important;
  background: var(--white) !important;
}

.hero-stats {
  display: flex;
  gap: 40px;
}

.stat-item h3 {
  font-size: 1.8rem;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 4px;
}

.stat-item p {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0;
}

.features-section {
  padding: 100px 0;
  background: var(--white);
}

.section-eyebrow {
  text-align: center;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 12px;
}

.section-heading {
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  font-weight: 800;
  color: var(--navy);
  text-align: center;
  margin-bottom: 16px;
}

.section-subtext {
  text-align: center;
  color: var(--text-muted);
  font-size: 1rem;
  line-height: 1.6;
  max-width: 560px;
  margin: 0 auto 64px;
}

.feature-card {
  border: 1px solid var(--border-light) !important;
  border-radius: 20px !important;
  background: var(--silver-light) !important;
  padding: 32px !important;
  height: 100%;
}

.feature-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: var(--white);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 24px;
  border: 1px solid var(--border-light);
}

.feature-card h5 {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 12px;
}

.feature-card p {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
}

.security-section {
  background: var(--navy);
  padding: 100px 0;
  position: relative;
  overflow: hidden;
  border-radius: 32px;
  margin: 0 24px;
}

.security-section .section-heading {
  text-align: left;
  color: var(--white);
}

.security-section .section-eyebrow {
  text-align: left;
}

.security-text {
  color: var(--silver);
  font-size: 1rem;
  line-height: 1.7;
  margin: 16px 0 32px;
}

.security-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--white);
  font-size: 0.9rem;
  font-weight: 600;
}

.security-check {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: var(--navy);
  flex-shrink: 0;
}

.security-visual {
  display: flex;
  justify-content: center;
  align-items: center;
}

.security-shield {
  width: 120px;
  height: 140px;
  background: var(--accent);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: var(--navy);
}

.cta-section {
  padding: 100px 0;
}

.cta-card-wrapper {
  background: var(--navy);
  border-radius: 24px;
  padding: 64px 32px;
  text-align: center;
}

.cta-title {
  font-size: 2.4rem;
  font-weight: 800;
  color: var(--white);
  margin-bottom: 12px;
}

.cta-subtitle {
  color: var(--silver);
  font-size: 1.05rem;
  margin-bottom: 32px;
}

.cta-btn-primary {
  background: var(--accent) !important;
  color: var(--navy) !important;
  padding: 14px 40px !important;
  border-radius: 12px !important;
  font-weight: 800 !important;
  transition: all 0.2s ease;
}

.cta-btn-primary:hover {
  background: var(--white) !important;
  transform: translateY(-2px);
}

.landing-footer {
  background: var(--white);
  padding: 100px 0 40px;
  border-top: 1px solid var(--border-light);
}

.footer-brand {
  font-weight: 800;
  font-size: 1.6rem;
  color: var(--navy);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.footer-brand .logo-mark {
  width: 26px;
  height: 30px;
}

.footer-tagline {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.6;
  max-width: 320px;
  margin-bottom: 24px;
}

.footer-contact-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.footer-heading {
  font-size: 1rem;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 24px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.footer-links .nav-link {
  color: var(--text-muted) !important;
  padding: 8px 0 !important;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.footer-links .nav-link:hover {
  color: var(--accent) !important;
  transform: translateX(4px);
}

.footer-bottom {
  margin-top: 80px;
  padding-top: 40px;
  border-top: 1px solid var(--border-light);
}

.footer-copy {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.footer-socials {
  display: flex;
  gap: 20px;
}

.social-link {
  width: 40px;
  height: 40px;
  background: var(--silver-light);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--navy);
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: var(--navy);
  color: var(--white);
  transform: translateY(-3px);
}

@media (max-width: 991px) {
  .hero-section {
    text-align: center;
    padding-top: 120px;
  }

  .landing-navbar .navbar-collapse {
    background: rgba(15, 15, 17, 0.95);
    margin-top: 16px;
    padding: 24px;
    border-radius: 16px;
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  }

  .landing-navbar .nav-link {
    font-size: 1.1rem;
    padding: 12px 0 !important;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .brand-logo {
    font-size: 1.25rem !important; /* Slightly smaller logo text on mobile */
  }

  .landing-navbar .d-flex {
    margin-top: 24px;
    flex-direction: column;
    width: 100%;
  }

  .landing-navbar .d-flex a {
    width: 100%;
  }

  .nav-btn-ghost, .nav-btn-primary {
    width: 100% !important;
    text-align: center;
    padding: 14px 24px !important;
    margin-bottom: 8px;
  }
  
  .hero-visual-container {
    margin-top: 60px;
    height: 400px;
  }

  .hero-subtitle {
    margin-left: auto;
    margin-right: auto;
  }

  .hero-buttons {
    justify-content: center;
  }

  .hero-stats {
    justify-content: center;
    gap: 24px;
  }

  .security-features {
    grid-template-columns: 1fr;
  }

  .security-section {
    margin: 0;
    border-radius: 0;
  }

  .cta-title {
    font-size: 2.2rem;
  }

  .footer-copy {
    text-align: center;
  }

  .footer-socials {
    justify-content: center;
    margin-top: 20px;
  }
}

@media (max-width: 767px) {
  .hero-title {
    font-size: 2.5rem !important;
  }

  .hero-stats {
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .cta-card-wrapper {
    padding: 48px 24px;
  }

  .feature-card {
    padding: 32px 24px !important;
}

/* Professional touch for the brand text globally */
.brand-text {
  font-family: 'Syne', sans-serif !important;
  font-weight: 800;
  letter-spacing: -0.02em;
  margin-left: 4px;
}
`;
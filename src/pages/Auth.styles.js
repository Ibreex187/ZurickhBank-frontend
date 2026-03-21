export const AUTH_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

:root {
  --navy: #0F0F11;
  --navy-dark: #000000;
  --navy-light: #27272A;
  --green: #3B82F6; /* Mapped previous gold accent to Electric Blue highlight */
  --green-dark: #2563EB;
  --green-soft: #EFF6FF;
  --red: #B91C1C;
  --red-soft: #FEF2F2;
  --amber: #D97706;
  --amber-soft: #FEF3C7;
  --bg: #F4F4F5;
  --text: #0F0F11;
  --muted: #52525B;
  --border: #E4E4E7;
  --white: #FFFFFF;
  --disabled: #A1A1AA;
}

.auth-container {
  font-family: 'DM Sans', sans-serif !important;
  min-height: 100vh !important;
  display: flex !important;
  align-items: stretch !important;
  padding: 0 !important;
  margin: 0 !important;
  background: var(--bg) !important;
  color: var(--text) !important;
  color-scheme: light !important;
}

.auth-container .row {
  width: 100% !important;
  margin: 0 !important;
}

.auth-container .col-lg-5,
.auth-container .col-xl-4,
.auth-container .col-lg-7,
.auth-container .col-xl-8 {
  padding: 0 !important;
}

.auth-left {
  background: var(--navy);
  display: flex;
  flex-direction: column;
  justify-content: center; /* Center the panel content vertically for better balance */
  padding: 64px 72px; /* Increased padding for a more spacious, premium feel */
  position: relative;
  overflow: hidden;
  min-height: 100vh;
}

.auth-left::before {
  content: '';
  position: absolute;
  top: -160px;
  right: -160px;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(226, 232, 240, 0.15) 0%, transparent 65%);
  pointer-events: none;
}

.auth-left::after {
  content: '';
  position: absolute;
  bottom: -120px;
  left: -120px;
  width: 380px;
  height: 380px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(39, 39, 42, 0.8) 0%, transparent 70%);
  pointer-events: none;
}

.auth-brand {
  display: flex;
  align-items: center;
  text-decoration: none;
  position: absolute; /* Lock logo to top */
  top: 40px;
  left: 60px;
  z-index: 10;
}

.auth-brand-dot {
  color: var(--green);
}

.auth-panel-body {
  position: relative;
  z-index: 1;
  margin-top: 80px; /* Significant spacing from the absolutely positioned logo to separate from welcome message */
}

.auth-panel-body h2 {
  font-family: 'Syne', sans-serif;
  font-size: 2.8rem; /* Much larger, more editorial heading */
  font-weight: 800;
  color: var(--white);
  line-height: 1.1;
  margin-bottom: 24px;
  letter-spacing: -0.03em;
}

.auth-panel-body p {
  color: rgba(255, 255, 255, 0.65);
  font-size: 1.1rem; /* Slightly larger, more readable subtext */
  line-height: 1.8;
  margin-bottom: 48px;
  max-width: 90%;
}

.auth-features {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.auth-feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.88rem;
  font-weight: 500;
}

.auth-feature-check {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--green);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  color: var(--white);
  flex-shrink: 0;
}

.auth-testimonial {
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  padding: 20px 22px;
}

.auth-testimonial-text {
  color: rgba(255, 255, 255, 0.75);
  font-size: 0.85rem;
  line-height: 1.65;
  font-style: italic;
  margin-bottom: 12px;
}

.auth-testimonial-author {
  display: flex;
  align-items: center;
  gap: 10px;
}

.auth-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--green), var(--navy-light));
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--white);
}

.auth-author-name {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--white);
}

.auth-author-role {
  font-size: 0.74rem;
  color: rgba(255, 255, 255, 0.45);
}

.auth-right {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  background: var(--bg);
  min-height: 100vh;
}

.auth-form-wrapper {
  width: 100%;
  max-width: 480px;
}

.auth-form-header {
  margin-bottom: 32px;
}

.auth-form-eyebrow {
  font-size: 0.74rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--green);
  margin-bottom: 8px;
}

.auth-form-title {
  font-family: 'Syne', sans-serif;
  font-size: 1.9rem;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 6px;
}

.auth-subtitle {
  color: var(--muted);
  font-size: 0.92rem;
  margin: 0;
}

.auth-steps {
  display: flex;
  align-items: center;
  gap: 0;
  margin-bottom: 28px;
}

.auth-step {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--muted);
}

.auth-step.active {
  color: var(--navy);
}

.auth-step.done {
  color: var(--green);
}

.step-num {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--muted);
}

.auth-step.active .step-num {
  background: var(--navy);
  color: var(--white);
}

.auth-step.done .step-num {
  background: var(--green);
  color: var(--white);
}

.step-line {
  flex: 1;
  height: 1px;
  background: var(--border);
  margin: 0 8px;
}

.auth-card {
  background: var(--white) !important;
  border: 1px solid var(--border) !important;
  border-radius: 18px !important;
  box-shadow: 0 10px 28px rgba(23, 47, 114, 0.12) !important;
  overflow: hidden;
}

.auth-card .card-body {
  padding: 36px 32px !important;
}

.auth-card .form-label {
  font-size: 0.83rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 6px;
}

.auth-card .form-control {
  height: 44px;
  border: 1.5px solid var(--border) !important;
  border-radius: 10px !important;
  font-family: 'DM Sans', sans-serif;
  font-size: 0.92rem;
  color: var(--text);
  background: var(--bg) !important;
  transition: all 0.2s;
  padding: 0 14px;
}

.auth-card .form-control:focus {
  border-color: var(--navy) !important;
  background: var(--white) !important;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.14) !important;
  outline: none;
}

.auth-card .form-control.is-invalid {
  border-color: var(--red) !important;
  background: var(--bg) !important;
}

.auth-card .form-control.is-invalid:focus {
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1) !important;
}

.auth-card .invalid-feedback {
  font-size: 0.78rem;
  color: var(--red);
  margin-top: 4px;
}

.auth-card .form-control::placeholder {
  color: var(--disabled);
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 0.9rem;
  color: var(--muted);
  pointer-events: none;
  z-index: 1;
}

.input-wrap .form-control {
  padding-left: 38px !important;
}

.auth-submit-btn {
  width: 100%;
  height: 48px;
  background: var(--navy) !important;
  border: none !important;
  border-radius: 10px !important;
  font-family: 'DM Sans', sans-serif !important;
  font-size: 0.95rem !important;
  font-weight: 600 !important;
  color: var(--white) !important;
  letter-spacing: 0.01em;
  transition: all 0.25s !important;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
}

.auth-submit-btn:hover:not(:disabled) {
  background: var(--navy-dark) !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 8px 20px rgba(15, 15, 17, 0.28) !important;
}

.auth-submit-btn:disabled {
  background: var(--disabled) !important;
  cursor: not-allowed;
}

.auth-footer {
  text-align: center;
  font-size: 0.87rem;
  color: var(--muted);
  margin: 0;
}

.auth-footer a {
  color: var(--green);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s;
}

.auth-footer a:hover {
  color: var(--green-dark);
}

.auth-alert {
  border: none !important;
  border-radius: 10px !important;
  border-left: 4px solid var(--red) !important;
  background: var(--red-soft) !important;
  color: var(--red) !important;
  font-size: 0.85rem;
  padding: 12px 16px !important;
  margin-bottom: 20px;
}

.auth-terms {
  font-size: 0.76rem;
  color: var(--muted);
  text-align: center;
  margin-top: 16px;
  line-height: 1.6;
}

.auth-terms a {
  color: var(--navy);
  font-weight: 600;
  text-decoration: none;
}

.auth-terms a:hover {
  color: var(--green);
}

/* RESPONSIVENESS OVERHAUL */
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

export default AUTH_STYLES;

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Container, Row, Col, Navbar, Nav } from 'react-bootstrap';
import AppButton from '../components/AppButton';
import ZurichBrand from '../components/ZurichBrand';

/* ── Sub-components ────────────────────────── */

const NavBar = () => (
  <Navbar className="landing-navbar" expand="lg" fixed="top">
    <Container fluid="xxl">
      <Navbar.Brand as={Link} to="/" className="brand-logo">
        <ZurichBrand showText={true} />
      </Navbar.Brand>
      <Navbar.Toggle aria-controls="main-nav" />
      <Navbar.Collapse id="main-nav">
        <Nav className="mx-auto">
          <Nav.Link href="#features">Features</Nav.Link>
          <Nav.Link href="#security">Security</Nav.Link>
          <Nav.Link href="#about">About</Nav.Link>
        </Nav>
        <div className="d-flex gap-2 align-items-center">
          <Link to="/login">
            <AppButton className="nav-btn-ghost" backgroundColor="transparent" textColor="var(--navy)" borderColor="var(--navy)">
              Login
            </AppButton>
          </Link>
          <Link to="/register">
            <AppButton className="nav-btn-primary" backgroundColor="var(--navy)">
              Get Started
            </AppButton>
          </Link>
        </div>
      </Navbar.Collapse>
    </Container>
  </Navbar>
);

const DashboardPreview = () => (
  <div className="dashboard-preview">
    <div className="preview-header">
      <div className="preview-dots">
        <span className="dot-red" />
        <span className="dot-yellow" />
        <span className="dot-green" />
      </div>
    </div>

    <div className="preview-content">
      <div className="preview-balance-label">Total Balance (sample)</div>
      <div className="preview-balance-amount">₦1,250,000.00</div>
      <span className="balance-badge">&#8593; +3.2% this month</span>

      <div className="preview-divider" />

      <div className="quick-actions">
        <div className="action-btn action-transfer">&#8644; Transfer</div>
        <div className="action-btn action-deposit">&#8595; Deposit</div>
        <div className="action-btn action-withdraw">&#8593; Withdraw</div>
      </div>

      <div className="preview-transactions">
        {[
          { icon: '💰', className: 'icon-salary', name: 'Salary Deposit', date: 'Feb 15, 2026', amount: '+₦3,500,000.00', cls: 'txn-positive' },
          { icon: '🛒', className: 'icon-grocery', name: 'Grocery Store', date: 'Feb 14, 2026', amount: '-₦84,200.20', cls: 'txn-negative' },
          { icon: '💡', className: 'icon-utility', name: 'Electricity Bill', date: 'Feb 12, 2026', amount: '-₦52,000.00', cls: 'txn-negative' },
        ].map((t) => (
          <div className="txn-row" key={t.name}>
            <div className="txn-info">
              <div className={`txn-icon ${t.className}`}>{t.icon}</div>
              <div>
                <div className="txn-name">{t.name}</div>
                <div className="txn-date">{t.date}</div>
              </div>
            </div>
            <div className={`txn-amount ${t.cls}`}>{t.amount}</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const HeroSection = () => (
  <section className="hero-section">
    <Container>
      <Row className="align-items-center min-vh-100 py-5">
        <Col lg={6} className="hero-left">
          <div className="hero-badge">
            <span className="badge-dot" />
            A demo banking experience
          </div>

          <h1 className="hero-title">
            Modern Banking<br />
            <span className="gradient-text">for Everyone.</span>
          </h1>

          <p className="hero-subtitle">
            Experience a clean, fast, and secure banking platform designed for
            simplicity. No hidden fees, no complex functions. Just results.
          </p>

          <div className="hero-buttons">
            <Link to="/register">
              <AppButton className="hero-btn-primary" size="lg" backgroundColor="var(--navy)">
                Open Account
              </AppButton>
            </Link>
          </div>

          <p className="small mt-3 mb-0" style={{ color: 'var(--text-muted)' }}>
            Demo application. No real money is held or moved.
          </p>

          <div className="hero-stats">
            <div className="stat-item">
              <h3>₦99,999</h3>
              <p>Starter balance</p>
            </div>
            <div className="stat-item">
              <h3>₦0</h3>
              <p>Transfer fees</p>
            </div>
          </div>
        </Col>

        <Col lg={6} className="hero-right mt-5 mt-lg-0">
          <div className="hero-visual-container">
            <DashboardPreview />
          </div>
        </Col>
      </Row>
    </Container>
  </section>
);

const FEATURES = [
  { icon: '💳', title: 'Instant Transfers', desc: 'Send and receive money instantly with zero fees between Zurich Bank accounts. Real-time settlement, no waiting.' },
  { icon: '📊', title: 'Clear History', desc: 'Search and filter your full transaction history by date, type, recipient or amount, and export it to CSV.' },
  { icon: '📱', title: 'Mobile First', desc: 'Access your account anywhere with our fully responsive design. Optimised for every screen and every device.' },
  { icon: '🔔', title: 'Activity Alerts', desc: 'Get in-app and email notifications for debits, credits, transfers and security events, with per-category email controls.' },
  { icon: '🏦', title: 'Savings', desc: 'Move money into a separate savings balance and track your deposits, withdrawals and net savings.' },
  { icon: '📈', title: 'Stock Simulator', desc: 'Practice buying and selling stocks with simulated prices, and follow your portfolio profit and loss.' },
];

const SECURITY_ITEMS = [
  'Encrypted connections (HTTPS)',
  'Transaction PIN on every money movement',
  'Email OTP for sensitive account changes',
  'Alerts on failed sign-in attempts',
];

const FeaturesSection = () => (
  <section id="features" className="features-section">
    <Container>
      <div className="text-center mb-5">
        <div className="section-eyebrow">Capabilities</div>
        <h2 className="section-heading">Built for Modern Finance</h2>
      </div>
      <Row className="g-4">
        {FEATURES.map((f) => (
          <Col lg={4} md={6} key={f.title}>
            <div className="feature-card">
              <div className="feature-icon">{f.icon}</div>
              <h5>{f.title}</h5>
              <p>{f.desc}</p>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  </section>
);

const SecuritySection = () => (
  <section id="security" className="security-section">
    <Container>
      <Row className="align-items-center">
        <Col lg={7}>
          <div className="section-eyebrow">Security First</div>
          <h2 className="section-heading">Your Data, Protected.</h2>
          <p className="security-text">
            We employ industry-leading security protocols to ensure your financial
            information remains private and protected at all times.
          </p>
          <div className="security-features">
            {SECURITY_ITEMS.map((item) => (
              <div className="security-item" key={item}>
                <div className="security-check">✓</div>
                {item}
              </div>
            ))}
          </div>
        </Col>
        <Col lg={5} className="text-center mt-5 mt-lg-0">
          <div className="security-visual">
            <div className="security-shield">🛡️</div>
          </div>
        </Col>
      </Row>
    </Container>
  </section>
);

const CtaSection = () => (
  <section className="cta-section">
    <Container>
      <div className="cta-card-wrapper">
        <h2 className="cta-title">Ready for Better Banking?</h2>
        <p className="cta-subtitle">
          Create a free demo account and explore transfers, savings and a stock simulator.
          Sign-up takes about a minute.
        </p>
        <div className="d-flex gap-3 justify-content-center flex-wrap">
          <Link to="/register">
            <AppButton size="lg" className="cta-btn-primary" backgroundColor="var(--navy)">
              Connect Now
            </AppButton>
          </Link>
          <Link to="/login">
            <AppButton size="lg" backgroundColor="transparent" textColor="var(--white)" borderColor="var(--white)">
              Sign In
            </AppButton>
          </Link>
        </div>
      </div>
    </Container>
  </section>
);

const Footer = () => (
  <footer className="landing-footer">
    <Container>
      <Row className="gy-5">
        <Col lg={4} md={12}>
          <div className="footer-brand">
            <ZurichBrand showText={true} className="footer-brand-inline" />
          </div>
          <p className="footer-tagline">
            Empowering your financial future with next-generation banking solutions by Zurich.
            Secure, transparent, and built for you.
          </p>
          <div className="footer-contact-info">
            <p>📧 support@zurichbank.example</p>
          </div>
        </Col>

        <Col lg={2} md={4} sm={6}>
          <h5 className="footer-heading">Product</h5>
          <Nav className="flex-column footer-links">
            <Nav.Link href="#">Personal Accounts</Nav.Link>
            <Nav.Link href="#">Savings & Vaults</Nav.Link>
          </Nav>
        </Col>

        <Col lg={2} md={4} sm={6}>
          <h5 className="footer-heading">Company</h5>
          <Nav className="flex-column footer-links">
            <Nav.Link href="#">About Us</Nav.Link>
            <Nav.Link href="#">Privacy Policy</Nav.Link>
          </Nav>
        </Col>

        <Col lg={2} md={4} sm={6}>
          <h5 className="footer-heading">Support</h5>
          <Nav className="flex-column footer-links">
            <Nav.Link href="#">Help Center</Nav.Link>
            <Nav.Link href="#">Security</Nav.Link>
            <Nav.Link href="#">Contact Us</Nav.Link>
            <Nav.Link href="#">FAQ</Nav.Link>
          </Nav>
        </Col>
      </Row>

      <div className="footer-bottom">
        <Row className="align-items-center">
          <Col md={6}>
            <p className="footer-copy mb-0">&copy; 2026 Zurich Bank. Demo project, not a real bank. No real money is held or moved.</p>
          </Col>
          <Col md={6} className="text-md-end mt-3 mt-md-0">
            <div className="footer-socials">
              <span className="social-link">𝕏</span>
              <span className="social-link">in</span>
              <span className="social-link">📷</span>
            </div>
          </Col>
        </Row>
      </div>
    </Container>
  </footer>
);


const LandingPage = ({ styles }) => (
  <>
    {styles ? <style>{styles}</style> : null}
    <div className="landing-page">
      <NavBar />
      <HeroSection />
      <FeaturesSection />
      <SecuritySection />
      <CtaSection />
      <Footer />
    </div>
  </>
);

LandingPage.propTypes = {
  styles: PropTypes.string,
};

export default LandingPage;
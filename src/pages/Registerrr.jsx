import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Row, Col,
  Form as BootstrapForm,
  Alert, Offcanvas
} from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import { useAuth } from '../context/AuthContext';
import AppButton from '../components/AppButton';
import ZurichBrand from '../components/ZurichBrand';

/* ─── Validation ──────────────────────────── */
const validate = (values) => {
  const errors = {};
  if (!values.firstName) errors.firstName = 'First name is required';
  if (!values.lastName) errors.lastName = 'Last name is required';
  if (!values.userName) {
    errors.userName = 'Username is required';
  } else if (values.userName.length < 3) {
    errors.userName = 'Username must be at least 3 characters';
  }
  if (!values.email) {
    errors.email = 'Email is required';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
    errors.email = 'Invalid email address';
  }
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }
  return errors;
};

/* ─── InputField ──────────────────────────── */
const InputField = ({ label, name, type = 'text', placeholder, icon }) => (
  <BootstrapForm.Group className="mb-3">
    <BootstrapForm.Label>{label}</BootstrapForm.Label>
    <Field name={name}>
      {({ field, meta }) => (
        <>
          <div className={icon ? 'input-wrap' : ''}>
            {icon && <span className="input-icon">{icon}</span>}
            <BootstrapForm.Control
              {...field}
              type={type}
              placeholder={placeholder}
              isInvalid={meta.touched && !!meta.error}
            />
          </div>
          {meta.touched && meta.error && (
            <BootstrapForm.Control.Feedback type="invalid" style={{ display: 'block' }}>
              {meta.error}
            </BootstrapForm.Control.Feedback>
          )}
        </>
      )}
    </Field>
  </BootstrapForm.Group>
);

/* ─── Left decorative panel ───────────────── */
const AuthPanel = ({ onOpenForm }) => (
  <div className="auth-left">
    {/* Brand */}
    <Link to="/" className="auth-brand">
      <ZurichBrand showText={true} />
    </Link>

    {/* Main copy */}
    <div className="auth-panel-body">
      <h2>Start your financial journey today.</h2>
      <p>
        Join over 50,000 customers who manage their money smarter with
        Zurich Bank — instant transfers, real-time analytics, and bank-level security.
      </p>
      <div className="auth-features">
        {[
          'Zero-fee instant transfers',
          'Smart spending analytics',
          '256-bit TSL encryption',
          'NDIC insured up to ₦250,000',
        ].map((f) => (
          <div className="auth-feature-item" key={f}>
            <div className="auth-feature-check">✓</div>
            {f}
          </div>
        ))}
      </div>
    </div>

    {/* Testimonial */}
    <div className="auth-testimonial">
      <p className="auth-testimonial-text">
        &quot;Zurich Bank completely changed how I manage my finances. The dashboard
        is beautiful and everything just works.&quot;
      </p>
      <div className="auth-testimonial-author">
        <div className="auth-avatar">MMs</div>
        <div>
          <div className="auth-author-name">El-Mubarak(Saturn) Moh</div>
          <div className="auth-author-role">Small Business Owner</div>
        </div>
      </div>
    </div>

    {/* Mobile Only: Re-open form button */}
    <div className="d-lg-none mt-5 text-center px-3">
      <AppButton onClick={onOpenForm} backgroundColor="var(--green)" size="lg" fullWidth>
        Create an Account
      </AppButton>
    </div>
  </div>
);

/* ─── Main Register component ─────────────── */
const Register = ({ styles }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setShowOffcanvas(true);
  }, []);

  const initialValues = {
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    password: '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setError('');
    try {
      await register(values);
      navigate('/login', { state: { message: 'Registration successful! Please login.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <>
      {styles && <style>{styles}</style>}
      <Container fluid className="auth-container" style={{ padding: 0 }}>
        <Row className="g-0 min-vh-100">

          {/* ── Left panel ── */}
          <Col lg={5} xl={4}>
            <AuthPanel onOpenForm={() => setShowOffcanvas(true)} />
          </Col>

          {/* ── Right: form ── */}
          <Col lg={7} xl={8} className="auth-right">
            <Offcanvas
              show={showOffcanvas}
              onHide={() => setShowOffcanvas(false)}
              responsive="lg"
              placement="bottom"
              className="auth-offcanvas"
            >
              <Offcanvas.Header closeButton className="d-lg-none auth-offcanvas-header">
                <Offcanvas.Title className="auth-offcanvas-title">Zurich Bank</Offcanvas.Title>
              </Offcanvas.Header>
              <Offcanvas.Body>
                <div className="auth-form-wrapper">

                  {/* Header */}
                  <div className="auth-form-header">
                    <div className="auth-form-eyebrow">Get started — it&apos;s free</div>
                    <h1 className="auth-form-title">Create your account</h1>
                    <p className="auth-subtitle">
                      Already have an account?{' '}
                      <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
                        Sign in here
                      </Link>
                    </p>
                  </div>

                  {/* Step indicator */}
                  <div className="auth-steps">
                    <div className="auth-step active">
                      <span className="step-num">1</span> Your Details
                    </div>
                    <div className="step-line" />
                    <div className="auth-step">
                      <span className="step-num">2</span> Verify Email
                    </div>
                    <div className="step-line" />
                    <div className="auth-step">
                      <span className="step-num">3</span> Start Banking
                    </div>
                  </div>

                  {/* Form card */}
                  <div
                    style={{
                      background: 'var(--white)',
                      border: '1px solid var(--border)',
                      borderRadius: 18,
                      boxShadow: '0 4px 32px rgba(10,31,68,0.08)',
                      padding: '36px 32px',
                    }}
                  >
                    {error && (
                      <Alert className="auth-alert">{error}</Alert>
                    )}

                    <Formik
                      initialValues={initialValues}
                      validate={validate}
                      onSubmit={handleSubmit}
                    >
                      {({ isSubmitting }) => (
                        <Form noValidate>

                          {/* Name row */}
                          <Row>
                            <Col md={6}>
                              <InputField
                                name="firstName"
                                label="First Name"
                                placeholder="kol"
                                icon="👤"
                              />
                            </Col>
                            <Col md={6}>
                              <InputField
                                name="lastName"
                                label="Last Name"
                                placeholder="ade"
                              />
                            </Col>
                          </Row>

                          <InputField
                            name="userName"
                            label="Username"
                            placeholder="kol_ade"
                            icon="@"
                          />

                          <InputField
                            name="email"
                            type="email"
                            label="Email Address"
                            placeholder="kol_ade@example.com"
                            icon="✉"
                          />

                          <InputField
                            name="password"
                            type="password"
                            label="Password"
                            placeholder="Min. 6 characters"
                            icon="🔒"
                          />

                          {/* Password strength hint */}
                          <div
                            style={{
                              display: 'flex',
                              gap: 4,
                              marginTop: -8,
                              marginBottom: 20,
                            }}
                          >
                            {[1, 2, 3, 4].map((i) => (
                              <div
                                key={i}
                                style={{
                                  flex: 1, height: 3, borderRadius: 4,
                                  background: i === 1 ? 'var(--green)' : 'var(--border)',
                                  transition: 'background 0.3s',
                                }}
                              />
                            ))}
                            <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginLeft: 4, whiteSpace: 'nowrap', lineHeight: '14px' }}>
                              Strength
                            </span>
                          </div>

                          <AppButton
                            type="submit"
                            className="auth-submit-btn"
                            backgroundColor="var(--navy)"
                            fullWidth
                            loading={loading || isSubmitting}
                            loadingText="Creating Account..."
                          >
                            Create Account →
                          </AppButton>

                          <p className="auth-terms">
                            By creating an account you agree to our{' '}
                            <a href="/terms">Terms of Service</a> and{' '}
                            <a href="/privacy">Privacy Policy</a>.
                          </p>
                        </Form>
                      )}
                    </Formik>
                  </div>

                  {/* Footer */}
                  <p className="auth-footer" style={{ marginTop: 24 }}>
                    Need help?{' '}
                    <a href="mailto:support@zurich.bank" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>
                      Contact support
                    </a>
                  </p>
                </div>
              </Offcanvas.Body>
            </Offcanvas>
          </Col>
        </Row>
      </Container>
    </>
  );
};

InputField.propTypes = {
  label: PropTypes.node,
  name: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  icon: PropTypes.node,
};

AuthPanel.propTypes = {
  onOpenForm: PropTypes.func,
};

Register.propTypes = {
  styles: PropTypes.string,
};

export default Register;
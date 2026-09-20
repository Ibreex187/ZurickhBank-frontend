import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Form as BootstrapForm, Offcanvas } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import { useAuth } from '../context/AuthContext';
import AppButton from '../components/AppButton';
import PasswordField from '../components/PasswordField';
import ZurichBrand from '../components/ZurichBrand';
import { AUTH_STYLES } from './Auth.styles';

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
        <div>
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
        </div>
      )}
    </Field>
  </BootstrapForm.Group>
);


/* ─── AuthPanel ───────────────────────────── */
const AuthPanel = ({ onOpenRegister }) => (
  <div className="auth-left">
    <div className="auth-brand"><ZurichBrand showText={true} /></div>
    <div className="auth-panel-body">
      <h2>Start your financial journey today.</h2>
      <p>Create a free demo account and explore instant transfers, savings and a stock simulator. No real money is held or moved.</p>
      <div className="auth-features">
        {["Zero-fee instant transfers", "Savings with clear insights", "Encrypted connections (HTTPS)", "Transaction PIN on every transfer"].map((f) => (
          <div className="auth-feature-item" key={f}>
            <div className="auth-feature-check">✓</div>
            {f}
          </div>
        ))}
      </div>
      <div style={{ margin: '32px 0 0 0' }}>
        <AppButton
          fullWidth
          backgroundColor="#2563eb"
          style={{ color: '#fff', fontWeight: 700 }}
          onClick={onOpenRegister}
        >
          Create an Account
        </AppButton>
      </div>
    </div>
    <div className="auth-testimonial">
      <p className="auth-testimonial-text">Demo application: accounts start with a ₦99,999 practice balance and nothing here involves real money.</p>
    </div>
  </div>
);

const Register = () => {
  // Inject AUTH_STYLES into the document head for page-specific styles
  useEffect(() => {
    if (!document.getElementById('auth-styles')) {
      const style = document.createElement('style');
      style.id = 'auth-styles';
      style.innerHTML = AUTH_STYLES;
      document.head.appendChild(style);
    }
    return () => {
      const style = document.getElementById('auth-styles');
      if (style) style.remove();
    };
  }, []);
  // Offcanvas state for mobile
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  // Remove auto-open on mount; trigger with button instead
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const initialValues = {
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    password: '',
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setError('');
    setLoading(true);
    try {
      await register(values);
      navigate('/login', {
        state: { message: 'Registration successful! Please sign in.', userName: values.userName },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Removed fixed mobile Create Account button */}
      <Container fluid className="auth-container" style={{ padding: 0 }}>
        <Row className="g-0 min-vh-100">
          <Col lg={5} xl={4}>
            <AuthPanel onOpenRegister={() => setShowOffcanvas(true)} />
          </Col>
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
                  <div className="auth-form-header">
                    <div className="auth-form-eyebrow">Get started — it&apos;s free</div>
                    <h1 className="auth-form-title">Create your account</h1>
                    <p className="auth-subtitle">
                      Already have an account?{' '}
                      <Link to="/login" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Sign in here</Link>
                    </p>
                  </div>
                  {/* Step indicator */}
                  <Formik initialValues={initialValues} validate={validate} onSubmit={handleSubmit}>
                    {({ values, errors, isSubmitting }) => {
                      const isDetailsFilled = values.firstName && values.lastName && values.userName;
                      const isEmailValid = values.email && !errors.email;
                      const isFormValid = isDetailsFilled && isEmailValid && values.password && !errors.password;
                      return <>
                        <div className="auth-steps" style={{ marginBottom: 28 }}>
                          <div className={`auth-step${isDetailsFilled ? ' done' : ' active'}`}>
                            <span className="step-num">{isDetailsFilled ? '✓' : '1'}</span> Your Details
                          </div>
                          <div className="step-line" />
                          <div className={`auth-step${isEmailValid ? ' done' : (isDetailsFilled ? ' active' : '')}`}>
                            <span className="step-num">{isEmailValid ? '✓' : '2'}</span> Your Email
                          </div>
                          <div className="step-line" />
                          <div className={`auth-step${isFormValid ? ' done' : (isEmailValid ? ' active' : '')}`}>
                            <span className="step-num">{isFormValid ? '✓' : '3'}</span> Start Banking
                          </div>
                        </div>
                        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 18, boxShadow: '0 4px 32px rgba(10,31,68,0.08)', padding: '36px 32px' }}>
                          {error && (<div className="auth-alert">{error}</div>)}
                          <Form noValidate>
                            <Row>
                              <Col md={6}>
                                <InputField name="firstName" label="First Name" placeholder="kol" icon="👤" />
                              </Col>
                              <Col md={6}>
                                <InputField name="lastName" label="Last Name" placeholder="ade" />
                              </Col>
                            </Row>
                            <InputField name="userName" label="Username" placeholder="kol_ade" icon="@" />
                            <InputField name="email" type="email" label="Email Address" placeholder="kol_ade@example.com" icon="✉" />
                            <Field name="password">
                              {({ field, meta }) => {
                                const password = field.value || '';
                                const getStrength = (pwd) => {
                                  let score = 0;
                                  if (pwd.length >= 6) score++;
                                  if (/[A-Z]/.test(pwd)) score++;
                                  if (/[0-9]/.test(pwd)) score++;
                                  if (/[^A-Za-z0-9]/.test(pwd)) score++;
                                  return score;
                                };
                                const strength = getStrength(password);
                                const strengthColors = ['var(--border)', 'var(--red)', 'var(--orange)', 'var(--yellow)', 'var(--green)'];
                                const barColor = (idx) => {
                                  if (strength === 0) return 'var(--border)';
                                  return idx <= strength ? strengthColors[strength] : 'var(--border)';
                                };
                                const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
                                return <>
                                  <PasswordField {...field} label="Password" placeholder="Min. 6 characters" icon="🔒" inputWrapperClassName="input-wrap" isInvalid={Boolean(meta.touched && meta.error)} feedback={meta.touched ? meta.error : null} />
                                  <div style={{ display: 'flex', gap: 4, marginTop: -8, marginBottom: 20, alignItems: 'center' }}>
                                    {[1, 2, 3, 4].map((i) => (
                                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 4, background: barColor(i), transition: 'background 0.3s' }} />
                                    ))}
                                    <span style={{ fontSize: '0.7rem', color: 'var(--muted)', marginLeft: 4, whiteSpace: 'nowrap', lineHeight: '14px', minWidth: 48 }}>{strengthLabels[strength] || 'Strength'}</span>
                                  </div>
                                </>;
                              }}
                            </Field>
                            <AppButton type="submit" className="auth-submit-btn" backgroundColor="var(--navy)" fullWidth loading={loading || isSubmitting} loadingText="Creating Account...">Create Account →</AppButton>
                            <p className="auth-terms">By creating an account you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.</p>
                          </Form>
                        </div>
                        <p className="auth-footer" style={{ marginTop: 24 }}>Need help? <a href="mailto:support@zurich.bank" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Contact support</a></p>
                      </>;
                    }}
                  </Formik>
                </div>
              </Offcanvas.Body>
            </Offcanvas>
          </Col>
        </Row>
      </Container>
    </>
  );
};

AuthPanel.propTypes = {
  onOpenRegister: PropTypes.func,
};

InputField.propTypes = {
  label: PropTypes.node,
  name: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  icon: PropTypes.node,
};

export default Register;
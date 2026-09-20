import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Form as BootstrapForm, Offcanvas } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import { useAuth } from '../context/AuthContext';
import AppButton from '../components/AppButton';
import PasswordField from '../components/PasswordField';
import PasswordRules from '../components/PasswordRules';
import ZurichBrand from '../components/ZurichBrand';
import { AUTH_STYLES } from './Auth.styles';
import { getAuthErrorMessage } from '../utils/authErrors';
import { USERNAME_MAX, USERNAME_MIN, validateEmail, validateName, validatePassword, validateUserName } from '../utils/authRules';

/* ─── Validation ──────────────────────────── */
const validate = (values) => {
  const checks = {
    firstName: validateName(values.firstName, 'First name'),
    lastName: validateName(values.lastName, 'Last name'),
    userName: validateUserName(values.userName),
    email: validateEmail(values.email),
    password: validatePassword(values.password),
  };

  return Object.fromEntries(Object.entries(checks).filter(([, message]) => message));
};

/* ─── InputField ──────────────────────────── */
const InputField = ({ label, name, type = 'text', placeholder, icon, autoComplete, hint }) => (
  <BootstrapForm.Group className="mb-3" controlId={`register-${name}`}>
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
              autoComplete={autoComplete}
              isInvalid={meta.touched && !!meta.error}
            />
          </div>
          {meta.touched && meta.error ? (
            <BootstrapForm.Control.Feedback type="invalid" style={{ display: 'block' }}>
              {meta.error}
            </BootstrapForm.Control.Feedback>
          ) : (
            hint && <BootstrapForm.Text className="text-muted">{hint}</BootstrapForm.Text>
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
      setError(getAuthErrorMessage(err, 'Registration failed. Please try again.'));
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
                                <InputField name="firstName" label="First Name" placeholder="Ada" icon="👤" autoComplete="given-name" />
                              </Col>
                              <Col md={6}>
                                <InputField name="lastName" label="Last Name" placeholder="Obi" autoComplete="family-name" />
                              </Col>
                            </Row>
                            <InputField
                              name="userName"
                              label="Username"
                              placeholder="adaobi"
                              icon="@"
                              autoComplete="username"
                              hint={`${USERNAME_MIN} to ${USERNAME_MAX} letters or numbers. No spaces or symbols.`}
                            />
                            <InputField name="email" type="email" label="Email Address" placeholder="ada@example.com" icon="✉" autoComplete="email" />
                            <Field name="password">
                              {({ field, meta }) => (
                                <>
                                  <PasswordField
                                    {...field}
                                    id="register-password"
                                    label="Password"
                                    placeholder="Choose a password"
                                    autoComplete="new-password"
                                    icon="🔒"
                                    inputWrapperClassName="input-wrap"
                                    isInvalid={Boolean(meta.touched && meta.error)}
                                    feedback={meta.touched ? meta.error : null}
                                  />
                                  <PasswordRules password={field.value || ''} />
                                </>
                              )}
                            </Field>
                            <AppButton type="submit" className="auth-submit-btn" backgroundColor="var(--navy)" fullWidth loading={loading || isSubmitting} loadingText="Creating Account...">Create Account →</AppButton>
                            <p className="auth-terms">By creating an account you agree to our <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link>.</p>
                          </Form>
                        </div>
                        <p className="auth-footer" style={{ marginTop: 24 }}>Need help? <a href="mailto:support@zurichbank.example" style={{ color: 'var(--green)', fontWeight: 600, textDecoration: 'none' }}>Contact support</a></p>
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
  autoComplete: PropTypes.string,
  hint: PropTypes.node,
};

export default Register;
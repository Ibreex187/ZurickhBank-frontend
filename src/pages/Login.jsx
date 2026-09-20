import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Container, Row, Col, Form as BootstrapForm, Card, Alert, Offcanvas } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import { useAuth } from '../context/AuthContext';
import AppButton from '../components/AppButton';
import PasswordField from '../components/PasswordField';
import ZurichBrand from '../components/ZurichBrand';

const CustomField = ({ label, name, type = 'text', placeholder, autoComplete }) => (
  <BootstrapForm.Group className="mb-3" controlId={`login-${name}`}>
    <BootstrapForm.Label>{label}</BootstrapForm.Label>
    <Field name={name}>
      {({ field, meta }) => (
        <>
          <BootstrapForm.Control
            {...field}
            type={type}
            placeholder={placeholder}
            autoComplete={autoComplete}
            isInvalid={meta.touched && meta.error}
          />
          {meta.touched && meta.error && (
            <BootstrapForm.Control.Feedback type="invalid">
              {meta.error}
            </BootstrapForm.Control.Feedback>
          )}
        </>
      )}
    </Field>
  </BootstrapForm.Group>
);

const AuthPanel = ({ onOpenForm, isLogin }) => (
  <div className="auth-left">
    <Link to="/" className="auth-brand">
      <ZurichBrand showText={true} />
    </Link>

    <div className="auth-panel-body">
      <h2>Welcome to Zurich Bank.</h2>
      <p>
        Manage transfers, savings, and a simulated investment portfolio from one workspace. This is a demo application.
      </p>
      <div className="auth-features">
        {[
          'Instant balance and history updates',
          'Savings and a stock simulator',
          'PIN-protected transfers',
          'Alerts on failed sign-in attempts',
        ].map((feature) => (
          <div className="auth-feature-item" key={feature}>
            <div className="auth-feature-check">✓</div>
            {feature}
          </div>
        ))}
      </div>
    </div>

    <div className="auth-testimonial">
      <p className="auth-testimonial-text">
        Demo application: nothing here involves real money.
      </p>
    </div>

    {/* Mobile Only: Re-open form button */}
    <div className="d-lg-none mt-5 text-center px-3">
      <AppButton onClick={onOpenForm} backgroundColor="var(--green)" size="lg" fullWidth>
        {isLogin ? 'Sign In to continue' : 'Create an Account'}
      </AppButton>
    </div>
  </div>
);

const Login = ({ styles }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false); // Mobile offcanvas state
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // One-off message: shown after registering or resetting a password, or when a session expired
  const [notice, setNotice] = useState(() => {
    if (location.state?.message) {
      return { variant: 'success', text: location.state.message };
    }

    try {
      const sessionNotice = window.sessionStorage.getItem('auth_notice');
      if (sessionNotice) {
        return { variant: 'warning', text: sessionNotice };
      }
    } catch {
      // sessionStorage can be unavailable (private mode); the notice is optional
    }

    return null;
  });

  // Auto-open offcanvas on mount for mobile
  useEffect(() => {
    setShowOffcanvas(true);

    try {
      window.sessionStorage.removeItem('auth_notice');
    } catch {
      // ignore
    }
  }, []);

  const initialValues = {
    username: location.state?.userName || '',
    password: ''
  };

  const validate = (values) => {
    const errors = {};

    if (!values.username) {
      errors.username = 'Username is required';
    }

    if (!values.password) {
      errors.password = 'Password is required';
    }

    return errors;
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setError('');
    setNotice(null);
    try {
      await login(values.username, values.password); // AuthContext will set cookie
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
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
          <Col lg={5} xl={4}>
            <AuthPanel onOpenForm={() => setShowOffcanvas(true)} isLogin={true} />
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
                    <div className="auth-form-eyebrow">Secure access</div>
                    <h1 className="auth-form-title">Welcome back</h1>
                    <p className="auth-subtitle">
                      Sign in to continue managing your wealth.
                    </p>
                  </div>

                  <Card className="auth-card">
                    <Card.Body>
                      {notice && (
                        <Alert variant={notice.variant} dismissible onClose={() => setNotice(null)}>
                          {notice.text}
                        </Alert>
                      )}
                      {error && <Alert className="auth-alert" role="alert">{error}</Alert>}

                      <Formik
                        initialValues={initialValues}
                        validate={validate}
                        onSubmit={handleSubmit}
                      >
                        {({ isSubmitting }) => (
                          <Form noValidate>
                            <CustomField
                              name="username"
                              type="text"
                              label="Username"
                              placeholder="Enter your username"
                              autoComplete="username"
                            />

                            <Field name="password">
                              {({ field, meta }) => (
                                <PasswordField
                                  {...field}
                                  id="login-password"
                                  label="Password"
                                  placeholder="Enter your password"
                                  autoComplete="current-password"
                                  isInvalid={Boolean(meta.touched && meta.error)}
                                  feedback={meta.touched ? meta.error : null}
                                />
                              )}
                            </Field>

                            <AppButton
                              type="submit"
                              className="auth-submit-btn"
                              backgroundColor="var(--navy)"
                              fullWidth
                              loading={loading || isSubmitting}
                              loadingText="Signing in..."
                            >
                              Sign In
                            </AppButton>
                          </Form>
                        )}
                      </Formik>

                      <div className="mt-3">
                        <Link to="/forgot-password">Forgot password?</Link>
                      </div>

                      <p className="auth-footer mt-3">
                        Don&apos;t have an account? <Link to="/register">Sign up</Link>
                      </p>
                    </Card.Body>
                  </Card>
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
  onOpenForm: PropTypes.func,
  isLogin: PropTypes.bool,
};

CustomField.propTypes = {
  label: PropTypes.node,
  name: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  autoComplete: PropTypes.string,
};

Login.propTypes = {
  styles: PropTypes.string,
};

export default Login;

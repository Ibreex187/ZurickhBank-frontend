import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Row, Col, Form as BootstrapForm, Card, Alert, Modal, Offcanvas } from 'react-bootstrap';
import { Formik, Form, Field } from 'formik';
import { useAuth } from '../context/AuthContext';
import AppButton from '../components/AppButton';
import ZurichBrand from '../components/ZurichBrand';
import { requestForgotPasswordOtp, verifyForgotPasswordOtp, resetForgotPassword } from '../services/authService';

const CustomField = ({ label, name, type = 'text', placeholder }) => (
  <BootstrapForm.Group className="mb-3">
    <BootstrapForm.Label>{label}</BootstrapForm.Label>
    <Field name={name}>
      {({ field, meta }) => (
        <>
          <BootstrapForm.Control
            {...field}
            type={type}
            placeholder={placeholder}
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
      <h2>Welcome to premium digital banking.</h2>
      <p>
        Manage transfers, investments, and savings from one secure workspace designed for modern wealth management.
      </p>
      <div className="auth-features">
        {[
          'Real-time account visibility',
          'Gold-tier wealth tools',
          'Enterprise-grade security',
          'Trusted by fast-growing businesses',
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
        &quot;Zurich Bank gives us confidence in every transaction. The platform gives premium and reliable service.&quot;
      </p>
      <div className="auth-testimonial-author">
        <div className="auth-avatar">Y.O</div>
        <div>
          <div className="auth-author-name">Y. O. Kolade</div>
          <div className="auth-author-role">Creative Finance Director</div>
        </div>
      </div>
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
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotData, setForgotData] = useState({
    email: '',
    otp: '',
    resetToken: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [forgotLoading, setForgotLoading] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpStepUnlocked, setOtpStepUnlocked] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false); // Mobile offcanvas state
  const { login } = useAuth();
  const navigate = useNavigate();

  // Auto-open offcanvas on mount for mobile
  useEffect(() => {
    setShowOffcanvas(true);
  }, []);

  const initialValues = {
    email: '',
    password: ''
  };

  const validate = (values) => {
    const errors = {};

    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)) {
      errors.email = 'Invalid email address';
    }

    if (!values.password) {
      errors.password = 'Password is required';
    }

    return errors;
  };
  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    setError('');
    try {
      await login(values.email, values.password); // AuthContext will set cookie
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleForgotInputChange = (field, value) => {
    setForgotData((prev) => ({ ...prev, [field]: value }));

    if (field === 'email') {
      setOtpRequested(false);
      setOtpStepUnlocked(false);
      setForgotData((prev) => ({
        ...prev,
        email: value,
        otp: '',
        resetToken: '',
        newPassword: '',
        confirmPassword: ''
      }));
      return;
    }

    if (field === 'otp' && !value.trim()) {
      setOtpStepUnlocked(false);
      setForgotData((prev) => ({ ...prev, otp: value, resetToken: '', newPassword: '', confirmPassword: '' }));
      return;
    }
  };

  const handleRequestForgotOtp = async () => {
    if (!forgotData.email) {
      setError('Enter your email to receive OTP');
      return;
    }

    setForgotLoading(true);
    setError('');
    try {
      const response = await requestForgotPasswordOtp(forgotData.email);
      setError(response.success ? '' : response.message || 'Failed to send OTP');
      if (response.success) {
        setOtpRequested(true);
        setOtpStepUnlocked(false);
        setForgotData((prev) => ({ ...prev, otp: '', resetToken: '', newPassword: '', confirmPassword: '' }));
        alert(response.message || 'OTP sent to your email');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to send OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const verifyOtpAndOpenReset = async () => {
    if (!otpRequested) {
      setError('Request OTP with your email first');
      return;
    }

    const normalizedOtp = forgotData.otp.trim();

    if (!normalizedOtp) {
      setError('Enter OTP to continue');
      return;
    }

    setForgotLoading(true);
    setError('');
    try {
      const response = await verifyForgotPasswordOtp({
        email: forgotData.email,
        otp: normalizedOtp,
      });

      if (!response.success || !response.data?.resetToken) {
        setError(response.message || 'Failed to verify OTP');
        return;
      }

      setForgotData((prev) => ({ ...prev, resetToken: response.data.resetToken }));
      setOtpStepUnlocked(true);
      setShowResetPasswordModal(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to verify OTP');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleUnlockPasswordStep = async () => {
    await verifyOtpAndOpenReset();
  };

  const handleCloseResetPasswordModal = () => {
    setShowResetPasswordModal(false);
    setOtpStepUnlocked(false);
    setForgotData((prev) => ({ ...prev, resetToken: '', newPassword: '', confirmPassword: '' }));
  };

  const handleResetForgotPassword = async () => {
    if (!forgotData.resetToken || !forgotData.newPassword || !forgotData.confirmPassword) {
      setError('Fill all forgot password fields');
      return;
    }

    if (forgotData.newPassword !== forgotData.confirmPassword) {
      setError('New password and confirm password do not match');
      return;
    }

    setForgotLoading(true);
    setError('');
    try {
      const response = await resetForgotPassword({
        resetToken: forgotData.resetToken,
        newPassword: forgotData.newPassword,
        confirmPassword: forgotData.confirmPassword
      });

      if (response.success) {
        alert(response.message || 'Password reset successful. Please login.');
        setShowResetPasswordModal(false);
        setShowForgotPassword(false);
        setForgotData({ email: '', otp: '', resetToken: '', newPassword: '', confirmPassword: '' });
        setOtpRequested(false);
        setOtpStepUnlocked(false);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  const showPasswordMismatch =
    forgotData.newPassword.trim() &&
    forgotData.confirmPassword.trim() &&
    forgotData.newPassword !== forgotData.confirmPassword;

  // const handleSubmit = async (values, { setSubmitting }) => {
  //   setLoading(true);
  //   setError('');

  //   try {
  //     await login(values.email, values.password);
  //     navigate('/dashboard');
  //   } catch (err) {
  //     setError(err.response?.data?.message || 'Login failed. Please try again.');
  //   } finally {
  //     setLoading(false);
  //     setSubmitting(false);
  //   }
  // };

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
                      {error && <Alert className="auth-alert">{error}</Alert>}

                      <Formik
                        initialValues={initialValues}
                        validate={validate}
                        onSubmit={handleSubmit}
                      >
                        {({ isSubmitting }) => (
                          <Form>
                            <CustomField
                              name="email"
                              type="email"
                              label="Email"
                              placeholder="Enter your email"
                            />

                            <CustomField
                              name="password"
                              type="password"
                              label="Password"
                              placeholder="Enter your password"
                            />

                            <AppButton
                              type="submit"
                              className="auth-submit-btn"
                              backgroundColor="var(--navy)"
                              fullWidth
                              disabled={loading || isSubmitting}
                            >
                              {loading ? 'Signing in...' : 'Sign In'}
                            </AppButton>
                          </Form>
                        )}
                      </Formik>

                      <div className="mt-3">
                        <button
                          type="button"
                          className="btn btn-link p-0"
                          onClick={() => {
                            setShowForgotPassword((prev) => !prev);
                            setError('');
                            if (showForgotPassword) {
                              setShowResetPasswordModal(false);
                              setForgotData({ email: '', otp: '', resetToken: '', newPassword: '', confirmPassword: '' });
                              setOtpRequested(false);
                              setOtpStepUnlocked(false);
                            }
                          }}
                        >
                          {showForgotPassword ? 'Back to login' : 'Forgot password?'}
                        </button>
                      </div>

                      {showForgotPassword && (
                        <div className="mt-3">
                          <BootstrapForm.Group className="mb-2">
                            <BootstrapForm.Label>Email</BootstrapForm.Label>
                            <BootstrapForm.Control
                              type="email"
                              value={forgotData.email}
                              onChange={(e) => handleForgotInputChange('email', e.target.value)}
                              placeholder="Enter your email"
                            />
                          </BootstrapForm.Group>

                          <div className="d-flex gap-2 mb-2">
                            <AppButton
                              type="button"
                              backgroundColor="var(--navy)"
                              disabled={forgotLoading}
                              onClick={handleRequestForgotOtp}
                            >
                              {forgotLoading ? 'Sending...' : 'Send OTP'}
                            </AppButton>
                          </div>

                          {otpRequested && (
                            <>
                              <BootstrapForm.Group className="mb-2">
                                <BootstrapForm.Label>OTP</BootstrapForm.Label>
                                <BootstrapForm.Control
                                  type="text"
                                  value={forgotData.otp}
                                  onChange={(e) => handleForgotInputChange('otp', e.target.value)}
                                  placeholder="Enter OTP"
                                />
                              </BootstrapForm.Group>

                              {!otpStepUnlocked && (
                                <div className="d-flex gap-2 mb-2">
                                  <AppButton
                                    type="button"
                                    backgroundColor="var(--gold)"
                                    disabled={forgotLoading}
                                    onClick={handleUnlockPasswordStep}
                                  >
                                    {forgotLoading ? 'Submitting OTP...' : 'Submit OTP'}
                                  </AppButton>
                                </div>
                              )}
                            </>
                          )}

                        </div>
                      )}

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

      <Modal
        show={showResetPasswordModal && otpStepUnlocked}
        onHide={handleCloseResetPasswordModal}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <BootstrapForm
          onSubmit={(e) => {
            e.preventDefault();
            handleResetForgotPassword();
          }}
        >
          <Modal.Body>
            <BootstrapForm.Group className="mb-2">
              <BootstrapForm.Label>New Password</BootstrapForm.Label>
              <BootstrapForm.Control
                type="password"
                value={forgotData.newPassword}
                onChange={(e) => handleForgotInputChange('newPassword', e.target.value)}
                placeholder="Enter new password"
              />
            </BootstrapForm.Group>

            <BootstrapForm.Group className="mb-3">
              <BootstrapForm.Label>Confirm New Password</BootstrapForm.Label>
              <BootstrapForm.Control
                type="password"
                value={forgotData.confirmPassword}
                onChange={(e) => handleForgotInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm new password"
                isInvalid={showPasswordMismatch}
              />
              {showPasswordMismatch && (
                <BootstrapForm.Control.Feedback type="invalid">
                  Passwords do not match
                </BootstrapForm.Control.Feedback>
              )}
            </BootstrapForm.Group>
          </Modal.Body>
          <Modal.Footer>
            <AppButton
              type="submit"
              backgroundColor="var(--gold)"
              disabled={forgotLoading}
            >
              {forgotLoading ? 'Submitting Reset...' : 'Submit Reset Password'}
            </AppButton>
          </Modal.Footer>
        </BootstrapForm>
      </Modal>
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
};

Login.propTypes = {
  styles: PropTypes.string,
};

export default Login;

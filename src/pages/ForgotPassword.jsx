import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Form } from 'react-bootstrap';
import AppButton from '../components/AppButton';
import OtpField from '../components/OtpField';
import PasswordField from '../components/PasswordField';
import PasswordRules from '../components/PasswordRules';
import ZurichBrand from '../components/ZurichBrand';
import { useCountdown } from '../hooks/useCountdown';
import { requestForgotPasswordOtp, resetForgotPassword, verifyForgotPasswordOtp } from '../services/authService';
import { getAuthErrorMessage, getRetryAfterSeconds } from '../utils/authErrors';
import { OTP_LENGTH, validateEmail, validatePassword } from '../utils/authRules';

// Matches the server's minimum gap between two codes (OTP_MIN_RESEND_SECONDS)
const RESEND_SECONDS = 60;

const STEPS = [
  { id: 'email', label: 'Email' },
  { id: 'code', label: 'Code' },
  { id: 'reset', label: 'New password' },
];

const ForgotPassword = ({ styles }) => {
  const navigate = useNavigate();
  const countdown = useCountdown();

  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);

  const stepIndex = STEPS.findIndex((item) => item.id === step);
  const passwordsMismatch = Boolean(confirmPassword) && newPassword !== confirmPassword;

  const startOver = () => {
    setStep('email');
    setOtp('');
    setResetToken('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setNotice(null);
  };

  // Sends a code, or sends a new one when called from the code step
  const sendCode = async ({ isResend = false } = {}) => {
    setError('');
    setNotice(null);

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    const result = await requestForgotPasswordOtp(email);
    setLoading(false);

    if (result.success) {
      setOtp('');
      setStep('code');
      countdown.start(RESEND_SECONDS);
      setNotice({
        variant: 'success',
        text: result.message || `If an account exists for that email, we sent a ${OTP_LENGTH}-digit code.`,
      });
      return;
    }

    const message = getAuthErrorMessage(result, 'We could not send a code. Please try again.');
    const waitSeconds = result.status === 429 ? getRetryAfterSeconds(result.message) : 0;

    // A code was sent moments ago: keep the person on the code step and show when they can ask again
    if (waitSeconds > 0) {
      countdown.start(waitSeconds);
      setStep('code');
      setNotice({ variant: 'info', text: `${message}. If you already have a code, enter it below.` });
      return;
    }

    if (isResend) {
      setNotice(null);
    }
    setError(message);
  };

  const handleEmailSubmit = (event) => {
    event.preventDefault();
    sendCode();
  };

  const goToCodeStep = () => {
    setError('');
    const emailError = validateEmail(email);
    if (emailError) {
      setError(`Enter your email first. ${emailError}`);
      return;
    }
    setNotice({ variant: 'info', text: 'Enter the most recent code we emailed you.' });
    setStep('code');
  };

  const handleCodeSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice(null);

    if (otp.length !== OTP_LENGTH) {
      setError(`Enter the ${OTP_LENGTH}-digit code from your email.`);
      return;
    }

    setLoading(true);
    const result = await verifyForgotPasswordOtp({ email, otp });
    setLoading(false);

    const token = result.data?.resetToken;
    if (result.success && token) {
      setResetToken(token);
      setStep('reset');
      return;
    }

    setError(getAuthErrorMessage(result, 'That code did not work. Please try again.'));
  };

  const handleResetSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (passwordsMismatch || !confirmPassword) {
      setError('The two passwords do not match.');
      return;
    }

    setLoading(true);
    const result = await resetForgotPassword({ resetToken, newPassword, confirmPassword });
    setLoading(false);

    if (result.success) {
      navigate('/login', {
        replace: true,
        state: { message: 'Password reset successful. Please sign in with your new password.' },
      });
      return;
    }

    setError(getAuthErrorMessage(result, 'We could not reset your password. Please try again.'));
  };

  return (
    <>
      {styles && <style>{styles}</style>}
      <div className="min-vh-100 d-flex flex-column">
        <header className="px-4 py-3" style={{ background: 'var(--navy, #0F0F11)' }}>
          <Link to="/" aria-label="Zurich Bank home" style={{ textDecoration: 'none' }}>
            <ZurichBrand showText />
          </Link>
        </header>

        <main className="flex-grow-1 d-flex align-items-center justify-content-center p-3">
          <Card className="shadow-sm w-100" style={{ maxWidth: 460 }}>
            <Card.Body className="p-4">
              <h1 className="h3 fw-bold mb-1">Reset your password</h1>
              <p className="text-muted mb-3">
                We&apos;ll email you a {OTP_LENGTH}-digit code to confirm it&apos;s you.
              </p>

              <ol className="list-unstyled d-flex gap-2 mb-4 small" aria-label="Progress">
                {STEPS.map((item, index) => (
                  <li
                    key={item.id}
                    aria-current={index === stepIndex ? 'step' : undefined}
                    className={`px-2 py-1 rounded-pill ${
                      index === stepIndex
                        ? 'bg-dark text-white'
                        : index < stepIndex
                          ? 'bg-success-subtle text-success-emphasis'
                          : 'bg-light text-muted'
                    }`}
                  >
                    {index + 1}. {item.label}
                  </li>
                ))}
              </ol>

              {notice && (
                <Alert variant={notice.variant} className="small py-2" role="status">
                  {notice.text}
                </Alert>
              )}
              {error && (
                <Alert variant="danger" className="small py-2" role="alert">
                  {error}
                </Alert>
              )}

              {step === 'email' && (
                <Form onSubmit={handleEmailSubmit} noValidate>
                  <Form.Group className="mb-3" controlId="forgot-email">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control
                      type="email"
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      placeholder="you@example.com"
                    />
                  </Form.Group>

                  <AppButton
                    type="submit"
                    backgroundColor="var(--navy)"
                    fullWidth
                    loading={loading}
                    loadingText="Sending code..."
                  >
                    Send code
                  </AppButton>

                  <div className="text-center mt-3 small">
                    <Button variant="link" size="sm" className="p-0" onClick={goToCodeStep}>
                      I already have a code
                    </Button>
                  </div>
                </Form>
              )}

              {step === 'code' && (
                <Form onSubmit={handleCodeSubmit} noValidate>
                  <p className="small text-muted mb-3">
                    Code sent to <strong>{email}</strong>.{' '}
                    <Button variant="link" size="sm" className="p-0 align-baseline" onClick={startOver}>
                      Use a different email
                    </Button>
                  </p>

                  <OtpField id="forgot-otp" value={otp} onChange={setOtp} autoFocus />

                  <AppButton
                    type="submit"
                    backgroundColor="var(--navy)"
                    fullWidth
                    loading={loading}
                    loadingText="Checking code..."
                    disabled={otp.length !== OTP_LENGTH}
                  >
                    Verify code
                  </AppButton>

                  <div className="text-center mt-3 small">
                    {countdown.secondsLeft > 0 ? (
                      <span className="text-muted" aria-live="polite">
                        You can request a new code in {countdown.secondsLeft}s
                      </span>
                    ) : (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0"
                        onClick={() => sendCode({ isResend: true })}
                        disabled={loading}
                      >
                        Send a new code
                      </Button>
                    )}
                  </div>
                </Form>
              )}

              {step === 'reset' && (
                <Form onSubmit={handleResetSubmit} noValidate>
                  <PasswordField
                    id="forgot-new-password"
                    label="New password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder="Choose a new password"
                  />
                  <PasswordRules password={newPassword} />

                  <PasswordField
                    id="forgot-confirm-password"
                    label="Confirm new password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Type it again"
                    isInvalid={passwordsMismatch}
                    feedback={passwordsMismatch ? 'Passwords do not match' : null}
                  />

                  <AppButton
                    type="submit"
                    backgroundColor="var(--navy)"
                    fullWidth
                    loading={loading}
                    loadingText="Saving..."
                  >
                    Reset password
                  </AppButton>

                  <div className="text-center mt-3 small">
                    <Button variant="link" size="sm" className="p-0" onClick={startOver}>
                      Start over
                    </Button>
                  </div>
                </Form>
              )}

              <hr className="my-4" />
              <p className="text-center small mb-0">
                Remembered it? <Link to="/login">Back to sign in</Link>
              </p>
            </Card.Body>
          </Card>
        </main>
      </div>
    </>
  );
};

ForgotPassword.propTypes = {
  styles: PropTypes.string,
};

export default ForgotPassword;

import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import { OTP_LENGTH } from '../utils/authRules';

/** A six-digit one-time-code input: numeric keypad on phones, digits only, and autofill-friendly. */
const OtpField = ({
  id = 'otp-code',
  label = 'Verification code',
  value,
  onChange,
  disabled = false,
  autoFocus = false,
  isInvalid = false,
  feedback = null,
  helpText = null,
}) => (
  <Form.Group className="mb-3" controlId={id}>
    <Form.Label>{label}</Form.Label>
    <Form.Control
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern={`\\d{${OTP_LENGTH}}`}
      maxLength={OTP_LENGTH}
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH))}
      placeholder={'0'.repeat(OTP_LENGTH)}
      className="text-center font-monospace"
      style={{ letterSpacing: '0.4em', fontSize: '1.25rem' }}
      disabled={disabled}
      autoFocus={autoFocus}
      isInvalid={isInvalid}
      aria-describedby={helpText ? `${id}-help` : undefined}
    />
    {feedback && <Form.Control.Feedback type="invalid">{feedback}</Form.Control.Feedback>}
    {helpText && (
      <Form.Text id={`${id}-help`} className="text-muted">
        {helpText}
      </Form.Text>
    )}
  </Form.Group>
);

OtpField.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  autoFocus: PropTypes.bool,
  isInvalid: PropTypes.bool,
  feedback: PropTypes.node,
  helpText: PropTypes.node,
};

export default OtpField;

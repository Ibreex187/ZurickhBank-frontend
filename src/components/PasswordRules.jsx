import PropTypes from 'prop-types';
import { CheckCircleFill, Circle } from 'react-bootstrap-icons';
import {
  PASSWORD_STRENGTH_LABELS,
  getPasswordRuleChecks,
  getPasswordStrength,
} from '../utils/authRules';

const STRENGTH_COLORS = ['#d4d4d8', '#dc2626', '#ea580c', '#ca8a04', '#16a34a'];

/**
 * Shows the password rules the server enforces (with a tick once met)
 * and, optionally, an advisory strength meter.
 */
const PasswordRules = ({ password, showStrength = true }) => {
  const checks = getPasswordRuleChecks(password);
  const strength = getPasswordStrength(password);
  const meterColor = STRENGTH_COLORS[strength];

  return (
    <div className="mb-3 small" aria-live="polite">
      {showStrength && (
        <div className="d-flex align-items-center gap-1 mb-2">
          {[1, 2, 3, 4].map((segment) => (
            <div
              key={segment}
              style={{
                flex: 1,
                height: 4,
                borderRadius: 4,
                background: segment <= strength ? meterColor : STRENGTH_COLORS[0],
                transition: 'background 0.2s',
              }}
            />
          ))}
          <span className="text-muted ms-2" style={{ minWidth: 48 }}>
            {PASSWORD_STRENGTH_LABELS[strength] || 'Strength'}
          </span>
        </div>
      )}

      <ul className="list-unstyled mb-0">
        {checks.map((rule) => (
          <li key={rule.id} className={rule.met ? 'text-success' : 'text-muted'}>
            {rule.met ? (
              <CheckCircleFill className="me-2" aria-hidden="true" />
            ) : (
              <Circle className="me-2" aria-hidden="true" />
            )}
            {rule.label}
            <span className="visually-hidden">{rule.met ? ' (met)' : ' (not met yet)'}</span>
          </li>
        ))}
      </ul>

      {showStrength && (
        <div className="text-muted mt-1">Tip: a capital letter, a number and a symbol make it stronger.</div>
      )}
    </div>
  );
};

PasswordRules.propTypes = {
  password: PropTypes.string,
  showStrength: PropTypes.bool,
};

export default PasswordRules;

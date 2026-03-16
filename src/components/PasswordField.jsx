import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
const EyeIcon = ({ visible }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
  >
    {visible ? (
      <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z" />
    ) : (
      <>
        <path d="M13.359 11.238l1.494 1.494a.5.5 0 0 1-.707.707l-1.57-1.57A8.7 8.7 0 0 1 8 13.5C3 13.5 0 8 0 8a16 16 0 0 1 2.249-2.993L.146 2.854a.5.5 0 1 1 .708-.708l14 14a.5.5 0 0 1-.708.708zM11.297 9.176l-1.56-1.56a2 2 0 0 1-2.56-2.56l-1.56-1.56C4.409 4.228 3.34 5.25 2.545 6.372A13 13 0 0 0 1.173 8c.411.697 1.069 1.652 1.959 2.543C4.42 11.832 6.179 13 8 13c1.518 0 2.85-.647 3.929-1.762l-.632-.632z" />
        <path d="M10.523 7.695l-2.218-2.218a2 2 0 0 1 2.218 2.218m4.474.305a13 13 0 0 1-.672 1.104l-1.03-1.03q.175-.284.31-.565c-.411-.696-1.07-1.651-1.96-2.542C10.58 4.168 8.82 3 7 3q-.607 0-1.175.138l-.858-.859A7.1 7.1 0 0 1 7 2.5c5 0 8 5.5 8 5.5" />
      </>
    )}
  </svg>
);

const PasswordField = ({
  label,
  groupClassName,
  labelClassName,
  inputClassName,
  inputWrapperClassName,
  isInvalid,
  feedback,
  feedbackClassName,
  resetWhen,
  icon,
  buttonStyle,
  ...controlProps
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!resetWhen) {
      setIsVisible(false);
    }
  }, [resetWhen]);

  return (
    <div className={`${groupClassName} position-relative`}>
      {label && <label className={labelClassName}>{label}</label>}
      <div className={inputWrapperClassName}>
        {icon && <span className="input-icon">{icon}</span>}
        <input
          {...controlProps}
          type={isVisible ? 'text' : 'password'}
          className={`${inputClassName}${isInvalid ? ' is-invalid' : ''}`}
          style={{ paddingRight: '44px', ...controlProps.style }}
        />
      </div>
      <button
        type="button"
        onClick={() => setIsVisible((prev) => !prev)}
        aria-label={isVisible ? `Hide ${label?.toLowerCase() || 'password'}` : `Show ${label?.toLowerCase() || 'password'}`}
        style={{
          position: 'absolute',
          right: '12px',
          top: label ? '38px' : '12px',
          border: 'none',
          background: 'transparent',
          padding: 0,
          color: 'var(--muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...buttonStyle
        }}
      >
        <EyeIcon visible={isVisible} />
      </button>
      {feedback && <div className={feedbackClassName}>{feedback}</div>}
    </div>
  );
};

EyeIcon.propTypes = {
  visible: PropTypes.bool,
};

PasswordField.propTypes = {
  label: PropTypes.node,
  groupClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  inputWrapperClassName: PropTypes.string,
  isInvalid: PropTypes.bool,
  feedback: PropTypes.node,
  feedbackClassName: PropTypes.string,
  resetWhen: PropTypes.any,
  icon: PropTypes.node,
  buttonStyle: PropTypes.object,
};

PasswordField.defaultProps = {
  label: 'Password',
  groupClassName: 'mb-3',
  labelClassName: 'form-label',
  inputClassName: 'form-control',
  inputWrapperClassName: '',
  isInvalid: false,
  feedback: null,
  feedbackClassName: 'invalid-feedback d-block',
  resetWhen: true,
  icon: null,
  buttonStyle: {},
};

export default PasswordField;
import PropTypes from 'prop-types';

const BUTTON_SIZES = {
  sm: {
    padding: '8px 14px',
    fontSize: '0.85rem',
  },
  md: {
    padding: '10px 16px',
    fontSize: '0.95rem',
  },
  lg: {
    padding: '12px 20px',
    fontSize: '1rem',
  },
};

const AppButton = ({
  children,
  type = 'button',
  onClick,
  disabled = false,
  className = '',
  style = {},
  backgroundColor = 'var(--navy)',
  textColor = 'var(--white)',
  borderColor = 'transparent',
  fullWidth = false,
  size = 'md',
  ...rest
}) => {
  const selectedSize = BUTTON_SIZES[size] || BUTTON_SIZES.md;

  const baseStyle = {
    backgroundColor,
    color: textColor,
    border: `1px solid ${borderColor}`,
    borderRadius: '10px',
    fontWeight: 600,
    lineHeight: 1.2,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.7 : 1,
    transition: 'all 0.2s ease',
    width: fullWidth ? '100%' : 'auto',
    ...selectedSize,
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{ ...baseStyle, ...style }}
      {...rest}
    >
      {children}
    </button>
  );
};

AppButton.propTypes = {
  children: PropTypes.node,
  type: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  backgroundColor: PropTypes.string,
  textColor: PropTypes.string,
  borderColor: PropTypes.string,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

export default AppButton;

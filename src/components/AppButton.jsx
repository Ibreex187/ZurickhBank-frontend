import PropTypes from 'prop-types';
import { Watch } from 'react-loader-spinner';
import './AppButton.css';

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
  loading = false,
  loadingText,
  ...rest
}) => {

  const buttonClasses = `app-btn app-btn-${size} ${fullWidth ? 'app-btn-full' : ''} ${className}`.trim();

  // We map the legacy inline styling props to CSS custom properties.
  // This maintains full backward compatibility across the app while allowing 
  // our buttery smooth CSS pseudo-classes to manipulate the button visually.
  const dynamicStyles = {
    '--btn-bg': backgroundColor,
    '--btn-text': textColor,
    '--btn-border': borderColor,
    ...style, // allow external standard styles to cascade
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
      style={dynamicStyles}
      {...rest}
    >
      {loading && (
        <Watch
          visible={true}
          height="18"
          width="18"
          radius="24"
          color={textColor}
          ariaLabel="button-loading"
          wrapperStyle={{ marginRight: children || loadingText ? '8px' : '0' }}
          wrapperClass=""
        />
      )}
      {loading ? (loadingText || children) : children}
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
  loading: PropTypes.bool,
  loadingText: PropTypes.string,
};

export default AppButton;

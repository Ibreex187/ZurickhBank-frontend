import PropTypes from 'prop-types';
import AppButton from './AppButton';

// actions: array of { key, label, onClick, variantProps }
const ActionButtons = ({ actions = [], children, className = '' }) => {
  if (children) return <div className={className}>{children}</div>;

  return (
    <div className={className}>
      {actions.map(a => (
        <AppButton
          key={a.key}
          size={a.size || 'sm'}
          className={a.className || 'me-2'}
          backgroundColor={a.backgroundColor || 'transparent'}
          textColor={a.textColor || '#151e31'}
          borderColor={a.borderColor || 'transparent'}
          onClick={a.onClick}
        >
          {a.icon && <span className="me-1">{a.icon}</span>}
          {a.label}
        </AppButton>
      ))}
    </div>
  );
};

ActionButtons.propTypes = {
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      label: PropTypes.node,
      onClick: PropTypes.func,
      size: PropTypes.string,
      className: PropTypes.string,
      backgroundColor: PropTypes.string,
      textColor: PropTypes.string,
      borderColor: PropTypes.string,
      icon: PropTypes.node,
    })
  ),
  children: PropTypes.node,
  className: PropTypes.string,
};

export default ActionButtons;

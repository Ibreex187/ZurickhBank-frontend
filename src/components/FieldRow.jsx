import PropTypes from 'prop-types';

// FieldRow displays a label and either a value or an input.
const FieldRow = ({ label, value, editable = false, children, className = '' }) => {
  return (
    <div className={`d-flex flex-column ${className}`}>
      <small className="text-muted">{label}</small>
      <div>
        {editable ? (
          children
        ) : (
          <div className="fw-semibold text-dark">{value}</div>
        )}
      </div>
    </div>
  );
};

FieldRow.propTypes = {
  label: PropTypes.node,
  value: PropTypes.node,
  editable: PropTypes.bool,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default FieldRow;

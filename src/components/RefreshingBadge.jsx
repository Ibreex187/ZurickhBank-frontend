import PropTypes from 'prop-types';
import { Spinner } from 'react-bootstrap';

/**
 * A small inline indicator for "this list is updating in the background."
 * Used instead of replacing already-loaded content with a full spinner.
 */
const RefreshingBadge = ({ label = 'Refreshing…' }) => (
  <div className="d-inline-flex align-items-center gap-2 text-muted small mb-2" role="status" aria-live="polite">
    <Spinner animation="border" size="sm" aria-hidden="true" />
    {label}
  </div>
);

RefreshingBadge.propTypes = {
  label: PropTypes.string,
};

export default RefreshingBadge;

import PropTypes from 'prop-types';
import { Card } from 'react-bootstrap';

// Simple wrapper around Bootstrap Card that accepts
// - title: string or node
// - actions: node (e.g. buttons)
// - children: card body
const ProfileCard = ({ title, actions, children, className = '' }) => {
  return (
    <Card className={className}>
      <Card.Body>
        <div className="d-flex align-items-start">
          <div>
            {title && <h5 className="mb-2">{title}</h5>}
          </div>
          {actions && <div className="ms-auto">{actions}</div>}
        </div>
        <div className="mt-3">{children}</div>
      </Card.Body>
    </Card>
  );
};

ProfileCard.propTypes = {
  title: PropTypes.node,
  actions: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default ProfileCard;

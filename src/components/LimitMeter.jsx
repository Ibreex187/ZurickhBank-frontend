import PropTypes from 'prop-types';
import { ProgressBar } from 'react-bootstrap';
import { formatMoney } from '../utils/formatters';

const getVariant = (limit, remaining) => {
  if (limit <= 0) return 'secondary';
  const ratio = remaining / limit;
  if (ratio <= 0.1) return 'danger';
  if (ratio <= 0.25) return 'warning';
  return 'success';
};

/** "Daily  ₦20,000.00 of ₦200,000.00 used" with a progress bar underneath. */
const LimitMeter = ({ label, bucket }) => {
  const limit = Number(bucket?.limit) || 0;
  const used = Number(bucket?.used) || 0;
  const remaining = Number.isFinite(Number(bucket?.remaining)) ? Number(bucket.remaining) : Math.max(0, limit - used);
  const percentUsed = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;

  return (
    <div className="mb-2">
      <div className="d-flex justify-content-between small">
        <span className="fw-semibold">{label}</span>
        <span className="text-muted">
          {formatMoney(used)} of {formatMoney(limit)} used
        </span>
      </div>
      <ProgressBar
        now={percentUsed}
        variant={getVariant(limit, remaining)}
        style={{ height: 8 }}
        aria-label={`${label} limit used`}
      />
      <div className="small text-muted mt-1">{formatMoney(remaining)} remaining</div>
    </div>
  );
};

LimitMeter.propTypes = {
  label: PropTypes.string.isRequired,
  bucket: PropTypes.shape({
    limit: PropTypes.number,
    used: PropTypes.number,
    remaining: PropTypes.number,
  }),
};

export default LimitMeter;

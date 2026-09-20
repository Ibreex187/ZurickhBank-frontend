import PropTypes from 'prop-types';
import { ListGroup } from 'react-bootstrap';
import { CheckCircleFill } from 'react-bootstrap-icons';
import CopyButton from './CopyButton';
import { formatDateTime, formatMoney } from '../utils/formatters';

const Row = ({ label, children }) => (
  <ListGroup.Item className="d-flex justify-content-between align-items-start gap-3 px-0">
    <span className="text-muted">{label}</span>
    <span className="text-end fw-medium" style={{ minWidth: 0, overflowWrap: 'anywhere' }}>{children}</span>
  </ListGroup.Item>
);

Row.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
};

/**
 * Details block shown after a successful transfer, deposit or withdrawal.
 * The page decides which buttons (Done, Save as beneficiary, ...) go under it.
 */
const TransactionReceipt = ({ receipt }) => {
  const { title, amount, date, transactionId, recipientName, recipientAccount, note, newBalance, fee, details } = receipt;

  return (
    <div className="text-center">
      <CheckCircleFill size={48} className="text-success mb-2" aria-hidden="true" />
      <h4 className="mb-1" role="status">{title}</h4>
      <p className="display-6 fw-bold mb-3">{formatMoney(amount)}</p>

      <ListGroup variant="flush" className="text-start mb-3">
        {recipientName && (
          <Row label="To">
            {recipientName}
            {recipientAccount && <div className="small text-muted font-monospace">{recipientAccount}</div>}
          </Row>
        )}
        {note && <Row label="Note">{note}</Row>}
        {details?.map((item) => (
          <Row key={item.label} label={item.label}>{item.value}</Row>
        ))}
        {typeof fee === 'number' && <Row label="Fee">{formatMoney(fee)}</Row>}
        <Row label="Date">{formatDateTime(date)}</Row>
        {typeof newBalance === 'number' && <Row label="New balance">{formatMoney(newBalance)}</Row>}
        {transactionId && (
          <Row label="Reference">
            <span className="font-monospace small">{transactionId}</span>
            <div>
              <CopyButton value={transactionId} label="Copy" ariaLabel="Copy transaction reference" />
            </div>
          </Row>
        )}
      </ListGroup>
    </div>
  );
};

TransactionReceipt.propTypes = {
  receipt: PropTypes.shape({
    title: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    date: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string, PropTypes.number]),
    transactionId: PropTypes.string,
    recipientName: PropTypes.string,
    recipientAccount: PropTypes.string,
    note: PropTypes.string,
    newBalance: PropTypes.number,
    fee: PropTypes.number,
    details: PropTypes.arrayOf(
      PropTypes.shape({ label: PropTypes.string.isRequired, value: PropTypes.node })
    ),
  }).isRequired,
};

export default TransactionReceipt;

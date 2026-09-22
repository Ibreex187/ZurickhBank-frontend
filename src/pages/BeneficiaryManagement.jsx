import { formatWithCommas, unformatCommas } from '../utils/formatAmount';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getBeneficiaries,
  createBeneficiary,
  removeBeneficiary,
  transferToBeneficiary,
} from '../services/beneficiaryService';
import { getTransactionLimits } from '../services/transactionService';
import {
  Container, Card, Form, Button, Alert, Table, Row, Col,
  Modal, Badge
} from 'react-bootstrap';
import LoadingWatch from '../components/LoadingWatch';
import RefreshingBadge from '../components/RefreshingBadge';
import { LightningChargeFill, PersonLinesFill, PlusLg } from 'react-bootstrap-icons';
import { formatMoney } from '../utils/formatters';
import LimitMeter from '../components/LimitMeter';
import TransactionReceipt from '../components/TransactionReceipt';
import { useToast } from '../context/ToastContext';

const BeneficiaryManagement = () => {
  const { user, refreshUser } = useAuth();
  const { notify } = useToast();
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(false); // Add Beneficiary modal submit
  const [beneficiariesLoading, setBeneficiariesLoading] = useState(false); // background list fetch
  const hasLoadedBeneficiariesRef = useRef(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addError, setAddError] = useState('');
  const [beneficiaryToDelete, setBeneficiaryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [newBeneficiary, setNewBeneficiary] = useState({
    accountNumber: ''
  });
  const [transferData, setTransferData] = useState({
    beneficiaryId: '',
    amount: '',
    description: '',
    transactionPin: '',
  });
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState('');
  const [transferReceipt, setTransferReceipt] = useState(null);
  const [transferLimits, setTransferLimits] = useState(null);
  const [limitsLoading, setLimitsLoading] = useState(false);


  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  useEffect(() => {
    if (!showTransferModal) {
      setTransferLimits(null);
      return;
    }

    let isActive = true;

    const fetchTransferLimits = async () => {
      setLimitsLoading(true);
      try {
        const response = await getTransactionLimits('transfer');
        if (!isActive) return;

        if (response?.success && response?.data) {
          setTransferLimits(response.data);
        } else {
          setTransferLimits(null);
        }
      } catch {
        if (isActive) {
          setTransferLimits(null);
        }
      } finally {
        if (isActive) {
          setLimitsLoading(false);
        }
      }
    };

    fetchTransferLimits();

    return () => {
      isActive = false;
    };
  }, [showTransferModal]);

  const validateAccountNumber = (accountNumber) => {
    const normalizedAccountNumber = accountNumber?.toString().replace(/\D/g, '');

    // Must be exactly 10 digits
    if (!/^\d{10}$/.test(normalizedAccountNumber)) {
      return 'Account number must be exactly 10 digits';
    }

    // Cannot add yourself
    if (normalizedAccountNumber === user?.accountNumber?.toString()) {
      return 'Cannot add yourself as beneficiary';
    }

    // Check if already added
    const exists = beneficiaries.some(
      b => b.accountNumber?.toString() === normalizedAccountNumber
    );
    if (exists) {
      return 'Beneficiary already added';
    }

    return null;
  };

  const fetchBeneficiaries = async () => {
    setBeneficiariesLoading(true);
    try {
      const data = await getBeneficiaries();
      if (data.success) {
        setBeneficiaries(data.data);
      }
    } catch (error) {
      notify({ variant: 'danger', text: error.response?.data?.message || 'Failed to fetch beneficiaries' });
    }
    setBeneficiariesLoading(false);
    hasLoadedBeneficiariesRef.current = true;
  };

  const addBeneficiary = async (e) => {
    e.preventDefault();
    setAddError('');
    const normalizedAccountNumber = newBeneficiary.accountNumber.toString().replace(/\D/g, '');

    // Validate account number
    const validationError = validateAccountNumber(normalizedAccountNumber);
    if (validationError) {
      setAddError(validationError);
      return;
    }

    setLoading(true);
    try {
      const data = await createBeneficiary(normalizedAccountNumber);
      if (data.success) {
        notify({ variant: 'success', text: data.message || 'Beneficiary added successfully!' });
        setNewBeneficiary({
          accountNumber: ''
        });
        setShowAddModal(false);
        fetchBeneficiaries();
      }
    } catch (error) {
      setAddError(error.response?.data?.message || 'Failed to add beneficiary');
    }
    setLoading(false);
  };

  const confirmDeleteBeneficiary = async () => {
    if (!beneficiaryToDelete) return;

    setDeleting(true);
    try {
      const data = await removeBeneficiary(beneficiaryToDelete._id);
      if (data.success) {
        notify({ variant: 'success', text: 'Beneficiary deleted successfully!' });
        fetchBeneficiaries();
      }
    } catch (error) {
      notify({ variant: 'danger', text: error.response?.data?.message || 'Failed to delete beneficiary' });
    } finally {
      setDeleting(false);
      setBeneficiaryToDelete(null);
    }
  };

  const initiateTransfer = (beneficiary) => {
    setSelectedBeneficiary(beneficiary);
    setTransferData({
      beneficiaryId: beneficiary._id,
      amount: '',
      description: '',
      transactionPin: '',
    });
    setTransferError('');
    setTransferReceipt(null);
    setShowTransferModal(true);
  };

  const closeTransferModal = () => {
    setShowTransferModal(false);
    setTransferError('');
    setTransferReceipt(null);
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    setTransferError('');

    if (!selectedBeneficiary?.accountNumber) {
      setTransferError('Recipient details are missing. Please close and reopen this window.');
      return;
    }

    if (!transferData.amount || Number(transferData.amount) <= 0) {
      setTransferError('Enter a valid transfer amount.');
      return;
    }

    if (String(transferData.transactionPin || '').trim().length !== 4) {
      setTransferError('Enter your 4-digit transaction PIN.');
      return;
    }

    setTransferLoading(true);
    try {
      const data = await transferToBeneficiary({
        receiverAccountNumber: selectedBeneficiary.accountNumber,
        amount: parseFloat(transferData.amount),
        description: transferData.description,
        transactionPin: transferData.transactionPin,
      });

      if (data.success) {
        const result = data.data || {};
        const newBalance = Number(result.newBalance);

        setTransferReceipt({
          title: 'Transfer successful',
          amount: Number(result.amount) || parseFloat(transferData.amount),
          date: new Date(),
          transactionId: result.transactionId,
          recipientName: result.recipient?.name || `${selectedBeneficiary.firstName} ${selectedBeneficiary.lastName}`,
          recipientAccount: result.recipient?.accountNumber || selectedBeneficiary.accountNumber,
          note: transferData.description.trim() || undefined,
          newBalance: Number.isFinite(newBalance) ? newBalance : undefined,
          fee: 0,
        });
        setTransferData({
          beneficiaryId: '',
          amount: '',
          description: '',
          transactionPin: '',
        });
        refreshUser();
      } else {
        setTransferError(data.message || 'Transfer failed');
      }
    } catch (error) {
      setTransferError(error.response?.data?.message || error.message || 'Transfer failed');
    } finally {
      setTransferLoading(false);
    }
  };

  const transferOperationLimits = transferLimits?.operations?.transfer;

  return (
    <>
      <Container fluid className="px-lg-4 py-4">
        {/* Header Section */}
        <Row className="mb-4">
          <Col>
            <div className="d-flex justify-content-between align-items-center">
              <h2 className="mb-0">Beneficiary Management</h2>
              <Button
                variant="primary"
                onClick={() => { setAddError(''); setShowAddModal(true); }}
                className="px-4"
              >
                <PlusLg size="1em" className="me-2" />
                Add Beneficiary
              </Button>
            </div>
          </Col>
        </Row>

        {/* Stats Cards */}
        <Row className="g-4 mb-4">
          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="mb-0 text-muted">Total Beneficiaries</h6>
                    <h3 className="mb-0">{beneficiaries.length}</h3>
                  </div>
                  <div className="align-self-center">
                    <PersonLinesFill size={32} className="opacity-75" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="mb-0 text-muted">Quick Access</h6>
                    <h3 className="mb-0">{beneficiaries.length}</h3>
                  </div>
                  <div className="align-self-center">
                    <LightningChargeFill size={32} className="opacity-75" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Beneficiaries Table */}
        <Card className="shadow-sm">
          <Card.Header className="bg-white border-bottom">
            <h5 className="mb-0">Your Beneficiaries</h5>
          </Card.Header>
          <Card.Body className="p-0">
            {beneficiariesLoading && !hasLoadedBeneficiariesRef.current ? (
              <LoadingWatch label="Loading beneficiaries..." minHeight="160px" />
            ) : beneficiaries.length === 0 ? (
              <div className="text-center py-5">
                <PersonLinesFill size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No beneficiaries added yet</h5>
                <p className="text-muted">Add your first beneficiary to start making quick transfers</p>
                <Button variant="dark" onClick={() => { setAddError(''); setShowAddModal(true); }}>
                  Add your first beneficiary
                </Button>
              </div>
            ) : (
              <div className="table-responsive">
                {beneficiariesLoading && <div className="px-3 pt-3"><RefreshingBadge /></div>}
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Username</th>
                      <th>Account Number</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {beneficiaries.map((beneficiary) => (
                      <tr key={beneficiary._id}>
                        <td>
                          <strong>{beneficiary.firstName} {beneficiary.lastName}</strong>
                        </td>
                        <td>{beneficiary.userName}</td>
                        <td className="font-monospace">{beneficiary.accountNumber}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => initiateTransfer(beneficiary)}
                          >
                            Transfer
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => setBeneficiaryToDelete(beneficiary)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Add Beneficiary Modal */}
        <Modal show={showAddModal} onHide={() => { setShowAddModal(false); setAddError(''); }} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Add New Beneficiary</Modal.Title>
          </Modal.Header>
          <Form onSubmit={addBeneficiary}>
            <Modal.Body>
              {addError && (
                <Alert variant="danger" className="py-2 small" role="alert">
                  {addError}
                </Alert>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Account Number *</Form.Label>
                <Form.Control
                  type="text"
                  value={newBeneficiary.accountNumber}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
                    setNewBeneficiary({ ...newBeneficiary, accountNumber: digitsOnly });
                  }}
                  placeholder="Enter 10-digit account number"
                  required
                  maxLength="10"
                  pattern="[0-9]{10}"
                  title="Account number must be exactly 10 digits"
                />
                <Form.Text className="text-muted">
                  Enter the recipient&apos;s 10-digit account number. System will automatically fetch account details.
                </Form.Text>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => { setShowAddModal(false); setAddError(''); }}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={loading || newBeneficiary.accountNumber.length !== 10}
              >
                {loading ? 'Adding...' : 'Add Beneficiary'}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal show={Boolean(beneficiaryToDelete)} onHide={() => !deleting && setBeneficiaryToDelete(null)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Remove beneficiary?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className="mb-1">
              <strong>{beneficiaryToDelete?.firstName} {beneficiaryToDelete?.lastName}</strong>
              {' '}(<span className="font-monospace">{beneficiaryToDelete?.accountNumber}</span>) will be removed from your list.
            </p>
            <p className="text-muted small mb-0">You can add them again later using their account number.</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setBeneficiaryToDelete(null)} disabled={deleting}>
              Keep
            </Button>
            <Button variant="danger" onClick={confirmDeleteBeneficiary} disabled={deleting}>
              {deleting ? 'Removing...' : 'Remove'}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Transfer Modal */}
        <Modal show={showTransferModal} onHide={closeTransferModal}>
          <Modal.Header closeButton>
            <Modal.Title>
              {transferReceipt
                ? 'Receipt'
                : `Transfer to ${selectedBeneficiary ? `${selectedBeneficiary.firstName} ${selectedBeneficiary.lastName}` : ''}`}
            </Modal.Title>
          </Modal.Header>
          {transferReceipt ? (
            <>
              <Modal.Body>
                <TransactionReceipt receipt={transferReceipt} />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="dark" onClick={closeTransferModal}>
                  Done
                </Button>
              </Modal.Footer>
            </>
          ) : (
          <Form onSubmit={handleTransfer}>
            <Modal.Body>
              {transferError && (
                <Alert variant="danger" className="py-2 small" role="alert">
                  {transferError}
                </Alert>
              )}

              {selectedBeneficiary && (
                <Card className="mb-3 bg-light">
                  <Card.Body className="py-2">
                    <small className="text-muted">Recipient Details:</small>
                    <p className="mb-1"><strong>{selectedBeneficiary.firstName} {selectedBeneficiary.lastName}</strong></p>
                    <p className="mb-0 text-muted">@{selectedBeneficiary.userName} • {selectedBeneficiary.accountNumber}</p>
                  </Card.Body>
                </Card>
              )}

              {limitsLoading ? (
                <p className="text-muted small mb-3">Loading transfer limits...</p>
              ) : transferOperationLimits ? (
                <div className="p-3 mb-3 bg-light border rounded">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold small">Transfer Limits</span>
                    <Badge bg="light" text="dark" className="border">Tier: {transferLimits?.tier || 'unverified'}</Badge>
                  </div>
                  <LimitMeter label="Daily" bucket={transferOperationLimits?.daily} />
                  <LimitMeter label="Monthly" bucket={transferOperationLimits?.monthly} />
                </div>
              ) : null}

              <Form.Group className="mb-3">
                <Form.Label>Amount *</Form.Label>
                <Form.Control
                  type="text"
                  inputMode="decimal"
                  value={formatWithCommas(transferData.amount)}
                  onChange={e => {
                    const raw = unformatCommas(e.target.value.replace(/[^\d.]/g, ''));
                    if (/^\d*(\.\d{0,2})?$/.test(raw)) {
                      setTransferData({ ...transferData, amount: raw });
                    }
                  }}
                  placeholder="Enter amount"
                  required
                  min="1"
                  step="0.01"
                />
                <Form.Text className="text-muted">
                  Available Balance: {formatMoney(user?.balance)}
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={transferData.description}
                  onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                  placeholder="Payment description..."
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Transaction PIN *</Form.Label>
                <Form.Control
                  type="password"
                  value={transferData.transactionPin}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setTransferData({ ...transferData, transactionPin: digitsOnly });
                  }}
                  placeholder="Enter 4-digit PIN"
                  required
                  maxLength="4"
                  pattern="[0-9]{4}"
                  title="Transaction PIN must be exactly 4 digits"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeTransferModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={transferLoading || !transferData.amount || transferData.transactionPin.length !== 4}
              >
                {transferLoading ? 'Processing...' : 'Transfer'}
              </Button>
            </Modal.Footer>
          </Form>
          )}
        </Modal>
      </Container>
    </>
  );
};

export default BeneficiaryManagement;
import { useEffect, useMemo, useRef, useState } from 'react';
import { Card, Col, Container, Form, Pagination, Row, Table } from 'react-bootstrap';
import LoadingWatch from '../components/LoadingWatch';
import RefreshingBadge from '../components/RefreshingBadge';
import { getAccountStatement, getLedgerHistory } from '../services/ledgerService';
import { formatDateTime, formatMoney } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

const formatCurrency = (value) => formatMoney(value);

const Ledger = () => {
  const { notify } = useToast();

  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const hasLoadedHistoryRef = useRef(false);
  const [loadingStatement, setLoadingStatement] = useState(false);
  const hasLoadedStatementRef = useRef(false);

  const [filters, setFilters] = useState({
    accountType: '',
    referenceType: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 20,
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const queryOptions = useMemo(() => ({
    accountType: filters.accountType || undefined,
    referenceType: filters.referenceType || undefined,
    startDate: filters.startDate || undefined,
    endDate: filters.endDate || undefined,
    page: filters.page,
    limit: filters.limit,
  }), [filters]);

  useEffect(() => {
    const fetchLedgerHistory = async () => {
      setLoadingHistory(true);

      try {
        const response = await getLedgerHistory(queryOptions);
        if (response?.success) {
          setEntries(response?.data?.entries || []);
          setPagination(response?.data?.pagination || {
            page: 1,
            limit: filters.limit,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          });
        } else {
          setEntries([]);
        }
      } catch (fetchError) {
        notify({ variant: 'danger', text: fetchError?.response?.data?.message || 'Failed to fetch ledger history' });
        setEntries([]);
      } finally {
        setLoadingHistory(false);
        hasLoadedHistoryRef.current = true;
      }
    };

    fetchLedgerHistory();
    // notify is stable (from context) and intentionally excluded so this only re-runs on filter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryOptions, filters.limit]);

  useEffect(() => {
    const fetchStatement = async () => {
      setLoadingStatement(true);

      try {
        const response = await getAccountStatement({
          accountType: filters.accountType || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        });

        if (response?.success) {
          setAccounts(response?.data?.accounts || []);
        } else {
          setAccounts([]);
        }
      } catch (statementError) {
        setAccounts([]);
        notify({ variant: 'danger', text: statementError?.response?.data?.message || 'Failed to fetch account statement' });
      } finally {
        setLoadingStatement(false);
        hasLoadedStatementRef.current = true;
      }
    };

    fetchStatement();
    // notify is stable (from context) and intentionally excluded so this only re-runs on filter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.accountType, filters.startDate, filters.endDate]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? value : 1,
    }));
  };

  const goToPage = (nextPage) => {
    setFilters((prev) => ({ ...prev, page: Math.max(1, nextPage) }));
  };

  return (
    <Container fluid className="px-lg-4 py-4">
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col sm={6} md={3}>
              <Form.Group controlId="ledger-account-type">
                <Form.Label>Account Type</Form.Label>
                <Form.Select
                  value={filters.accountType}
                  onChange={(event) => handleFilterChange('accountType', event.target.value)}
                >
                  <option value="">All Accounts</option>
                  <option value="user_main">Main Account</option>
                  <option value="user_savings">Savings Account</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col sm={6} md={3}>
              <Form.Group controlId="ledger-reference-type">
                <Form.Label>Reference Type</Form.Label>
                <Form.Select
                  value={filters.referenceType}
                  onChange={(event) => handleFilterChange('referenceType', event.target.value)}
                >
                  <option value="">All References</option>
                  <option value="transaction">Transaction</option>
                  <option value="savings_transaction">Savings Transaction</option>
                  <option value="investment_trade">Investment Trade</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col sm={8} md={4}>
              <Form.Label>Date Range</Form.Label>
              {/* flex-wrap: native date inputs have their own minimum rendered width that doesn't
                  shrink, so two of them plus the "to" label don't fit on one line on narrow phones */}
              <div className="d-flex flex-wrap align-items-center gap-2">
                <Form.Control
                  type="date"
                  aria-label="Start date"
                  value={filters.startDate}
                  onChange={(event) => handleFilterChange('startDate', event.target.value)}
                  style={{ flex: '1 1 140px' }}
                />
                <span className="text-muted flex-shrink-0">to</span>
                <Form.Control
                  type="date"
                  aria-label="End date"
                  value={filters.endDate}
                  onChange={(event) => handleFilterChange('endDate', event.target.value)}
                  style={{ flex: '1 1 140px' }}
                />
              </div>
            </Col>

            <Col sm={4} md={2}>
              <Form.Group controlId="ledger-rows">
                <Form.Label>Rows</Form.Label>
                <Form.Select
                  value={filters.limit}
                  onChange={(event) => handleFilterChange('limit', Number(event.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0">Account Statement</h5>
        </Card.Header>
        <Card.Body>
          {loadingStatement && !hasLoadedStatementRef.current ? (
            <LoadingWatch label="Loading statement..." minHeight="100px" />
          ) : (
            <>
              {loadingStatement && <RefreshingBadge />}
              {accounts.length === 0 ? (
                <p className="text-muted mb-0">No account activity for this range.</p>
              ) : (
                <Row className="g-3">
                  {accounts.map((account) => (
                    <Col md={6} lg={4} key={account.accountType}>
                      <Card className="h-100 bg-light border-0">
                        <Card.Body>
                          <h6 className="mb-3">{account.accountType}</h6>
                          <p className="d-flex justify-content-between mb-1">
                            <span className="text-muted">Opening</span>
                            <span>{formatCurrency(account.openingBalance)}</span>
                          </p>
                          <p className="d-flex justify-content-between mb-1">
                            <span className="text-muted">Debits</span>
                            <span>{formatCurrency(account.totalDebits)}</span>
                          </p>
                          <p className="d-flex justify-content-between mb-1">
                            <span className="text-muted">Credits</span>
                            <span>{formatCurrency(account.totalCredits)}</span>
                          </p>
                          <p className="d-flex justify-content-between mb-1">
                            <span className="text-muted">Net</span>
                            <span>{formatCurrency(account.netMovement)}</span>
                          </p>
                          <p className="d-flex justify-content-between mb-0 fw-semibold">
                            <span>Closing</span>
                            <span>{formatCurrency(account.closingBalance)}</span>
                          </p>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0">Ledger History</h5>
        </Card.Header>

        <Card.Body className="p-0">
          {loadingHistory && !hasLoadedHistoryRef.current ? (
            <LoadingWatch label="Loading ledger history..." minHeight="90px" />
          ) : (
            <>
              {loadingHistory && <div className="px-3 pt-3"><RefreshingBadge /></div>}
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Description</th>
                      <th>Reference</th>
                      <th>Account</th>
                      <th>Debit</th>
                      <th>Credit</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-4">No ledger entries found.</td>
                      </tr>
                    ) : (
                      entries.map((entry) => (
                        <tr key={entry._id}>
                          <td>{entry.description || '-'}</td>
                          <td>{entry.referenceType}</td>
                          <td>{entry.accountType}</td>
                          <td>{formatCurrency(entry.debit)}</td>
                          <td>{formatCurrency(entry.credit)}</td>
                          <td>{formatDateTime(entry.createdAt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Card.Body>

        {pagination.totalPages > 0 && (
          <Card.Footer className="bg-white d-flex justify-content-start">
            <Pagination className="mb-0">
              <Pagination.Prev
                onClick={() => goToPage((pagination.page || 1) - 1)}
                disabled={!pagination.hasPrevPage || loadingHistory}
              />
              <Pagination.Item active disabled>
                {pagination.page || 1} of {pagination.totalPages || 1}
              </Pagination.Item>
              <Pagination.Next
                onClick={() => goToPage((pagination.page || 1) + 1)}
                disabled={!pagination.hasNextPage || loadingHistory}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>
    </Container>
  );
};

export default Ledger;

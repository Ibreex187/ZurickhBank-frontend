import { useCallback, useEffect, useRef, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Pagination, Row, Spinner, Table } from 'react-bootstrap';
import LoadingWatch from '../components/LoadingWatch';
import RefreshingBadge from '../components/RefreshingBadge';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../services/notificationService';
import { publishUnreadNotifications } from '../utils/notificationEvents';
import { formatDateTime } from '../utils/formatters';
import { useToast } from '../context/ToastContext';

const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: '' },
  { label: 'Debit', value: 'debit' },
  { label: 'Credit', value: 'credit' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'Security', value: 'security' },
];

const LIMIT_OPTIONS = [10, 20, 50, 100];

const CATEGORY_BADGE_VARIANT = {
  debit: 'danger',
  credit: 'success',
  transfer: 'info',
  security: 'dark',
};

const Notifications = () => {
  const { notify } = useToast();

  const [loading, setLoading] = useState(false);
  const hasLoadedRef = useRef(false);
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({
    unreadOnly: false,
    category: '',
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalNotifications: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [unreadCount, setUnreadCount] = useState(0);

  const [markingNotificationId, setMarkingNotificationId] = useState('');
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotificationList = useCallback(async () => {
    setLoading(true);

    try {
      const response = await getNotifications({
        page: filters.page,
        limit: filters.limit,
        unreadOnly: filters.unreadOnly,
        category: filters.category,
      });

      if (response?.success) {
        const data = response?.data || {};
        const nextUnreadCount = Number(data?.unreadCount) || 0;
        setNotifications(data?.notifications || []);
        setUnreadCount(nextUnreadCount);
        publishUnreadNotifications(nextUnreadCount);
        setPagination(data?.pagination || {
          currentPage: 1,
          totalPages: 0,
          totalNotifications: 0,
          hasNextPage: false,
          hasPrevPage: false,
        });
      } else {
        setNotifications([]);
        setUnreadCount(0);
        publishUnreadNotifications(0);
      }
    } catch (fetchError) {
      notify({ variant: 'danger', text: fetchError?.response?.data?.message || 'Failed to fetch notifications' });
      setNotifications([]);
    } finally {
      setLoading(false);
      hasLoadedRef.current = true;
    }
    // notify is stable (from context) and intentionally excluded so this only re-runs on filter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    fetchNotificationList();
  }, [fetchNotificationList]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
      page: field === 'page' ? value : 1,
    }));
  };

  const handleMarkAsRead = async (notificationId) => {
    setMarkingNotificationId(notificationId);

    try {
      const response = await markNotificationAsRead(notificationId);
      if (response?.success) {
        await fetchNotificationList();
      }
    } catch (markError) {
      notify({ variant: 'danger', text: markError?.response?.data?.message || 'Failed to mark notification as read' });
    } finally {
      setMarkingNotificationId('');
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAll(true);

    try {
      const response = await markAllNotificationsAsRead();
      if (response?.success) {
        await fetchNotificationList();
      }
    } catch (markAllError) {
      notify({ variant: 'danger', text: markAllError?.response?.data?.message || 'Failed to mark all notifications as read' });
    } finally {
      setMarkingAll(false);
    }
  };

  const hasUnreadNotifications = unreadCount > 0;

  return (
    <Container fluid className="px-lg-4 py-4">
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col sm={6} md={3}>
              <Form.Group controlId="notif-category">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  value={filters.category}
                  onChange={(event) => handleFilterChange('category', event.target.value)}
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <option key={option.value || 'all'} value={option.value}>{option.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col sm={6} md={3}>
              <Form.Group controlId="notif-show">
                <Form.Label>Show</Form.Label>
                <Form.Select
                  value={filters.unreadOnly ? 'unread' : 'all'}
                  onChange={(event) => handleFilterChange('unreadOnly', event.target.value === 'unread')}
                >
                  <option value="all">All Notifications</option>
                  <option value="unread">Unread Only</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col sm={6} md={2}>
              <Form.Group controlId="notif-rows">
                <Form.Label>Rows</Form.Label>
                <Form.Select
                  value={filters.limit}
                  onChange={(event) => handleFilterChange('limit', Number(event.target.value))}
                >
                  {LIMIT_OPTIONS.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col sm={6} md={4} className="d-flex gap-2 justify-content-md-end">
              <Button
                type="button"
                variant="outline-secondary"
                onClick={() => setFilters({ unreadOnly: false, category: '', page: 1, limit: 20 })}
              >
                Reset
              </Button>
              <Button
                type="button"
                variant="dark"
                onClick={handleMarkAllAsRead}
                disabled={markingAll || !hasUnreadNotifications}
              >
                {markingAll ? (
                  <>
                    <Spinner as="span" animation="border" size="sm" className="me-2" aria-hidden="true" />
                    Marking...
                  </>
                ) : (
                  'Mark all as read'
                )}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Inbox</h5>
          <span className={hasUnreadNotifications ? 'text-primary fw-semibold small' : 'text-muted small'}>
            {hasUnreadNotifications ? `${unreadCount} unread` : 'All caught up'}
          </span>
        </Card.Header>

        <Card.Body className={notifications.length === 0 && hasLoadedRef.current ? '' : 'p-0'}>
          {loading && !hasLoadedRef.current ? (
            <LoadingWatch label="Loading notifications..." minHeight="120px" />
          ) : (
            <>
              {loading && <div className="px-3 pt-3"><RefreshingBadge /></div>}

              {notifications.length === 0 ? (
                <div className="text-center py-4">
                  <p className="mb-1 fw-semibold">
                    {filters.unreadOnly || filters.category ? 'No notifications match these filters.' : "You're all caught up."}
                  </p>
                  <p className="text-muted small mb-0">
                    {filters.unreadOnly || filters.category
                      ? 'Try resetting the filters to see everything.'
                      : 'Alerts about your money and account security will show up here.'}
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Title</th>
                        <th>Category</th>
                        <th>Message</th>
                        <th>Status</th>
                        <th>Created</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.map((notification) => (
                        <tr key={notification._id}>
                          <td>{notification.title}</td>
                          <td>
                            <Badge bg={CATEGORY_BADGE_VARIANT[notification.category] || 'secondary'}>
                              {String(notification.category || '').toUpperCase()}
                            </Badge>
                          </td>
                          <td>{notification.message}</td>
                          <td>{notification.isRead ? 'Read' : 'Unread'}</td>
                          <td>{formatDateTime(notification.createdAt)}</td>
                          <td>
                            {!notification.isRead ? (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline-primary"
                                onClick={() => handleMarkAsRead(notification._id)}
                                disabled={markingNotificationId === notification._id}
                              >
                                {markingNotificationId === notification._id ? 'Marking...' : 'Mark as read'}
                              </Button>
                            ) : (
                              <Badge bg="secondary-subtle" text="secondary-emphasis">Done</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </>
          )}
        </Card.Body>

        {pagination.totalPages > 0 && (
          <Card.Footer className="bg-white d-flex justify-content-start">
            <Pagination className="mb-0">
              <Pagination.Prev
                onClick={() => handleFilterChange('page', Math.max(1, filters.page - 1))}
                disabled={!pagination.hasPrevPage || loading}
              />
              <Pagination.Item active disabled>
                {pagination.currentPage || filters.page} of {pagination.totalPages || 1}
              </Pagination.Item>
              <Pagination.Next
                onClick={() => handleFilterChange('page', filters.page + 1)}
                disabled={!pagination.hasNextPage || loading}
              />
            </Pagination>
          </Card.Footer>
        )}
      </Card>
    </Container>
  );
};

export default Notifications;

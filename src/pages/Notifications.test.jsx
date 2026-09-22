import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Notifications from './Notifications';
import { ToastProvider } from '../context/ToastContext';

const getNotifications = vi.fn();
const markNotificationAsRead = vi.fn();
const markAllNotificationsAsRead = vi.fn();

vi.mock('../services/notificationService', () => ({
  getNotifications: (...args) => getNotifications(...args),
  markNotificationAsRead: (...args) => markNotificationAsRead(...args),
  markAllNotificationsAsRead: (...args) => markAllNotificationsAsRead(...args),
}));

const page = (overrides = {}) => ({
  currentPage: 1,
  totalPages: 2,
  totalNotifications: 3,
  hasNextPage: true,
  hasPrevPage: false,
  ...overrides,
});

const notification = (overrides = {}) => ({
  _id: 'n1',
  title: 'Transfer sent',
  category: 'transfer',
  message: 'You sent ₦500.00 to Ada Obi',
  isRead: false,
  createdAt: '2026-09-20T10:00:00.000Z',
  ...overrides,
});

const renderPage = () => render(<ToastProvider><Notifications /></ToastProvider>);

describe('Notifications', () => {
  beforeEach(() => {
    getNotifications.mockReset();
    markNotificationAsRead.mockReset();
    markAllNotificationsAsRead.mockReset();
    getNotifications.mockResolvedValue({
      success: true,
      data: { notifications: [notification()], unreadCount: 1, pagination: page() },
    });
    markNotificationAsRead.mockResolvedValue({ success: true });
    markAllNotificationsAsRead.mockResolvedValue({ success: true });
  });

  it('lists notifications with a category badge and the unread count', async () => {
    renderPage();

    expect(await screen.findByText('Transfer sent')).toBeInTheDocument();
    expect(screen.getByText('TRANSFER')).toBeInTheDocument();
    expect(screen.getByText('1 unread')).toBeInTheDocument();
  });

  it('shows an empty state when there is nothing to show', async () => {
    getNotifications.mockResolvedValue({
      success: true,
      data: { notifications: [], unreadCount: 0, pagination: page({ totalPages: 0, hasNextPage: false }) },
    });

    renderPage();

    expect(await screen.findByText("You're all caught up.")).toBeInTheDocument();
    expect(screen.getByText('All caught up')).toBeInTheDocument();
  });

  it('refetches with the chosen category and resets to page 1', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Transfer sent');

    await user.selectOptions(screen.getByLabelText('Category'), 'security');

    await waitFor(() => expect(getNotifications).toHaveBeenLastCalledWith(
      expect.objectContaining({ category: 'security', page: 1 })
    ));
  });

  it('marks a single notification as read and refreshes the list', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Transfer sent');

    await user.click(screen.getByRole('button', { name: 'Mark as read' }));

    await waitFor(() => expect(markNotificationAsRead).toHaveBeenCalledWith('n1'));
    expect(getNotifications).toHaveBeenCalledTimes(2); // initial load + refetch after marking read
  });

  it('marks everything as read from the toolbar, disabled once nothing is unread', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Transfer sent');

    const markAllButton = screen.getByRole('button', { name: 'Mark all as read' });
    expect(markAllButton).toBeEnabled();

    await user.click(markAllButton);
    await waitFor(() => expect(markAllNotificationsAsRead).toHaveBeenCalledTimes(1));
  });

  it('disables "Mark all as read" when there is nothing unread', async () => {
    getNotifications.mockResolvedValue({
      success: true,
      data: { notifications: [notification({ isRead: true })], unreadCount: 0, pagination: page({ totalPages: 1, hasNextPage: false }) },
    });

    renderPage();
    await screen.findByText('Transfer sent');

    expect(screen.getByRole('button', { name: 'Mark all as read' })).toBeDisabled();
    expect(within(screen.getAllByRole('row')[1]).getByText('Done')).toBeInTheDocument();
  });

  it('paginates: Previous is disabled on the first page, Next moves forward', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Transfer sent');

    // react-bootstrap renders a disabled Pagination.Prev as a plain (non-interactive) <span>,
    // so check the surrounding list item rather than an ARIA role that only exists when enabled
    expect(screen.getByText('Previous').closest('li')).toHaveClass('disabled');

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(getNotifications).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));
  });

  it('shows a background-refresh indicator instead of replacing the list while refetching', async () => {
    const user = userEvent.setup();

    let releaseSecondFetch;
    getNotifications
      .mockResolvedValueOnce({ success: true, data: { notifications: [notification()], unreadCount: 1, pagination: page() } })
      .mockReturnValueOnce(
        new Promise((resolve) => {
          releaseSecondFetch = () => resolve({ success: true, data: { notifications: [notification()], unreadCount: 1, pagination: page() } });
        })
      );

    renderPage();
    await screen.findByText('Transfer sent');

    await user.selectOptions(screen.getByLabelText('Rows'), '50');

    // Stale content stays on screen, with a small "Refreshing…" indicator instead of the full spinner
    expect(screen.getByText('Transfer sent')).toBeInTheDocument();
    expect(await screen.findByRole('status')).toHaveTextContent(/refreshing/i);
    expect(screen.queryByText('Loading notifications...')).not.toBeInTheDocument();

    releaseSecondFetch();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });
});

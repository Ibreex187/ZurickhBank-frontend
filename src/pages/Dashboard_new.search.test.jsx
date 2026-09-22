import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard_new';
import { ToastProvider } from '../context/ToastContext';
import api from '../config/api';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'u1', firstName: 'Ada', accountNumber: '1234567890', balance: 5000, hasTransactionPin: true },
    logout: vi.fn(),
    refreshUser: vi.fn(),
  }),
}));

vi.mock('../config/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const emptyPage = { currentPage: 1, totalPages: 0, totalTransactions: 0, hasNextPage: false, hasPrevPage: false };
const usage = { limit: 100000, used: 0, remaining: 100000 };

const fakeApi = (url) => {
  if (url.startsWith('/transactions/history/summary')) return { data: { success: true, data: { summary: { netAmount: 0 } } } };
  if (url.startsWith('/transactions/history')) {
    return { data: { success: true, data: { transactions: [], pagination: emptyPage } } };
  }
  if (url.startsWith('/transactions/limits')) {
    return {
      data: {
        success: true,
        data: { tier: 'tier1', operations: { withdraw: { daily: usage, monthly: usage }, transfer: { daily: usage, monthly: usage } } },
      },
    };
  }
  if (url.startsWith('/notifications/unread-count')) return { data: { success: true, data: { unreadCount: 0 } } };
  if (url.startsWith('/users/premium-status')) return { data: { success: true, data: { isPremium: false } } };
  return { data: { success: true, data: {} } };
};

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <ToastProvider>
        <Dashboard />
      </ToastProvider>
    </MemoryRouter>
  );

// How many /transactions/history calls have been made so far
const historyCallCount = () => api.get.mock.calls.filter(([url]) => url.startsWith('/transactions/history') && !url.includes('summary')).length;

describe('Dashboard transaction search is debounced', () => {
  beforeEach(() => {
    api.get.mockImplementation((url) => Promise.resolve(fakeApi(url)));
  });

  it('does not fetch on every keystroke, only once typing settles', async () => {
    const user = userEvent.setup();
    renderDashboard();

    // Dashboard's own page-specific content (the surrounding page title now lives in AppLayout, not here)
    await screen.findByText('Transaction History');
    await user.click(screen.getByRole('button', { name: /show filters/i }));

    const callsBeforeTyping = historyCallCount();
    const searchBox = screen.getByPlaceholderText('Search transactions...');

    await user.type(searchBox, 'ada');

    // The box itself updates immediately, for a responsive feel while typing
    expect(searchBox).toHaveValue('ada');
    // ...but typing three characters has not fired three (or even one) new history fetches yet
    expect(historyCallCount()).toBe(callsBeforeTyping);

    // Once typing settles, exactly one extra request goes out, carrying the final text
    await waitFor(() => expect(historyCallCount()).toBe(callsBeforeTyping + 1), { timeout: 2000 });
    const [lastUrl] = api.get.mock.calls.filter(([url]) => url.startsWith('/transactions/history') && !url.includes('summary')).at(-1);
    expect(lastUrl).toContain('search=ada');
  });
});

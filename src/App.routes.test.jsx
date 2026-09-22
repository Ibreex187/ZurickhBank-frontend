import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import App from './App';
import api from './config/api';

const auth = vi.hoisted(() => ({
  user: null,
  loading: false,
  logout: vi.fn(),
  refreshUser: vi.fn(),
}));

vi.mock('./context/AuthContext', () => ({
  useAuth: () => auth,
  AuthProvider: ({ children }) => children,
}));

vi.mock('./config/api', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const ok = (data, extra = {}) => ({ data: { success: true, data, ...extra } });
const emptyPage = { currentPage: 1, page: 1, totalPages: 0, totalNotifications: 0, total: 0, hasNextPage: false, hasPrevPage: false };
const usage = { limit: 100000, used: 0, remaining: 100000 };

// Just enough backend for every page to load without data
const fakeApi = (url) => {
  if (url.startsWith('/beneficiaries')) return ok([]);
  if (url.startsWith('/investments/stocks')) return ok([]);
  if (url.startsWith('/investments/portfolio')) return ok([]);
  if (url.startsWith('/investments/history')) return ok([]);
  if (url.startsWith('/savings/overview')) {
    return ok({ balances: { mainBalance: 0, savingsBalance: 0, totalBalance: 0 }, statistics: {}, accountInfo: {} });
  }
  if (url.startsWith('/savings/history')) return ok({ transactions: [], pagination: emptyPage });
  if (url.startsWith('/savings/insights')) return ok({});
  if (url.startsWith('/transactions/history/summary')) return ok({ summary: { netAmount: 0 } });
  if (url.startsWith('/transactions/history')) return ok({ transactions: [], pagination: emptyPage });
  if (url.startsWith('/transactions/limits')) {
    return ok({
      tier: 'tier1',
      operations: {
        withdraw: { daily: usage, monthly: usage },
        transfer: { daily: usage, monthly: usage },
      },
    });
  }
  if (url.startsWith('/notifications/unread-count')) return ok({ unreadCount: 0 });
  if (url.startsWith('/notifications/preferences')) return ok({ emailByCategory: {} });
  if (url.startsWith('/notifications')) return ok({ notifications: [], unreadCount: 0, pagination: emptyPage });
  if (url.startsWith('/ledger/history')) return ok({ entries: [], pagination: emptyPage });
  if (url.startsWith('/ledger/statement')) return ok({ accounts: [] });
  if (url.startsWith('/users/premium-status')) return ok({ isPremium: false });
  if (url.startsWith('/admin/transactions')) return ok([]);
  return ok({});
};

const visit = (path) => {
  window.history.pushState({}, '', path);
  return render(<App />);
};

const regularUser = {
  _id: 'u1',
  firstName: 'Ada',
  lastName: 'Obi',
  userName: 'adaobi',
  email: 'ada@example.com',
  accountNumber: '1234567890',
  balance: 5000,
  savingsBalance: 100,
  hasTransactionPin: true,
  roles: 'user',
};

// [path, heading shown by the layout, text that proves the page itself rendered]
const PAGES = [
  ['/dashboard', 'Dashboard', 'Transaction History'],
  ['/beneficiaries', 'Beneficiaries', 'Beneficiary Management'],
  ['/investments', 'Investments', 'Stock Trading & Investments'],
  ['/savings', 'Savings', 'Savings Management'],
  ['/ledger', 'Ledger', 'Account Statement'],
  ['/notifications', 'Notifications', 'Inbox'],
  ['/profile', 'My Profile', null],
];

describe('signed-in pages inside the shared layout', () => {
  beforeEach(() => {
    auth.user = { ...regularUser };
    auth.loading = false;
    api.get.mockImplementation((url) => Promise.resolve(fakeApi(url)));
    for (const method of ['post', 'put', 'patch', 'delete']) {
      api[method].mockResolvedValue(ok({}));
    }
  });

  it.each(PAGES)('%s renders once, with the layout around it', async (path, title, pageText) => {
    visit(path);

    // Pages are lazy-loaded; the first, cold load of a large page can take a few seconds
    expect(await screen.findByRole('heading', { level: 1, name: title }, { timeout: 8000 })).toBeInTheDocument();
    if (pageText) expect(await screen.findByText(pageText, {}, { timeout: 8000 })).toBeInTheDocument();

    // one sidebar, one page heading: the page no longer draws its own copy
    expect(document.querySelectorAll('.sidebar')).toHaveLength(1);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(within(screen.getByRole('navigation', { name: 'Main' })).getAllByRole('link').length).toBeGreaterThanOrEqual(7);
  });

  it('renders the admin page for an admin', async () => {
    auth.user = { ...regularUser, roles: 'admin' };
    visit('/admin');

    expect(await screen.findByRole('heading', { level: 1, name: 'Admin Dashboard' })).toBeInTheDocument();
    expect(await screen.findByText('Observed Accounts')).toBeInTheDocument();
    expect(screen.getByText('Admin Account')).toBeInTheDocument();
  });

  it('keeps regular users out of the admin page', async () => {
    visit('/admin');

    expect(await screen.findByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByText('Observed Accounts')).not.toBeInTheDocument();
  });
});

describe('routing outside the layout', () => {
  beforeEach(() => {
    api.get.mockImplementation((url) => Promise.resolve(fakeApi(url)));
  });

  it('sends signed-out visitors to the login page', async () => {
    auth.user = null;
    visit('/dashboard');

    // The login page re-mounts its form panel right after the first render, so wait for it to settle
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Welcome back' })).toBeInTheDocument());
    expect(document.querySelector('.sidebar')).toBeNull();
  });

  it('shows the not-found page for unknown addresses', async () => {
    auth.user = { ...regularUser };
    visit('/no-such-page');

    expect(await screen.findByRole('heading', { name: 'Page not found' })).toBeInTheDocument();
    expect(document.querySelector('.sidebar')).toBeNull();
  });
});

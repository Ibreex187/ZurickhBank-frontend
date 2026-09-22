import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AppLayout from './AppLayout';

const auth = vi.hoisted(() => ({
  user: { firstName: 'Ada', lastName: 'Obi', userName: 'adaobi', roles: 'user' },
  logout: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }));
vi.mock('../utils/premiumStatus', () => ({ getPremiumStatus: vi.fn().mockResolvedValue({ isPremium: false }) }));
vi.mock('../services/notificationService', () => ({
  getUnreadNotificationCount: vi.fn().mockResolvedValue({ success: true, data: { unreadCount: 3 } }),
}));

const renderAt = (path) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<p>Dashboard content</p>} />
          <Route path="/savings" element={<p>Savings content</p>} />
          <Route path="/notifications" element={<p>Notifications content</p>} />
          <Route path="/admin" element={<p>Admin content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

const sidebar = () => document.querySelector('.sidebar');

describe('AppLayout', () => {
  beforeEach(() => {
    auth.user = { firstName: 'Ada', lastName: 'Obi', userName: 'adaobi', roles: 'user' };
    auth.logout.mockClear();
  });

  it('shows the page title, a personalised subtitle and the page content', async () => {
    renderAt('/dashboard');

    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Welcome back, Ada')).toBeInTheDocument();
    expect(screen.getByText('Dashboard content')).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Dashboard | Zurich Bank'));
  });

  it('lists the navigation links and hides the admin link from regular users', () => {
    renderAt('/dashboard');
    const nav = screen.getByRole('navigation', { name: 'Main' });

    for (const label of ['Dashboard', 'Beneficiaries', 'Investments', 'Savings', 'Ledger', 'Notifications', 'Profile']) {
      expect(within(nav).getByRole('link', { name: label })).toBeInTheDocument();
    }
    expect(within(nav).queryByRole('link', { name: 'Reports' })).not.toBeInTheDocument();
  });

  it('shows the admin link and the admin header on the admin page', () => {
    auth.user = { firstName: 'Root', lastName: 'Admin', userName: 'root', roles: 'admin' };
    renderAt('/admin');

    expect(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Reports' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Admin Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Admin Account')).toBeInTheDocument();
  });

  it('keeps the same sidebar element while moving between pages (it does not reload)', async () => {
    const user = userEvent.setup();
    renderAt('/dashboard');
    const before = sidebar();

    await user.click(within(screen.getByRole('navigation', { name: 'Main' })).getByRole('link', { name: 'Savings' }));

    expect(await screen.findByText('Savings content')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Savings' })).toBeInTheDocument();
    expect(sidebar()).toBe(before);
  });

  it('remembers the collapsed sidebar across visits', async () => {
    const user = userEvent.setup();
    const first = renderAt('/dashboard');

    expect(sidebar()).not.toHaveClass('collapsed');
    await user.click(screen.getByRole('button', { name: 'Collapse sidebar' }));
    expect(sidebar()).toHaveClass('collapsed');
    expect(window.localStorage.getItem('zb.sidebarCollapsed')).toBe('true');

    first.unmount();
    renderAt('/dashboard');
    expect(sidebar()).toHaveClass('collapsed');
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toBeInTheDocument();
  });

  it('shows the unread count on the notification bell', async () => {
    renderAt('/dashboard');

    expect(await screen.findByRole('button', { name: 'Open notifications, 3 unread' })).toBeInTheDocument();
  });

  it('shows the demo notice until it is dismissed, and stays dismissed', async () => {
    const user = userEvent.setup();
    const first = renderAt('/dashboard');

    expect(screen.getByText(/no real money is held or moved/i)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(screen.queryByText(/no real money is held or moved/i)).not.toBeInTheDocument();

    first.unmount();
    renderAt('/dashboard');
    expect(screen.queryByText(/no real money is held or moved/i)).not.toBeInTheDocument();
  });

  it('opens the mobile menu and closes it with Escape', async () => {
    const user = userEvent.setup();
    renderAt('/dashboard');

    await user.click(screen.getByRole('button', { name: 'Toggle menu' }));
    expect(sidebar()).toHaveClass('open');

    await user.keyboard('{Escape}');
    expect(sidebar()).not.toHaveClass('open');
  });

  it('signs out from the sidebar', async () => {
    const user = userEvent.setup();
    renderAt('/dashboard');

    await user.click(screen.getByRole('button', { name: /logout/i }));
    expect(auth.logout).toHaveBeenCalledTimes(1);
  });
});

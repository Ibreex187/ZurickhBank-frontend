import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import SavingsManagement from './SavingsManagement';
import { ToastProvider } from '../context/ToastContext';

const auth = vi.hoisted(() => ({ user: { hasTransactionPin: true } }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }));

const depositToSavings = vi.fn();
const withdrawFromSavings = vi.fn();
const quickTransfer = vi.fn();
const getSavingsOverview = vi.fn();
const getSavingsHistory = vi.fn();
const getSavingsInsights = vi.fn();

vi.mock('../services/savingsService', () => ({
  depositToSavings: (...args) => depositToSavings(...args),
  withdrawFromSavings: (...args) => withdrawFromSavings(...args),
  quickTransfer: (...args) => quickTransfer(...args),
  getSavingsOverview: (...args) => getSavingsOverview(...args),
  getSavingsHistory: (...args) => getSavingsHistory(...args),
  getSavingsInsights: (...args) => getSavingsInsights(...args),
}));

const getTransactionLimits = vi.fn();
vi.mock('../services/transactionService', () => ({
  getTransactionLimits: (...args) => getTransactionLimits(...args),
}));

const overview = () => ({
  balances: { mainBalance: 5000, savingsBalance: 1200, totalBalance: 6200 },
  statistics: { totalDeposited: 2000, totalWithdrawn: 800, netSavings: 1234 },
  accountInfo: {},
});

const txn = (overrides = {}) => ({
  _id: 't1',
  type: 'deposit',
  amount: 500,
  description: 'Payday save',
  status: 'completed',
  createdAt: '2026-09-20T10:00:00.000Z',
  ...overrides,
});

const limitsSnapshot = () => ({
  tier: 'tier1',
  operations: {
    withdraw: {
      daily: { limit: 200000, used: 50000, remaining: 150000 },
      monthly: { limit: 2000000, used: 500000, remaining: 1500000 },
    },
  },
});

const renderPage = () => render(<MemoryRouter><ToastProvider><SavingsManagement /></ToastProvider></MemoryRouter>);

describe('SavingsManagement', () => {
  beforeEach(() => {
    auth.user = { hasTransactionPin: true };
    depositToSavings.mockReset();
    withdrawFromSavings.mockReset();
    quickTransfer.mockReset();
    getSavingsOverview.mockReset();
    getSavingsHistory.mockReset();
    getSavingsInsights.mockReset();
    getTransactionLimits.mockReset();

    getSavingsOverview.mockResolvedValue({ success: true, data: overview() });
    getSavingsHistory.mockResolvedValue({ success: true, data: { transactions: [txn()] } });
    getSavingsInsights.mockResolvedValue({
      success: true,
      data: { currentStatus: { savingsPercentage: 20, savingsHealthStatus: 'Good' }, recommendations: [] },
    });
    getTransactionLimits.mockResolvedValue({ success: true, data: limitsSnapshot() });
  });

  it('shows balances, statistics and recent transactions once loaded', async () => {
    renderPage();

    expect(await screen.findByText('₦5,000.00')).toBeInTheDocument(); // main balance
    expect(screen.getByText('₦1,200.00')).toBeInTheDocument(); // savings balance
    expect(screen.getByText('Payday save')).toBeInTheDocument();
  });

  it('shows the PIN guard instead of a modal when no transaction PIN is set', async () => {
    auth.user = { hasTransactionPin: false };
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Payday save');

    await user.click(screen.getByRole('button', { name: 'Deposit' }));

    expect(await screen.findByText('Transaction PIN Required')).toBeInTheDocument();
    expect(screen.queryByText('Deposit to Savings')).not.toBeInTheDocument();
  });

  it('completes a deposit: closes the modal, toasts success, and refreshes the balances', async () => {
    const user = userEvent.setup();
    depositToSavings.mockResolvedValue({ success: true, message: 'Deposit successful!' });
    getSavingsOverview
      .mockResolvedValueOnce({ success: true, data: overview() })
      .mockResolvedValueOnce({ success: true, data: { ...overview(), balances: { mainBalance: 4500, savingsBalance: 1700, totalBalance: 6200 } } });

    renderPage();
    await screen.findByText('Payday save');

    await user.click(screen.getByRole('button', { name: 'Deposit' }));
    const depositDialog = await screen.findByRole('dialog');

    await user.type(within(depositDialog).getByPlaceholderText('Enter amount to deposit'), '500');
    await user.type(within(depositDialog).getByPlaceholderText('Enter 4-digit PIN'), '1234');
    await user.click(within(depositDialog).getByRole('button', { name: 'Deposit' }));

    await waitFor(() => expect(depositToSavings).toHaveBeenCalledWith(500, '1234'));
    expect(await screen.findByText('Deposit successful!')).toBeInTheDocument();
    expect(screen.queryByText('Deposit to Savings')).not.toBeInTheDocument();
    expect(await screen.findByText('₦4,500.00')).toBeInTheDocument();
  });

  it('shows a deposit failure inline in the modal, not as a toast, and keeps the modal open', async () => {
    const user = userEvent.setup();
    depositToSavings.mockRejectedValue({ response: { data: { message: 'Daily transfer limit exceeded' } } });

    renderPage();
    await screen.findByText('Payday save');

    await user.click(screen.getByRole('button', { name: 'Deposit' }));
    const depositDialog = await screen.findByRole('dialog');
    await user.type(within(depositDialog).getByPlaceholderText('Enter amount to deposit'), '999999');
    await user.type(within(depositDialog).getByPlaceholderText('Enter 4-digit PIN'), '1234');
    await user.click(within(depositDialog).getByRole('button', { name: 'Deposit' }));

    expect(await within(depositDialog).findByRole('alert')).toHaveTextContent('Daily transfer limit exceeded');
    expect(screen.getByText('Deposit to Savings')).toBeInTheDocument(); // modal is still open
  });

  it('loads and shows withdrawal limits inside the Withdraw modal', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Payday save');

    await user.click(screen.getByRole('button', { name: 'Withdraw' }));

    expect(await screen.findByText('Withdrawal Limits')).toBeInTheDocument();
    expect(screen.getByText('Tier: tier1')).toBeInTheDocument();
    await waitFor(() => expect(getTransactionLimits).toHaveBeenCalledWith('withdraw'));
  });

  it('keeps the transactions table visible with a refreshing indicator after a successful action', async () => {
    const user = userEvent.setup();
    quickTransfer.mockResolvedValue({ success: true, message: 'Transfer successful!' });

    let releaseSecondOverview;
    getSavingsOverview
      .mockResolvedValueOnce({ success: true, data: overview() })
      .mockReturnValueOnce(new Promise((resolve) => { releaseSecondOverview = () => resolve({ success: true, data: overview() }); }));

    renderPage();
    await screen.findByText('Payday save');

    await user.click(screen.getByRole('button', { name: 'Quick Transfer' }));
    const transferDialog = await screen.findByRole('dialog');
    await user.type(within(transferDialog).getByPlaceholderText('Enter transfer amount'), '100');
    await user.type(within(transferDialog).getByPlaceholderText('Enter 4-digit PIN'), '1234');
    await user.click(within(transferDialog).getByRole('button', { name: 'Transfer' }));

    await waitFor(() => expect(quickTransfer).toHaveBeenCalled());
    // The modal has already closed; the stale transaction list stays visible while refreshing in the background
    expect(screen.getByText('Payday save')).toBeInTheDocument();
    expect(await screen.findByRole('status')).toHaveTextContent(/refreshing/i);

    releaseSecondOverview();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Ledger from './Ledger';
import { ToastProvider } from '../context/ToastContext';

const getLedgerHistory = vi.fn();
const getAccountStatement = vi.fn();

vi.mock('../services/ledgerService', () => ({
  getLedgerHistory: (...args) => getLedgerHistory(...args),
  getAccountStatement: (...args) => getAccountStatement(...args),
}));

const historyPage = (overrides = {}) => ({
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 2,
  hasNextPage: true,
  hasPrevPage: false,
  ...overrides,
});

const entry = (overrides = {}) => ({
  _id: 'e1',
  description: 'Main account transfer',
  referenceType: 'transaction',
  accountType: 'user_main',
  debit: 0,
  credit: 500,
  createdAt: '2026-09-20T10:00:00.000Z',
  ...overrides,
});

const account = (overrides = {}) => ({
  accountType: 'user_main',
  openingBalance: 1000,
  totalDebits: 200,
  totalCredits: 700,
  netMovement: 500,
  closingBalance: 1500,
  ...overrides,
});

const renderPage = () => render(<ToastProvider><Ledger /></ToastProvider>);

describe('Ledger', () => {
  beforeEach(() => {
    getLedgerHistory.mockReset();
    getAccountStatement.mockReset();
    getLedgerHistory.mockResolvedValue({ success: true, data: { entries: [entry()], pagination: historyPage() } });
    getAccountStatement.mockResolvedValue({ success: true, data: { accounts: [account()] } });
  });

  it('shows the account statement and the ledger history table', async () => {
    renderPage();

    // Wait for the slower of the two independent fetches (history) to settle before asserting on both.
    // "user_main" and "₦500.00" each appear twice (statement card + table row), so scope to the heading.
    await screen.findByText('Main account transfer');
    expect(screen.getByRole('heading', { level: 6, name: 'user_main' })).toBeInTheDocument();
    expect(screen.getAllByText('₦500.00').length).toBe(2);
  });

  it('shows an empty state when there are no ledger entries', async () => {
    getLedgerHistory.mockResolvedValue({ success: true, data: { entries: [], pagination: historyPage({ totalPages: 0, hasNextPage: false }) } });

    renderPage();

    expect(await screen.findByText('No ledger entries found.')).toBeInTheDocument();
  });

  it('shows a message instead of an empty grid when there is no statement activity', async () => {
    getAccountStatement.mockResolvedValue({ success: true, data: { accounts: [] } });

    renderPage();

    expect(await screen.findByText('No account activity for this range.')).toBeInTheDocument();
  });

  it('refetches history and the statement when the account type filter changes, resetting to page 1', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Main account transfer');

    await user.selectOptions(screen.getByLabelText('Account Type'), 'user_savings');

    await waitFor(() => expect(getLedgerHistory).toHaveBeenLastCalledWith(
      expect.objectContaining({ accountType: 'user_savings', page: 1 })
    ));
    expect(getAccountStatement).toHaveBeenLastCalledWith(
      expect.objectContaining({ accountType: 'user_savings' })
    );
  });

  it('reference type only refetches the history, not the statement', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Main account transfer');

    const statementCallsBefore = getAccountStatement.mock.calls.length;
    await user.selectOptions(screen.getByLabelText('Reference Type'), 'investment_trade');

    await waitFor(() => expect(getLedgerHistory).toHaveBeenLastCalledWith(
      expect.objectContaining({ referenceType: 'investment_trade' })
    ));
    expect(getAccountStatement).toHaveBeenCalledTimes(statementCallsBefore);
  });

  it('paginates the ledger history', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Main account transfer');

    expect(screen.getByText('Previous').closest('li')).toHaveClass('disabled');

    await user.click(screen.getByRole('button', { name: 'Next' }));
    await waitFor(() => expect(getLedgerHistory).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 })));
  });

  it('keeps the table visible with a refreshing indicator instead of blanking it on a filter change', async () => {
    const user = userEvent.setup();

    let releaseSecondFetch;
    getLedgerHistory
      .mockResolvedValueOnce({ success: true, data: { entries: [entry()], pagination: historyPage() } })
      .mockReturnValueOnce(
        new Promise((resolve) => {
          releaseSecondFetch = () => resolve({ success: true, data: { entries: [entry()], pagination: historyPage() } });
        })
      );

    renderPage();
    await screen.findByText('Main account transfer');

    await user.selectOptions(screen.getByLabelText('Rows'), '50');

    expect(screen.getByText('Main account transfer')).toBeInTheDocument();
    expect(await screen.findByRole('status')).toHaveTextContent(/refreshing/i);
    expect(screen.queryByText('Loading ledger history...')).not.toBeInTheDocument();

    releaseSecondFetch();
    await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
  });
});

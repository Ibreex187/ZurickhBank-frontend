import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BeneficiaryManagement from './BeneficiaryManagement';
import { ToastProvider } from '../context/ToastContext';

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'u1', accountNumber: '1234567890', balance: 5000 },
    refreshUser: vi.fn(),
  }),
}));

vi.mock('../services/transactionService', () => ({
  getTransactionLimits: vi.fn().mockResolvedValue({ success: true, data: { tier: 'tier1', operations: {} } }),
}));

const getBeneficiaries = vi.fn();
const removeBeneficiary = vi.fn();

vi.mock('../services/beneficiaryService', () => ({
  getBeneficiaries: (...args) => getBeneficiaries(...args),
  createBeneficiary: vi.fn(),
  removeBeneficiary: (...args) => removeBeneficiary(...args),
  transferToBeneficiary: vi.fn(),
  validateAccountNumber: (accountNumber) => (/^\d{10}$/.test(accountNumber) ? null : 'Account number must be exactly 10 digits'),
}));

const renderPage = () => render(<ToastProvider><BeneficiaryManagement /></ToastProvider>);

const beneficiary = { _id: 'b1', firstName: 'Ada', lastName: 'Obi', userName: 'adaobi', accountNumber: '9876543210' };

describe('BeneficiaryManagement keeps content visible while refreshing', () => {
  beforeEach(() => {
    getBeneficiaries.mockReset();
    removeBeneficiary.mockReset();
  });

  it('does not replace the table with a full-page spinner while a background refresh is in flight', async () => {
    const user = userEvent.setup();

    getBeneficiaries.mockResolvedValueOnce({ success: true, data: [beneficiary] });

    // The refetch after deleting resolves only once the test releases it, so the "in-flight" window is observable
    let releaseRefetch;
    const refetchPromise = new Promise((resolve) => {
      releaseRefetch = () => resolve({ success: true, data: [] });
    });
    getBeneficiaries.mockReturnValueOnce(refetchPromise);

    removeBeneficiary.mockResolvedValue({ success: true });

    renderPage();

    expect(await screen.findByText('Ada Obi')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await user.click(await screen.findByRole('button', { name: 'Remove' }));

    // While the refetch is pending: the stale row is still visible, and there is no full-page spinner —
    // only the small "Refreshing…" indicator shows that something is happening in the background
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/refreshing/i));
    expect(screen.getByText('Ada Obi')).toBeInTheDocument();
    expect(screen.queryByText('Loading beneficiaries...')).not.toBeInTheDocument();

    // Once the refetch resolves, the list updates and the refreshing indicator clears
    releaseRefetch();
    await waitFor(() => expect(screen.queryByText('Ada Obi')).not.toBeInTheDocument());
    expect(await screen.findByText('No beneficiaries added yet')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();

    // The delete result was reported as a toast, not a page banner
    expect(await screen.findByText('Beneficiary deleted successfully!')).toBeInTheDocument();
  });

  it('shows the full-page spinner only for the very first load', async () => {
    let releaseFirstLoad;
    getBeneficiaries.mockReturnValueOnce(
      new Promise((resolve) => {
        releaseFirstLoad = () => resolve({ success: true, data: [] });
      })
    );

    renderPage();

    expect(await screen.findByText('Loading beneficiaries...')).toBeInTheDocument();
    releaseFirstLoad();
    expect(await screen.findByText('No beneficiaries added yet')).toBeInTheDocument();
  });
});

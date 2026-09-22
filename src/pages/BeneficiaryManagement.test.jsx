import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BeneficiaryManagement from './BeneficiaryManagement';
import { ToastProvider } from '../context/ToastContext';

const auth = vi.hoisted(() => ({
  user: { _id: 'u1', accountNumber: '1234567890', balance: 5000 },
  refreshUser: vi.fn(),
}));
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }));

const getBeneficiaries = vi.fn();
const createBeneficiary = vi.fn();
const removeBeneficiary = vi.fn();
const transferToBeneficiary = vi.fn();

vi.mock('../services/beneficiaryService', () => ({
  getBeneficiaries: (...args) => getBeneficiaries(...args),
  createBeneficiary: (...args) => createBeneficiary(...args),
  removeBeneficiary: (...args) => removeBeneficiary(...args),
  transferToBeneficiary: (...args) => transferToBeneficiary(...args),
}));

const getTransactionLimits = vi.fn();
vi.mock('../services/transactionService', () => ({
  getTransactionLimits: (...args) => getTransactionLimits(...args),
}));

const beneficiary = (overrides = {}) => ({
  _id: 'b1',
  firstName: 'Ada',
  lastName: 'Obi',
  userName: 'adaobi',
  accountNumber: '9876543210',
  ...overrides,
});

const limitsSnapshot = () => ({
  tier: 'tier1',
  operations: {
    transfer: {
      daily: { limit: 500000, used: 100000, remaining: 400000 },
      monthly: { limit: 5000000, used: 1000000, remaining: 4000000 },
    },
  },
});

const renderPage = () => render(<ToastProvider><BeneficiaryManagement /></ToastProvider>);

describe('BeneficiaryManagement', () => {
  beforeEach(() => {
    auth.user = { _id: 'u1', accountNumber: '1234567890', balance: 5000 };
    auth.refreshUser.mockReset();
    getBeneficiaries.mockReset();
    createBeneficiary.mockReset();
    removeBeneficiary.mockReset();
    transferToBeneficiary.mockReset();
    getTransactionLimits.mockReset();

    getBeneficiaries.mockResolvedValue({ success: true, data: [beneficiary()] });
    getTransactionLimits.mockResolvedValue({ success: true, data: limitsSnapshot() });
  });

  it('lists beneficiaries and shows the count on the stat cards', async () => {
    renderPage();

    expect(await screen.findByText('Ada Obi')).toBeInTheDocument();
    expect(screen.getByText('adaobi')).toBeInTheDocument();
    expect(screen.getByText('9876543210')).toBeInTheDocument();
    // "Total Beneficiaries" and "Quick Access" cards both echo the same count (1)
    expect(screen.getAllByText('1')).toHaveLength(2);
  });

  it('shows an empty state with a call to action when there are no beneficiaries', async () => {
    getBeneficiaries.mockResolvedValue({ success: true, data: [] });
    renderPage();

    expect(await screen.findByText('No beneficiaries added yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add your first beneficiary' })).toBeInTheDocument();
  });

  it('adds a beneficiary: closes the modal, toasts success, and refreshes the list', async () => {
    const user = userEvent.setup();
    createBeneficiary.mockResolvedValue({ success: true, message: 'Beneficiary added successfully!' });
    getBeneficiaries
      .mockResolvedValueOnce({ success: true, data: [beneficiary()] })
      .mockResolvedValueOnce({ success: true, data: [beneficiary(), beneficiary({ _id: 'b2', firstName: 'Ben', lastName: 'Ide', userName: 'benide', accountNumber: '1111111111' })] });

    renderPage();
    await screen.findByText('Ada Obi');

    await user.click(screen.getByRole('button', { name: 'Add Beneficiary' }));
    const dialog = await screen.findByRole('dialog');

    await user.type(within(dialog).getByPlaceholderText('Enter 10-digit account number'), '1111111111');
    await user.click(within(dialog).getByRole('button', { name: 'Add Beneficiary' }));

    await waitFor(() => expect(createBeneficiary).toHaveBeenCalledWith('1111111111'));
    expect(await screen.findByText('Beneficiary added successfully!')).toBeInTheDocument();
    expect(screen.queryByText('Add New Beneficiary')).not.toBeInTheDocument();
    expect(await screen.findByText('Ben Ide')).toBeInTheDocument();
  });

  it('blocks adding yourself as a beneficiary, inline in the modal', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Ada Obi');

    await user.click(screen.getByRole('button', { name: 'Add Beneficiary' }));
    const dialog = await screen.findByRole('dialog');

    await user.type(within(dialog).getByPlaceholderText('Enter 10-digit account number'), '1234567890');
    await user.click(within(dialog).getByRole('button', { name: 'Add Beneficiary' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Cannot add yourself as beneficiary');
    expect(createBeneficiary).not.toHaveBeenCalled();
    expect(screen.getByText('Add New Beneficiary')).toBeInTheDocument(); // modal stays open
  });

  it('shows a server-side add failure inline in the modal, not as a toast', async () => {
    const user = userEvent.setup();
    createBeneficiary.mockRejectedValue({ response: { data: { message: 'Account not found' } } });

    renderPage();
    await screen.findByText('Ada Obi');

    await user.click(screen.getByRole('button', { name: 'Add Beneficiary' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByPlaceholderText('Enter 10-digit account number'), '5555555555');
    await user.click(within(dialog).getByRole('button', { name: 'Add Beneficiary' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Account not found');
    expect(screen.getByText('Add New Beneficiary')).toBeInTheDocument();
  });

  it('confirms before deleting a beneficiary and toasts the result', async () => {
    const user = userEvent.setup();
    removeBeneficiary.mockResolvedValue({ success: true });
    getBeneficiaries
      .mockResolvedValueOnce({ success: true, data: [beneficiary()] })
      .mockResolvedValueOnce({ success: true, data: [] });

    renderPage();
    await screen.findByText('Ada Obi');

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Remove beneficiary?')).toBeInTheDocument();
    expect(within(dialog).getByText((_, node) => node?.textContent === 'Ada Obi (9876543210) will be removed from your list.')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Remove' }));

    await waitFor(() => expect(removeBeneficiary).toHaveBeenCalledWith('b1'));
    expect(await screen.findByText('Beneficiary deleted successfully!')).toBeInTheDocument();
  });

  it('loads and shows transfer limits inside the Transfer modal', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Ada Obi');

    await user.click(screen.getByRole('button', { name: 'Transfer' }));

    expect(await screen.findByText('Transfer Limits')).toBeInTheDocument();
    expect(screen.getByText('Tier: tier1')).toBeInTheDocument();
    await waitFor(() => expect(getTransactionLimits).toHaveBeenCalledWith('transfer'));
  });

  it('completes a transfer and shows a receipt with the transaction reference', async () => {
    const user = userEvent.setup();
    transferToBeneficiary.mockResolvedValue({
      success: true,
      data: { amount: 250, newBalance: 4750, transactionId: 'TXN-123', recipient: { name: 'Ada Obi', accountNumber: '9876543210' } },
    });

    renderPage();
    await screen.findByText('Ada Obi');

    await user.click(screen.getByRole('button', { name: 'Transfer' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByPlaceholderText('Enter amount'), '250');
    await user.type(within(dialog).getByPlaceholderText('Enter 4-digit PIN'), '1234');
    await user.click(within(dialog).getByRole('button', { name: 'Transfer' }));

    await waitFor(() => expect(transferToBeneficiary).toHaveBeenCalledWith({
      receiverAccountNumber: '9876543210',
      amount: 250,
      description: '',
      transactionPin: '1234',
    }));

    expect(await within(dialog).findByText('Transfer successful')).toBeInTheDocument();
    expect(within(dialog).getByText('TXN-123')).toBeInTheDocument();
    expect(auth.refreshUser).toHaveBeenCalled();
  });

  it('shows a transfer failure inline in the modal, not as a toast, and keeps the modal open', async () => {
    const user = userEvent.setup();
    transferToBeneficiary.mockRejectedValue({ response: { data: { message: 'Daily transfer limit exceeded' } } });

    renderPage();
    await screen.findByText('Ada Obi');

    await user.click(screen.getByRole('button', { name: 'Transfer' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByPlaceholderText('Enter amount'), '999999');
    await user.type(within(dialog).getByPlaceholderText('Enter 4-digit PIN'), '1234');
    await user.click(within(dialog).getByRole('button', { name: 'Transfer' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Daily transfer limit exceeded');
    expect(screen.getByText(/Transfer to Ada Obi/)).toBeInTheDocument(); // modal is still open
  });
});

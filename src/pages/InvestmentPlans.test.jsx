import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InvestmentPlans from './InvestmentPlans';
import { ToastProvider } from '../context/ToastContext';

const auth = vi.hoisted(() => ({
  user: { balance: 10000 },
  refreshUser: vi.fn(),
}));
vi.mock('../context/AuthContext', () => ({ useAuth: () => auth }));

const getAvailableStocks = vi.fn();
const getStockPortfolio = vi.fn();
const getStockDetails = vi.fn();
const getInvestmentHistory = vi.fn();
const buyStock = vi.fn();
const sellStock = vi.fn();

vi.mock('../services/investmentService', () => ({
  getAvailableStocks: (...args) => getAvailableStocks(...args),
  getStockPortfolio: (...args) => getStockPortfolio(...args),
  getStockDetails: (...args) => getStockDetails(...args),
  getInvestmentHistory: (...args) => getInvestmentHistory(...args),
  buyStock: (...args) => buyStock(...args),
  sellStock: (...args) => sellStock(...args),
}));

const stock = (overrides = {}) => ({
  id: 'MSFT', symbol: 'MSFT', name: 'Microsoft', description: 'Software giant',
  currentPrice: 100, priceChange: 1, priceChangePercent: 1, risk: 'Low',
  category: 'conservative', duration: 'Simulated Trading', features: ['Simulated price updates'],
  ...overrides,
});

// planName is deliberately different from the stock's display name above: they render in
// different places (portfolio holding vs. market listing) and must not collide in queries.
const investment = (overrides = {}) => ({
  _id: 'inv1', planName: 'Microsoft Holding', symbol: 'MSFT', amount: 500, currentValue: 600,
  quantity: 5, averagePrice: 100, currentPrice: 120, profitLoss: 100, profitLossPercent: 20,
  status: 'active',
  ...overrides,
});

const historyItem = (overrides = {}) => ({
  _id: 'h1', purchaseDate: '2026-09-20T10:00:00.000Z', stockSymbol: 'MSFT', quantity: 5,
  totalInvested: 500, status: 'active',
  ...overrides,
});

const renderPage = () => render(<ToastProvider><InvestmentPlans /></ToastProvider>);

describe('InvestmentPlans', () => {
  beforeEach(() => {
    auth.user = { balance: 10000 };
    auth.refreshUser.mockReset();
    getAvailableStocks.mockReset();
    getStockPortfolio.mockReset();
    getStockDetails.mockReset();
    getInvestmentHistory.mockReset();
    buyStock.mockReset();
    sellStock.mockReset();

    getAvailableStocks.mockResolvedValue({ success: true, data: [stock()] });
    getStockPortfolio.mockResolvedValue({ success: true, data: [investment()] });
    getInvestmentHistory.mockResolvedValue({ success: true, data: [historyItem()] });
  });

  it('renders the portfolio, available stocks and investment history once loaded', async () => {
    getAvailableStocks.mockResolvedValue({
      success: true,
      data: [stock(), stock({ id: 'TSLA', symbol: 'TSLA', name: 'Tesla', category: 'aggressive', risk: 'High', description: 'Electric vehicles' })],
    });

    renderPage();

    expect(await screen.findByText('Microsoft Holding')).toBeInTheDocument(); // portfolio table row
    expect(screen.getByRole('heading', { level: 5, name: 'Microsoft' })).toBeInTheDocument(); // stock card
    expect(screen.getByRole('heading', { level: 5, name: 'Tesla' })).toBeInTheDocument();
    expect(screen.getByText('Total Invested', { selector: 'h6' })).toBeInTheDocument(); // stat card (the history table has a same-named column)
    expect(screen.getByText('Current Value', { selector: 'h6' })).toBeInTheDocument();
    expect(screen.getByText('Total Returns', { selector: 'h6' })).toBeInTheDocument();
    expect(screen.getByText('Active Plans', { selector: 'h6' })).toBeInTheDocument();
    expect(screen.getByText('Software giant')).toBeInTheDocument(); // stock description
  });

  it('filters available stocks by category', async () => {
    const user = userEvent.setup();
    getAvailableStocks.mockResolvedValue({
      success: true,
      data: [stock(), stock({ id: 'TSLA', symbol: 'TSLA', name: 'Tesla', category: 'aggressive', risk: 'High' })],
    });

    renderPage();
    expect(await screen.findByText('Microsoft', { selector: 'h5' })).toBeInTheDocument();
    expect(screen.getByText('Tesla')).toBeInTheDocument();

    await user.selectOptions(screen.getByRole('combobox'), 'aggressive');

    expect(screen.queryByText('Microsoft', { selector: 'h5' })).not.toBeInTheDocument();
    expect(screen.getByText('Tesla')).toBeInTheDocument();
  });

  it('buys shares: reviews the order, places it, and shows a receipt', async () => {
    const user = userEvent.setup();
    buyStock.mockResolvedValue({
      success: true,
      data: { totalCost: 1000, pricePerShare: 100, remainingBalance: 9000, tradeReferenceId: 'TRX-BUY-1' },
    });

    renderPage();
    await screen.findByText('Microsoft', { selector: 'h5' });

    await user.click(screen.getByRole('button', { name: 'Buy Stock' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByPlaceholderText('Enter quantity'), '10');
    await user.click(within(dialog).getByRole('button', { name: 'Review order' }));

    expect(await within(dialog).findByText('Review your order before placing it.')).toBeInTheDocument();
    expect(within(dialog).getByText('10 × MSFT')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Place buy order' }));

    await waitFor(() => expect(buyStock).toHaveBeenCalledWith({ stockSymbol: 'MSFT', quantity: 10 }));
    expect(await within(dialog).findByText('Shares purchased')).toBeInTheDocument();
    expect(within(dialog).getByText('TRX-BUY-1')).toBeInTheDocument();
    expect(auth.refreshUser).toHaveBeenCalled();
  });

  it('blocks a buy order that costs more than the available balance, inline on the form', async () => {
    auth.user = { balance: 500 };
    const user = userEvent.setup();

    renderPage();
    await screen.findByText('Microsoft', { selector: 'h5' });

    await user.click(screen.getByRole('button', { name: 'Buy Stock' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByPlaceholderText('Enter quantity'), '10'); // 10 * 100 = 1000 > 500
    await user.click(within(dialog).getByRole('button', { name: 'Review order' }));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Insufficient balance');
    expect(buyStock).not.toHaveBeenCalled();
    expect(within(dialog).getByPlaceholderText('Enter quantity')).toBeInTheDocument(); // still on the form step
  });

  it('blocks selling more shares than owned, inline on the form', async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText('Microsoft', { selector: 'h5' }); // available-stocks heading, confirms load

    await user.click(screen.getByRole('button', { name: 'Sell' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByPlaceholderText('Enter quantity'), '10'); // only 5 owned
    // The input's own `max` attribute equals the owned quantity, so a real click on the submit
    // button would be intercepted by the browser's built-in constraint validation before our
    // handler ever runs. Submit the form directly to reach the app's own validation message.
    fireEvent.submit(dialog.querySelector('form'));

    expect(await within(dialog).findByRole('alert')).toHaveTextContent('Cannot sell 10 shares. You only own 5.');
    expect(sellStock).not.toHaveBeenCalled();
  });

  it('sells shares: shows a receipt including the profit/loss for the trade', async () => {
    const user = userEvent.setup();
    sellStock.mockResolvedValue({
      success: true,
      data: { totalSaleValue: 240, pricePerShare: 120, newBalance: 10240, tradeReferenceId: 'TRX-SELL-1', profitLoss: 40 },
    });

    renderPage();
    await screen.findByText('Microsoft', { selector: 'h5' });

    await user.click(screen.getByRole('button', { name: 'Sell' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByPlaceholderText('Enter quantity'), '2');
    await user.click(within(dialog).getByRole('button', { name: 'Review order' }));
    await user.click(within(dialog).getByRole('button', { name: 'Place sell order' }));

    await waitFor(() => expect(sellStock).toHaveBeenCalledWith({ stockSymbol: 'MSFT', quantity: 2 }));
    expect(await within(dialog).findByText('Shares sold')).toBeInTheDocument();
    expect(within(dialog).getByText('Profit / loss')).toBeInTheDocument();
  });

  it('shows an order failure inline on the review step and keeps the modal open', async () => {
    const user = userEvent.setup();
    buyStock.mockRejectedValue({ response: { data: { message: 'Market is closed for this stock' } } });

    renderPage();
    await screen.findByText('Microsoft', { selector: 'h5' });

    await user.click(screen.getByRole('button', { name: 'Buy Stock' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByPlaceholderText('Enter quantity'), '1');
    await user.click(within(dialog).getByRole('button', { name: 'Review order' }));
    await user.click(within(dialog).getByRole('button', { name: 'Place buy order' }));

    // The modal also has a permanent informational alert, so match the error by its own text rather than by role
    expect(await within(dialog).findByText('Market is closed for this stock')).toBeInTheDocument();
    expect(within(dialog).getByText('Review your order before placing it.')).toBeInTheDocument(); // still reviewing
  });

  it('loads and shows stock details in a modal', async () => {
    const user = userEvent.setup();
    getStockDetails.mockResolvedValue({
      success: true,
      data: stock({ description: 'Detailed description', basePrice: 95 }),
    });

    renderPage();
    await screen.findByText('Microsoft', { selector: 'h5' });

    await user.click(screen.getByRole('button', { name: 'View Details' }));

    await waitFor(() => expect(getStockDetails).toHaveBeenCalledWith('MSFT'));
    expect(await screen.findByText('Detailed description')).toBeInTheDocument();
  });

  it('does not let placing an order affect the unrelated portfolio Refresh button', async () => {
    const user = userEvent.setup();
    let releaseBuy;
    buyStock.mockReturnValue(new Promise((resolve) => { releaseBuy = resolve; }));

    renderPage();
    await screen.findByText('Microsoft', { selector: 'h5' });

    await user.click(screen.getByRole('button', { name: 'Buy Stock' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByPlaceholderText('Enter quantity'), '1');
    await user.click(within(dialog).getByRole('button', { name: 'Review order' }));
    await user.click(within(dialog).getByRole('button', { name: 'Place buy order' }));

    // The order is still in flight; the portfolio card's own Refresh button must stay unaffected
    // (the Investment History card below has its own same-named button, so scope to the portfolio card)
    const portfolioCard = screen.getByText('My Stock Portfolio').closest('.card');
    expect(await within(dialog).findByRole('button', { name: 'Placing order...' })).toBeInTheDocument();
    expect(within(portfolioCard).getByRole('button', { name: 'Refresh' })).toBeInTheDocument();
    expect(within(portfolioCard).queryByRole('button', { name: 'Refreshing...' })).not.toBeInTheDocument();

    releaseBuy({ success: true, data: { totalCost: 100, tradeReferenceId: 'TRX-X' } });
    await within(dialog).findByText('Shares purchased');
  });

  it('keeps the available-stocks spinner up until the stocks call resolves, independent of the portfolio call', async () => {
    let releaseStocks;
    getAvailableStocks.mockReturnValue(new Promise((resolve) => { releaseStocks = resolve; }));

    renderPage();

    // The portfolio loads quickly, but stocks are still pending: the stocks spinner must still show
    expect(await screen.findByText('Microsoft Holding')).toBeInTheDocument(); // portfolio row
    expect(screen.getByText('Loading available stocks...')).toBeInTheDocument();

    releaseStocks({ success: true, data: [stock()] });
    await waitFor(() => expect(screen.queryByText('Loading available stocks...')).not.toBeInTheDocument());
    expect(await screen.findByText('Microsoft', { selector: 'h5' })).toBeInTheDocument();
  });
});

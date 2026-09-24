import { describe, expect, it } from 'vitest';
import { validateTransactionAmount } from './transactionService';

// Regression test: this only ever checked a minimum amount, never a maximum. A real deposit
// made through the app's own UI went through unchecked (frontend and backend both had the same
// gap) and produced a multi-quintillion-naira balance. Mirrors
// Banknode/tests/transaction.amount.limit.test.js on the backend.
describe('validateTransactionAmount', () => {
  it('accepts an ordinary amount', () => {
    expect(validateTransactionAmount('500')).toBeNull();
  });

  it('rejects a missing amount', () => {
    expect(validateTransactionAmount('')).toBe('Amount is required');
  });

  it('rejects an amount below the minimum', () => {
    expect(validateTransactionAmount('0.001')).toMatch(/greater than 0\.01/);
  });

  it('accepts the amount right at the maximum', () => {
    expect(validateTransactionAmount('50000000')).toBeNull();
  });

  it('rejects an amount above the maximum', () => {
    expect(validateTransactionAmount('50000001')).toMatch(/cannot exceed/);
  });

  it('rejects the exact absurd amount reported by a real deposit', () => {
    expect(validateTransactionAmount('5526626262626262600000000')).toMatch(/cannot exceed/);
  });
});

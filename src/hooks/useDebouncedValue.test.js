import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 400));
    expect(result.current).toBe('a');
  });

  it('only updates after the delay has passed with no further changes', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 400), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'ab' });
    expect(result.current).toBe('a'); // not yet

    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(result.current).toBe('a'); // still not yet

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe('ab');
  });

  it('restarts the timer on every change, so only the final value ever lands', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 400), {
      initialProps: { value: 'a' },
    });

    for (const next of ['ab', 'abc', 'abcd']) {
      rerender({ value: next });
      act(() => {
        vi.advanceTimersByTime(200); // less than the delay, so it never settles mid-way
      });
    }
    expect(result.current).toBe('a');

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(result.current).toBe('abcd');
  });
});

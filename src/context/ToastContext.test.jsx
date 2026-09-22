import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ToastProvider, useToast } from './ToastContext';

// fireEvent (not userEvent) here: userEvent schedules its own internal timers, which
// conflicts with vi.useFakeTimers() below and hangs the test waiting on them.
const click = (element) => act(() => fireEvent.click(element));

const Demo = () => {
  const { notify } = useToast();
  return (
    <div>
      <button onClick={() => notify({ variant: 'success', text: 'Saved successfully' })}>Fire success</button>
      <button onClick={() => notify({ variant: 'danger', text: 'Something broke' })}>Fire error</button>
      <button onClick={() => notify({ variant: 'warning', text: 'Careful now' })}>Fire warning</button>
      <button onClick={() => notify({ text: '' })}>Fire empty</button>
    </div>
  );
};

const renderDemo = () => render(<ToastProvider><Demo /></ToastProvider>);

describe('ToastContext', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows a success toast, announced via the library\'s built-in alert live region', () => {
    renderDemo();
    click(screen.getByRole('button', { name: 'Fire success' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Saved successfully');
  });

  it('shows an error toast that does not auto-dismiss', () => {
    renderDemo();
    click(screen.getByRole('button', { name: 'Fire error' }));

    expect(screen.getByRole('alert')).toHaveTextContent('Something broke');

    act(() => vi.advanceTimersByTime(20000));
    expect(screen.getByRole('alert')).toHaveTextContent('Something broke');
  });

  it('auto-dismisses a success toast after a few seconds', () => {
    renderDemo();
    click(screen.getByRole('button', { name: 'Fire success' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Saved successfully');

    act(() => vi.advanceTimersByTime(4500));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('can be dismissed manually before it would auto-dismiss', () => {
    renderDemo();
    click(screen.getByRole('button', { name: 'Fire success' }));
    click(screen.getByRole('button', { name: /close/i }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('stacks multiple toasts independently', () => {
    renderDemo();
    click(screen.getByRole('button', { name: 'Fire warning' }));
    click(screen.getByRole('button', { name: 'Fire error' }));

    const alerts = screen.getAllByRole('alert');
    expect(alerts).toHaveLength(2);
    expect(alerts[0]).toHaveTextContent('Careful now');
    expect(alerts[1]).toHaveTextContent('Something broke');
  });

  it('ignores a notify call with no text', () => {
    renderDemo();
    click(screen.getByRole('button', { name: 'Fire empty' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

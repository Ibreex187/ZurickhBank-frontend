import { useCallback, useEffect, useState } from 'react';

/**
 * Counts down whole seconds, e.g. for a "Resend code in 42s" button.
 * start(seconds) begins (or restarts) the countdown; secondsLeft is 0 when it is finished.
 */
export const useCountdown = () => {
  const [endsAt, setEndsAt] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!endsAt) return undefined;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining === 0) setEndsAt(null);
    };

    tick();
    const timer = setInterval(tick, 1000);

    return () => clearInterval(timer);
  }, [endsAt]);

  const start = useCallback((seconds) => {
    setEndsAt(Date.now() + Math.max(0, seconds) * 1000);
  }, []);

  return { secondsLeft, start };
};

export default useCountdown;

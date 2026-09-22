import { useEffect, useState } from 'react';

/** Returns `value`, but only after it has stopped changing for `delayMs`. */
export const useDebouncedValue = (value, delayMs = 400) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};

export default useDebouncedValue;

import { useRef, useEffect } from 'react';

/**
 * Hook that returns the previous value of a variable
 * Useful for comparing current and previous values
 *
 * @example
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count);
 *
 * // prevCount is undefined on first render, then holds previous count
 * console.log(`Changed from ${prevCount} to ${count}`);
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

export default usePrevious;

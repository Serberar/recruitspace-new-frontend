import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Hook that returns a throttled version of the value
 * Value only updates at most once per interval
 *
 * @example
 * const [position, setPosition] = useState({ x: 0, y: 0 });
 * const throttledPosition = useThrottle(position, 100);
 */
export function useThrottle<T>(value: T, interval: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastUpdated = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();

    if (now >= lastUpdated.current + interval) {
      lastUpdated.current = now;
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now();
        setThrottledValue(value);
      }, interval - (now - lastUpdated.current));

      return () => clearTimeout(timer);
    }
  }, [value, interval]);

  return throttledValue;
}

/**
 * Hook that returns a throttled callback function
 * Function can only be called at most once per interval
 *
 * @example
 * const throttledScroll = useThrottledCallback(() => {
 *   console.log('scroll position:', window.scrollY);
 * }, 100);
 *
 * useEffect(() => {
 *   window.addEventListener('scroll', throttledScroll);
 *   return () => window.removeEventListener('scroll', throttledScroll);
 * }, [throttledScroll]);
 */
export function useThrottledCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  interval: number
): T {
  const lastCalled = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const callbackRef = useRef<T>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now >= lastCalled.current + interval) {
        lastCalled.current = now;
        callbackRef.current(...args);
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          lastCalled.current = Date.now();
          callbackRef.current(...args);
        }, interval - (now - lastCalled.current));
      }
    },
    [interval]
  ) as T;

  return throttledCallback;
}

export default useThrottle;

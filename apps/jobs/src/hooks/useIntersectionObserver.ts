import { useState, useEffect, useRef, type RefObject } from 'react';

interface UseIntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  freezeOnceVisible?: boolean;
}

interface UseIntersectionObserverReturn {
  isIntersecting: boolean;
  entry: IntersectionObserverEntry | undefined;
}

/**
 * Hook for observing when an element enters/exits the viewport
 * Useful for lazy loading images, infinite scroll, animations on scroll
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const { isIntersecting } = useIntersectionObserver(ref, {
 *   threshold: 0.1,
 *   freezeOnceVisible: true,
 * });
 *
 * return (
 *   <div ref={ref}>
 *     {isIntersecting && <ExpensiveComponent />}
 *   </div>
 * );
 */
export function useIntersectionObserver(
  elementRef: RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
): UseIntersectionObserverReturn {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options;

  const [entry, setEntry] = useState<IntersectionObserverEntry>();
  const frozen = useRef(false);

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    // Don't update if already frozen (freezeOnceVisible behavior)
    if (frozen.current) return;

    setEntry(entry);

    if (freezeOnceVisible && entry.isIntersecting) {
      frozen.current = true;
    }
  };

  useEffect(() => {
    const node = elementRef?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen.current || !node) return;

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, threshold, root, rootMargin, freezeOnceVisible]);

  return {
    isIntersecting: entry?.isIntersecting ?? false,
    entry,
  };
}

/**
 * Simplified hook for lazy loading
 * Returns true once the element has been visible
 *
 * @example
 * const ref = useRef<HTMLImageElement>(null);
 * const isVisible = useLazyLoad(ref);
 *
 * return (
 *   <img
 *     ref={ref}
 *     src={isVisible ? actualSrc : placeholder}
 *   />
 * );
 */
export function useLazyLoad(
  elementRef: RefObject<Element>,
  rootMargin = '100px'
): boolean {
  const { isIntersecting } = useIntersectionObserver(elementRef, {
    rootMargin,
    freezeOnceVisible: true,
  });

  return isIntersecting;
}

export default useIntersectionObserver;

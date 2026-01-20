import { useEffect, useRef, type ReactNode, type HTMLAttributes } from 'react';

export interface FocusTrapProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Whether the focus trap is active */
  active?: boolean;
  /** Whether to return focus to the previously focused element on unmount */
  returnFocus?: boolean;
  /** Whether to auto-focus the first focusable element */
  autoFocus?: boolean;
}

const FOCUSABLE_SELECTORS = [
  'a[href]',
  'area[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Focus trap component for modals, dialogs, dropdowns
 * Keeps focus within the component when tabbing
 *
 * @example
 * <FocusTrap active={isOpen}>
 *   <div role="dialog">
 *     <button>Close</button>
 *     <input />
 *   </div>
 * </FocusTrap>
 */
export function FocusTrap({
  children,
  active = true,
  returnFocus = true,
  autoFocus = true,
  ...props
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<Element | null>(null);

  useEffect(() => {
    if (!active) return;

    // Store the previously focused element
    previousActiveElement.current = document.activeElement;

    // Auto-focus first focusable element
    if (autoFocus && containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(FOCUSABLE_SELECTORS);
      const firstElement = focusableElements[0] as HTMLElement | undefined;
      firstElement?.focus();
    }

    // Return focus on cleanup
    return () => {
      if (returnFocus && previousActiveElement.current instanceof HTMLElement) {
        previousActiveElement.current.focus();
      }
    };
  }, [active, autoFocus, returnFocus]);

  useEffect(() => {
    if (!active) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || !containerRef.current) return;

      const focusableElements = containerRef.current.querySelectorAll(FOCUSABLE_SELECTORS);
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [active]);

  return (
    <div ref={containerRef} {...props}>
      {children}
    </div>
  );
}

export default FocusTrap;

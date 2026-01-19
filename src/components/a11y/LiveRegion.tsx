import { type ReactNode, type HTMLAttributes } from 'react';
import styles from './VisuallyHidden.module.css';

export interface LiveRegionProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /**
   * How important the announcement is:
   * - 'polite': Waits for user to be idle (default)
   * - 'assertive': Interrupts the user immediately
   */
  politeness?: 'polite' | 'assertive';
  /**
   * What to announce when content changes:
   * - 'additions': Only new content
   * - 'removals': Only removed content
   * - 'all': All changes (default)
   */
  relevant?: 'additions' | 'removals' | 'all' | 'additions removals';
  /** Whether the region is atomic (announce entire region on change) */
  atomic?: boolean;
  /** Whether to visually hide the region */
  visuallyHidden?: boolean;
}

/**
 * Live region for announcing dynamic content changes to screen readers
 * Use for notifications, status updates, search results count, etc.
 *
 * @example
 * // Announce search results count
 * <LiveRegion politeness="polite">
 *   {results.length} resultados encontrados
 * </LiveRegion>
 *
 * @example
 * // Announce error messages immediately
 * <LiveRegion politeness="assertive">
 *   {error && `Error: ${error}`}
 * </LiveRegion>
 */
export function LiveRegion({
  children,
  politeness = 'polite',
  relevant = 'all',
  atomic = true,
  visuallyHidden = true,
  className = '',
  ...props
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-relevant={relevant}
      aria-atomic={atomic}
      className={visuallyHidden ? styles.visuallyHidden : className}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Pre-configured live region for announcements
 * Useful for toast-like status messages
 */
export function Announcer({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <LiveRegion politeness="polite" visuallyHidden>
      {message}
    </LiveRegion>
  );
}

export default LiveRegion;

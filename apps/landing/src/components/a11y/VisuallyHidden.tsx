import { type ReactNode, type HTMLAttributes } from 'react';
import styles from './VisuallyHidden.module.css';

export interface VisuallyHiddenProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  /** If true, content becomes visible on focus (useful for skip links) */
  focusable?: boolean;
}

/**
 * Visually hide content but keep it accessible to screen readers
 * Use for providing context that's only needed for assistive technology
 *
 * @example
 * <button>
 *   <Icon name="close" />
 *   <VisuallyHidden>Cerrar modal</VisuallyHidden>
 * </button>
 */
export function VisuallyHidden({
  children,
  focusable = false,
  className = '',
  ...props
}: VisuallyHiddenProps) {
  return (
    <span
      className={`${styles.visuallyHidden} ${focusable ? styles.focusable : ''} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}

export default VisuallyHidden;

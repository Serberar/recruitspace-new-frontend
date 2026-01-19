import styles from './SkipLink.module.css';

export interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
}

/**
 * Skip link for keyboard navigation
 * Allows users to skip directly to main content
 *
 * @example
 * // In your layout:
 * <SkipLink />
 * <header>...</header>
 * <main id="main-content">...</main>
 */
export function SkipLink({
  href = '#main-content',
  children = 'Saltar al contenido principal',
}: SkipLinkProps) {
  return (
    <a href={href} className={styles.skipLink}>
      {children}
    </a>
  );
}

export default SkipLink;

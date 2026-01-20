import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import styles from './Card.module.css';

/**
 * Props for the Card component
 * @extends HTMLAttributes<HTMLDivElement>
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual style variant @default 'default' */
  variant?: 'default' | 'outlined' | 'elevated';
  /** Internal padding @default 'md' */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Card content */
  children: ReactNode;
}

/**
 * A container component for grouping related content.
 * Can be composed with CardHeader, CardBody, and CardFooter.
 *
 * @example
 * ```tsx
 * // Basic card
 * <Card>
 *   <p>Card content</p>
 * </Card>
 *
 * // With header and footer
 * <Card variant="elevated">
 *   <CardHeader title="Titulo" subtitle="Descripcion" />
 *   <CardBody>Contenido principal</CardBody>
 *   <CardFooter>
 *     <Button>Accion</Button>
 *   </CardFooter>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', padding = 'md', className = '', children, ...props }, ref) => {
    const cardClasses = [
      styles.card,
      styles[variant],
      styles[`padding-${padding}`],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={cardClasses} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * Props for the CardHeader component
 */
export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Title text or element */
  title?: ReactNode;
  /** Subtitle text or element */
  subtitle?: ReactNode;
  /** Action element (button, icon, etc.) aligned to the right */
  action?: ReactNode;
  /** Custom children (overrides title/subtitle/action) */
  children?: ReactNode;
}

/** Header section for Card component */
export function CardHeader({
  title,
  subtitle,
  action,
  children,
  className = '',
  ...props
}: CardHeaderProps) {
  if (children) {
    return (
      <div className={`${styles.header} ${className}`} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div className={`${styles.header} ${className}`} {...props}>
      <div className={styles.headerContent}>
        {title && <h3 className={styles.title}>{title}</h3>}
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      {action && <div className={styles.headerAction}>{action}</div>}
    </div>
  );
}

/** Props for the CardBody component */
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Main content section for Card component */
export function CardBody({ children, className = '', ...props }: CardBodyProps) {
  return (
    <div className={`${styles.body} ${className}`} {...props}>
      {children}
    </div>
  );
}

/** Props for the CardFooter component */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  /** Horizontal alignment of footer content @default 'right' */
  align?: 'left' | 'center' | 'right' | 'between';
}

/** Footer section for Card component, typically for action buttons */
export function CardFooter({
  children,
  align = 'right',
  className = '',
  ...props
}: CardFooterProps) {
  return (
    <div className={`${styles.footer} ${styles[`align-${align}`]} ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;

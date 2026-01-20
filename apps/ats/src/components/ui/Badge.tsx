import { type HTMLAttributes, type ReactNode } from 'react';
import styles from './Badge.module.css';

/** Available badge color variants */
export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

/** Available badge sizes */
export type BadgeSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Badge component
 * @extends HTMLAttributes<HTMLSpanElement>
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Color variant of the badge @default 'default' */
  variant?: BadgeVariant;
  /** Size of the badge @default 'md' */
  size?: BadgeSize;
  /** Renders the badge with fully rounded corners @default false */
  pill?: boolean;
  /** Shows a small dot indicator before the content @default false */
  dot?: boolean;
  /** Icon to display before the content */
  icon?: ReactNode;
  /** Badge content */
  children?: ReactNode;
}

/**
 * A small status indicator component for labeling and categorizing items.
 *
 * @example
 * ```tsx
 * // Basic badge
 * <Badge>Default</Badge>
 *
 * // Colored variants
 * <Badge variant="success">Activo</Badge>
 * <Badge variant="error">Error</Badge>
 *
 * // With dot indicator
 * <Badge variant="warning" dot>Pendiente</Badge>
 *
 * // Pill style
 * <Badge variant="primary" pill>Nuevo</Badge>
 * ```
 */
export function Badge({
  variant = 'default',
  size = 'md',
  pill = false,
  dot = false,
  icon,
  children,
  className = '',
  ...props
}: BadgeProps) {
  const badgeClasses = [
    styles.badge,
    styles[variant],
    styles[size],
    pill && styles.pill,
    dot && styles.dot,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (dot) {
    return (
      <span className={badgeClasses} {...props}>
        <span className={styles.dotIndicator} />
        {children}
      </span>
    );
  }

  return (
    <span className={badgeClasses} {...props}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {children}
    </span>
  );
}

/** Predefined status types for StatusBadge */
export type StatusType = 'active' | 'inactive' | 'pending' | 'error' | 'success';

const statusConfig: Record<StatusType, { variant: BadgeVariant; label: string }> = {
  active: { variant: 'success', label: 'Activo' },
  inactive: { variant: 'default', label: 'Inactivo' },
  pending: { variant: 'warning', label: 'Pendiente' },
  error: { variant: 'error', label: 'Error' },
  success: { variant: 'success', label: 'Completado' },
};

/**
 * A preset Badge component for common status indicators.
 *
 * @example
 * ```tsx
 * <StatusBadge status="active" />
 * <StatusBadge status="pending" label="En proceso" />
 * ```
 */
export function StatusBadge({
  status,
  label,
  ...props
}: { status: StatusType; label?: string } & Omit<BadgeProps, 'variant' | 'children'>) {
  const config = statusConfig[status];
  return (
    <Badge variant={config.variant} dot {...props}>
      {label || config.label}
    </Badge>
  );
}

export default Badge;

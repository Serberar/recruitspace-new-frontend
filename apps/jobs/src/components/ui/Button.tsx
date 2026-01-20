import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import styles from './Button.module.css';

/** Available button style variants */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'link';

/** Available button sizes */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Button component
 * @extends ButtonHTMLAttributes<HTMLButtonElement>
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style variant of the button @default 'primary' */
  variant?: ButtonVariant;
  /** Size of the button @default 'md' */
  size?: ButtonSize;
  /** Shows a loading spinner and disables the button @default false */
  loading?: boolean;
  /** Makes the button take full width of its container @default false */
  fullWidth?: boolean;
  /** Icon to display on the left side of the label */
  leftIcon?: ReactNode;
  /** Icon to display on the right side of the label */
  rightIcon?: ReactNode;
  /** Button label content */
  children: ReactNode;
}

/**
 * A versatile button component with multiple variants, sizes, and states.
 *
 * @example
 * ```tsx
 * // Primary button
 * <Button variant="primary">Click me</Button>
 *
 * // With loading state
 * <Button loading>Saving...</Button>
 *
 * // With icons
 * <Button leftIcon={<PlusIcon />}>Add item</Button>
 *
 * // Danger variant
 * <Button variant="danger">Delete</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    const classNames = [
      styles.button,
      styles[variant],
      styles[size],
      fullWidth ? styles.fullWidth : '',
      loading ? styles.loading : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        type={type}
        className={classNames}
        disabled={isDisabled}
        aria-busy={loading}
        aria-disabled={isDisabled}
        {...props}
      >
        {loading && (
          <span className={styles.spinner} aria-hidden="true" />
        )}
        {!loading && leftIcon && (
          <span className={styles.icon} aria-hidden="true">{leftIcon}</span>
        )}
        <span className={styles.label}>{children}</span>
        {!loading && rightIcon && (
          <span className={styles.icon} aria-hidden="true">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;

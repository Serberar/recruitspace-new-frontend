import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react';
import styles from './Input.module.css';

/**
 * Props for the Input component
 * @extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>
 */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label text displayed above the input */
  label?: string;
  /** Error message to display below the input */
  error?: string;
  /** Hint text displayed below the input (hidden when error is present) */
  hint?: string;
  /** Shows a required indicator (*) next to the label */
  required?: boolean;
  /** Size of the input field @default 'md' */
  size?: 'sm' | 'md' | 'lg';
  /** Icon to display on the left side of the input */
  leftIcon?: ReactNode;
  /** Icon to display on the right side of the input */
  rightIcon?: ReactNode;
  /** Makes the input take full width of its container @default true */
  fullWidth?: boolean;
}

/**
 * An accessible input component with label, error handling, and icon support.
 *
 * @example
 * ```tsx
 * // Basic input with label
 * <Input label="Email" type="email" placeholder="tu@email.com" />
 *
 * // With error message
 * <Input label="Password" type="password" error="La contrasena es requerida" />
 *
 * // With hint
 * <Input label="Username" hint="Minimo 3 caracteres" />
 *
 * // With icons
 * <Input leftIcon={<SearchIcon />} placeholder="Buscar..." />
 * ```
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      required,
      size = 'md',
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = '',
      id: providedId,
      'aria-describedby': ariaDescribedBy,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;

    const describedBy = [
      error ? errorId : null,
      hint ? hintId : null,
      ariaDescribedBy,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    const inputClassNames = [
      styles.input,
      styles[size],
      error ? styles.inputError : '',
      leftIcon ? styles.hasLeftIcon : '',
      rightIcon ? styles.hasRightIcon : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={`${styles.field} ${fullWidth ? styles.fullWidth : ''}`}>
        {label && (
          <label htmlFor={id} className={styles.label}>
            {label}
            {required && <span className={styles.required} aria-hidden="true"> *</span>}
          </label>
        )}
        <div className={styles.inputWrapper}>
          {leftIcon && (
            <span className={styles.leftIcon} aria-hidden="true">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={inputClassNames}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            aria-required={required}
            {...props}
          />
          {rightIcon && (
            <span className={styles.rightIcon} aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </div>
        {error && (
          <span id={errorId} className={styles.error} role="alert">
            {error}
          </span>
        )}
        {hint && !error && (
          <span id={hintId} className={styles.hint}>
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

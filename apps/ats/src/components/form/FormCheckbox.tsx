import { type InputHTMLAttributes } from 'react';
import { useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';
import styles from './FormCheckbox.module.css';

export interface FormCheckboxProps<T extends FieldValues>
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'type'> {
  name: FieldPath<T>;
  label: string;
  description?: string;
}

export function FormCheckbox<T extends FieldValues>({
  name,
  label,
  description,
  className = '',
  ...props
}: FormCheckboxProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;
  const id = `checkbox-${name}`;

  return (
    <div className={`${styles.container} ${className}`}>
      <label htmlFor={id} className={styles.label}>
        <input
          id={id}
          type="checkbox"
          className={styles.checkbox}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? `${id}-error` : description ? `${id}-desc` : undefined}
          {...register(name)}
          {...props}
        />
        <span className={styles.checkmark} aria-hidden="true" />
        <span className={styles.labelText}>
          {label}
          {description && (
            <span id={`${id}-desc`} className={styles.description}>
              {description}
            </span>
          )}
        </span>
      </label>
      {errorMessage && (
        <span id={`${id}-error`} className={styles.errorText} role="alert">
          {errorMessage}
        </span>
      )}
    </div>
  );
}

export default FormCheckbox;

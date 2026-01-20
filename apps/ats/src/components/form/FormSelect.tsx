import { type SelectHTMLAttributes } from 'react';
import { useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';
import styles from './FormSelect.module.css';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FormSelectProps<T extends FieldValues>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'name'> {
  name: FieldPath<T>;
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  hint?: string;
}

export function FormSelect<T extends FieldValues>({
  name,
  label,
  options,
  placeholder = 'Seleccionar...',
  hint,
  className = '',
  required,
  ...props
}: FormSelectProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;
  const id = `select-${name}`;

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <select
        id={id}
        className={`${styles.select} ${errorMessage ? styles.error : ''} ${className}`}
        aria-invalid={!!errorMessage}
        aria-describedby={errorMessage ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...register(name)}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
      {errorMessage && (
        <span id={`${id}-error`} className={styles.errorText} role="alert">
          {errorMessage}
        </span>
      )}
      {!errorMessage && hint && (
        <span id={`${id}-hint`} className={styles.hint}>
          {hint}
        </span>
      )}
    </div>
  );
}

export default FormSelect;

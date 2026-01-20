import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';
import styles from './FormTextarea.module.css';

export interface FormTextareaProps<T extends FieldValues>
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'name'> {
  name: FieldPath<T>;
  label?: string;
  hint?: string;
}

function FormTextareaInner<T extends FieldValues>(
  { name, label, hint, className = '', required, ...props }: FormTextareaProps<T>,
  ref: React.ForwardedRef<HTMLTextAreaElement>
) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;
  const id = `textarea-${name}`;

  const { ref: registerRef, ...registerProps } = register(name);

  return (
    <div className={styles.container}>
      {label && (
        <label htmlFor={id} className={styles.label}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}
      <textarea
        id={id}
        ref={(e) => {
          registerRef(e);
          if (typeof ref === 'function') ref(e);
          else if (ref) ref.current = e;
        }}
        className={`${styles.textarea} ${errorMessage ? styles.error : ''} ${className}`}
        aria-invalid={!!errorMessage}
        aria-describedby={errorMessage ? `${id}-error` : hint ? `${id}-hint` : undefined}
        {...registerProps}
        {...props}
      />
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

export const FormTextarea = forwardRef(FormTextareaInner) as <T extends FieldValues>(
  props: FormTextareaProps<T> & { ref?: React.ForwardedRef<HTMLTextAreaElement> }
) => React.ReactNode;

export default FormTextarea;

/* eslint-disable react-refresh/only-export-components */
import { type ReactNode, type FormHTMLAttributes } from 'react';
import {
  useForm,
  FormProvider,
  type UseFormReturn,
  type FieldValues,
  type DefaultValues,
  type SubmitHandler,
  type SubmitErrorHandler,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type z } from 'zod';
import styles from './Form.module.css';

export interface FormProps<T extends FieldValues>
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onError' | 'children'> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: z.ZodType<T, any, any>;
  defaultValues?: DefaultValues<T>;
  onSubmit: SubmitHandler<T>;
  onError?: SubmitErrorHandler<T>;
  children: ReactNode | ((methods: UseFormReturn<T>) => ReactNode);
  resetOnSuccess?: boolean;
}

export function Form<T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  onError,
  children,
  resetOnSuccess = false,
  className = '',
  ...props
}: FormProps<T>) {
  const methods = useForm<T>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    defaultValues,
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const handleSubmit: SubmitHandler<T> = async (data) => {
    await onSubmit(data);
    if (resetOnSuccess) {
      methods.reset();
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        className={`${styles.form} ${className}`}
        onSubmit={methods.handleSubmit(handleSubmit, onError)}
        noValidate
        {...props}
      >
        {typeof children === 'function' ? children(methods) : children}
      </form>
    </FormProvider>
  );
}

// Hook to use form context in nested components
export { useFormContext, useWatch, useController } from 'react-hook-form';
export type { UseFormReturn, FieldValues };

export default Form;

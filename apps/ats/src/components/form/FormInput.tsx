import { useFormContext, type FieldPath, type FieldValues } from 'react-hook-form';
import { Input, type InputProps } from '../ui/Input';

export interface FormInputProps<T extends FieldValues>
  extends Omit<InputProps, 'name' | 'error'> {
  name: FieldPath<T>;
}

export function FormInput<T extends FieldValues>({
  name,
  ...props
}: FormInputProps<T>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<T>();

  const error = errors[name];
  const errorMessage = error?.message as string | undefined;

  return (
    <Input
      {...register(name)}
      error={errorMessage}
      {...props}
    />
  );
}

export default FormInput;

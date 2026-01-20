import { z } from 'zod';

/**
 * Schema de password estándar - REF-3
 * Todas las validaciones de password deben usar este schema
 * Sincronizado con backend: 12 caracteres + mayuscula + minuscula + numero + simbolo
 */
export const passwordSchema = z
  .string()
  .min(1, 'La contrasena es requerida')
  .min(12, 'La contrasena debe tener al menos 12 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayuscula')
  .regex(/[a-z]/, 'Debe contener al menos una minuscula')
  .regex(/[0-9]/, 'Debe contener al menos un numero')
  .regex(/[^A-Za-z0-9]/, 'Debe contener al menos un simbolo especial (!@#$%^&*...)');

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Email no valido'),
  password: z
    .string()
    .min(1, 'La contrasena es requerida'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email no valido'),
  password: passwordSchema,
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contrasena'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email no valido'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contrasena'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
});

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Schema para registro de usuario con organización
export const registerSchema2 = z.object({
  type: z.enum(['recruiter', 'org_admin']),
  organizationName: z
    .string()
    .min(2, 'El nombre de la organizacion debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la organizacion no puede exceder 100 caracteres'),
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email no valido'),
  password: passwordSchema,
  confirmPassword: z
    .string()
    .min(1, 'Confirma tu contrasena'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contrasenas no coinciden',
  path: ['confirmPassword'],
});

export type RegisterFormData2 = z.infer<typeof registerSchema2>;

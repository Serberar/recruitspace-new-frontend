import { z } from 'zod';

// Schema para portal settings - las imágenes se manejan por upload separado
export const portalSettingsSchema = z.object({
  domain: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(val),
      'Solo letras minusculas, numeros y guiones'
    ),
  portalTitle: z
    .string()
    .max(100, 'El titulo no puede exceder 100 caracteres')
    .optional(),
  portalSubtitle: z
    .string()
    .max(200, 'La frase no puede exceder 200 caracteres')
    .optional(),
  useBrandingOnCandidatePage: z.boolean().optional(),
  candidatePageTitle: z
    .string()
    .max(100, 'El titulo no puede exceder 100 caracteres')
    .optional(),
  candidatePageSubtitle: z
    .string()
    .max(200, 'La frase no puede exceder 200 caracteres')
    .optional(),
});

export type PortalSettingsFormData = z.infer<typeof portalSettingsSchema>;

export const teamInviteSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email no valido'),
  role: z.enum(['org_admin', 'recruiter', 'org_recruiter'], {
    message: 'Selecciona un rol valido',
  }),
});

export type TeamInviteFormData = z.infer<typeof teamInviteSchema>;

export const createRecruiterSchema = z.object({
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
  password: z
    .string()
    .min(12, 'Minimo 12 caracteres'),
});

export type CreateRecruiterFormData = z.infer<typeof createRecruiterSchema>;

// Schema para editar recruiter (password opcional)
export const editRecruiterSchema = z.object({
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
  password: z
    .string()
    .min(12, 'Minimo 12 caracteres')
    .optional()
    .or(z.literal('')),
});

export type EditRecruiterFormData = z.infer<typeof editRecruiterSchema>;

export const smtpSettingsSchema = z.object({
  host: z
    .string()
    .min(1, 'El host es requerido'),
  port: z
    .number()
    .min(1, 'El puerto es requerido')
    .max(65535, 'Puerto no valido'),
  user: z
    .string()
    .min(1, 'El usuario es requerido'),
  password: z
    .string()
    .min(1, 'La contrasena es requerida'),
  fromEmail: z
    .string()
    .min(1, 'El email de envio es requerido')
    .email('Email no valido'),
  fromName: z
    .string()
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  secure: z.boolean().default(true),
});

export type SmtpSettingsFormData = z.infer<typeof smtpSettingsSchema>;

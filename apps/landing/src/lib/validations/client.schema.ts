import { z } from 'zod';

// Schema simple para el modal de creacion/edicion rapida
export const clientSimpleSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  contact: z
    .string()
    .max(100, 'El nombre de contacto no puede exceder 100 caracteres')
    .optional(),
  email: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      'Email no valido'
    ),
  phone: z
    .string()
    .max(20, 'El telefono no puede exceder 20 caracteres')
    .optional(),
});

export type ClientSimpleFormData = z.infer<typeof clientSimpleSchema>;

// Schema completo para el formulario de cliente detallado
export const clientSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  industry: z
    .string()
    .max(50, 'La industria no puede exceder 50 caracteres')
    .optional(),
  website: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^https?:\/\//.test(val),
      'URL no valida (debe comenzar con http:// o https://)'
    ),
  contactName: z
    .string()
    .max(100, 'El nombre de contacto no puede exceder 100 caracteres')
    .optional(),
  contactEmail: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      'Email no valido'
    ),
  contactPhone: z
    .string()
    .max(20, 'El telefono no puede exceder 20 caracteres')
    .optional(),
  notes: z
    .string()
    .max(2000, 'Las notas no pueden exceder 2000 caracteres')
    .optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export const clientFilterSchema = z.object({
  search: z.string().optional(),
  active: z.boolean().optional(),
});

export type ClientFilterData = z.infer<typeof clientFilterSchema>;

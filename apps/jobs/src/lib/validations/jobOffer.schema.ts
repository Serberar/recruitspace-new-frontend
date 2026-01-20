import { z } from 'zod';

export const jobOfferSchema = z.object({
  title: z
    .string()
    .min(1, 'El titulo es requerido')
    .max(100, 'El titulo no puede exceder 100 caracteres'),
  description: z
    .string()
    .min(10, 'La descripcion debe tener al menos 10 caracteres')
    .max(10000, 'La descripcion no puede exceder 10000 caracteres'),
  requirements: z
    .string()
    .max(5000, 'Los requisitos no pueden exceder 5000 caracteres')
    .optional(),
  benefits: z
    .string()
    .max(5000, 'Los beneficios no pueden exceder 5000 caracteres')
    .optional(),
  location: z
    .string()
    .max(100, 'La ubicacion no puede exceder 100 caracteres')
    .optional(),
  salary: z
    .string()
    .max(50, 'El salario no puede exceder 50 caracteres')
    .optional(),
  modality: z
    .enum(['onsite', 'remote', 'hybrid'], {
      message: 'Selecciona una modalidad valida',
    })
    .optional(),
  clientId: z
    .string()
    .min(1, 'El cliente es requerido'),
  category: z
    .string()
    .max(50, 'La categoria no puede exceder 50 caracteres')
    .optional(),
  contractType: z
    .string()
    .max(50, 'El tipo de contrato no puede exceder 50 caracteres')
    .optional(),
  isPublic: z.boolean().optional(),
  salaryPublic: z.boolean().optional(),
  active: z.boolean().optional(),
  publicDisplayName: z
    .string()
    .max(100, 'El nombre publico no puede exceder 100 caracteres')
    .optional(),
});

export type JobOfferFormData = z.infer<typeof jobOfferSchema>;

export const jobOfferFilterSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['active', 'paused', 'closed']).optional(),
  clientId: z.string().optional(),
  modality: z.enum(['onsite', 'remote', 'hybrid']).optional(),
});

export type JobOfferFilterData = z.infer<typeof jobOfferFilterSchema>;

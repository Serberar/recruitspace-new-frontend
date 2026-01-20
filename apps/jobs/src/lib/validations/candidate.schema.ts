import { z } from 'zod';

// File validation helper
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_CV_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export const candidateApplicationSchema = z.object({
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
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^[\d\s+()-]{6,20}$/.test(val), {
      message: 'Numero de telefono no valido',
    }),
  cv: z
    .custom<File>()
    .refine((file) => file instanceof File, 'El CV es requerido')
    .refine((file) => file.size <= MAX_FILE_SIZE, 'El archivo no puede superar 10MB')
    .refine(
      (file) => ACCEPTED_CV_TYPES.includes(file.type),
      'Solo se permiten archivos PDF o DOCX'
    ),
});

export type CandidateApplicationFormData = z.infer<typeof candidateApplicationSchema>;

export const candidateProfileSchema = z.object({
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
  phone: z
    .string()
    .optional(),
  linkedinUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.includes('linkedin.com'),
      'URL de LinkedIn no valida'
    ),
  portfolioUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^https?:\/\//.test(val),
      'URL no valida'
    ),
  summary: z
    .string()
    .max(1000, 'El resumen no puede exceder 1000 caracteres')
    .optional(),
});

export type CandidateProfileFormData = z.infer<typeof candidateProfileSchema>;

export const candidateNoteSchema = z.object({
  content: z
    .string()
    .min(1, 'El contenido es requerido')
    .max(5000, 'El contenido no puede exceder 5000 caracteres'),
});

export type CandidateNoteFormData = z.infer<typeof candidateNoteSchema>;

// Schema para el portal de candidatos (edicion de perfil propio)
export const candidatePortalProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(50, 'El nombre no puede exceder 50 caracteres'),
  lastName: z
    .string()
    .min(1, 'El apellido es requerido')
    .max(50, 'El apellido no puede exceder 50 caracteres'),
  phone: z
    .string()
    .optional(),
  experience: z
    .string()
    .max(5000, 'La experiencia no puede exceder 5000 caracteres')
    .optional(),
});

export type CandidatePortalProfileFormData = z.infer<typeof candidatePortalProfileSchema>;

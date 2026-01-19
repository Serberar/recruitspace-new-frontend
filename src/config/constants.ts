
// Roles de usuario
export const USER_ROLES = {
  ORG_ADMIN: 'org_admin',
  RECRUITER: 'recruiter',
  ORG_RECRUITER: 'org_recruiter',
  CANDIDATE: 'candidate',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.ORG_ADMIN]: 'Administrador',
  [USER_ROLES.RECRUITER]: 'Reclutador',
  [USER_ROLES.ORG_RECRUITER]: 'Reclutador de Organizacion',
  [USER_ROLES.CANDIDATE]: 'Candidato',
};

// Estados de procesos de seleccion
export const PROCESS_STATUS = {
  NEW: 'new',
  SCREENING: 'screening',
  INTERVIEW: 'interview',
  TECHNICAL: 'technical',
  OFFER: 'offer',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
} as const;

export type ProcessStatus = (typeof PROCESS_STATUS)[keyof typeof PROCESS_STATUS];

export const PROCESS_STATUS_LABELS: Record<ProcessStatus, string> = {
  [PROCESS_STATUS.NEW]: 'Nuevo',
  [PROCESS_STATUS.SCREENING]: 'Screening',
  [PROCESS_STATUS.INTERVIEW]: 'Entrevista',
  [PROCESS_STATUS.TECHNICAL]: 'Prueba Tecnica',
  [PROCESS_STATUS.OFFER]: 'Oferta',
  [PROCESS_STATUS.HIRED]: 'Contratado',
  [PROCESS_STATUS.REJECTED]: 'Rechazado',
  [PROCESS_STATUS.WITHDRAWN]: 'Retirado',
};

export const PROCESS_STATUS_COLORS: Record<ProcessStatus, string> = {
  [PROCESS_STATUS.NEW]: '#3b82f6',
  [PROCESS_STATUS.SCREENING]: '#8b5cf6',
  [PROCESS_STATUS.INTERVIEW]: '#f59e0b',
  [PROCESS_STATUS.TECHNICAL]: '#6366f1',
  [PROCESS_STATUS.OFFER]: '#10b981',
  [PROCESS_STATUS.HIRED]: '#22c55e',
  [PROCESS_STATUS.REJECTED]: '#ef4444',
  [PROCESS_STATUS.WITHDRAWN]: '#6b7280',
};

// Modalidades de trabajo
export const WORK_MODALITY = {
  ON_SITE: 'on_site',
  REMOTE: 'remote',
  HYBRID: 'hybrid',
} as const;

export type WorkModality = (typeof WORK_MODALITY)[keyof typeof WORK_MODALITY];

export const MODALITY_LABELS: Record<WorkModality, string> = {
  [WORK_MODALITY.ON_SITE]: 'Presencial',
  [WORK_MODALITY.REMOTE]: 'Remoto',
  [WORK_MODALITY.HYBRID]: 'Hibrido',
};

// Estados de ofertas
export const OFFER_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  CLOSED: 'closed',
} as const;

export type OfferStatus = (typeof OFFER_STATUS)[keyof typeof OFFER_STATUS];

export const OFFER_STATUS_LABELS: Record<OfferStatus, string> = {
  [OFFER_STATUS.ACTIVE]: 'Activa',
  [OFFER_STATUS.PAUSED]: 'Pausada',
  [OFFER_STATUS.CLOSED]: 'Cerrada',
};

// Limites de paginacion
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 25, 50, 100] as const,
  MAX_PAGE_SIZE: 100,
} as const;

// Limites de archivos
export const FILE_LIMITS = {
  MAX_CV_SIZE_MB: 10,
  MAX_CV_SIZE_BYTES: 10 * 1024 * 1024,
  ACCEPTED_CV_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ACCEPTED_CV_EXTENSIONS: ['.pdf', '.docx'],
  MAX_IMAGE_SIZE_MB: 5,
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
} as const;

// Tiempos (en milisegundos)
export const TIMEOUTS = {
  TOAST_DURATION: 4000,
  DEBOUNCE_SEARCH: 300,
  API_TIMEOUT: 30000,
  SESSION_CHECK_INTERVAL: 60000,
} as const;

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  GENERIC: 'Ha ocurrido un error inesperado',
  NETWORK: 'Error de conexion. Verifica tu internet.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta accion',
  NOT_FOUND: 'El recurso solicitado no existe',
  VALIDATION: 'Por favor, revisa los campos del formulario',
  SESSION_EXPIRED: 'Tu sesion ha expirado. Por favor, inicia sesion de nuevo.',
  FILE_TOO_LARGE: 'El archivo es demasiado grande',
  INVALID_FILE_TYPE: 'Tipo de archivo no permitido',
} as const;

// Mensajes de exito comunes
export const SUCCESS_MESSAGES = {
  SAVED: 'Cambios guardados correctamente',
  CREATED: 'Creado correctamente',
  UPDATED: 'Actualizado correctamente',
  DELETED: 'Eliminado correctamente',
  SENT: 'Enviado correctamente',
} as const;

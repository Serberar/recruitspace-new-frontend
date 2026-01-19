
// Rutas publicas
export const PUBLIC_ROUTES = {
  LOGIN: '/login',
  UNAUTHORIZED: '/unauthorized',
  JOBS: '/jobs',
  JOB_DETAIL: '/jobs/:jobId',
  JOB_APPLY: '/jobs/:jobId/apply',
  ORG_JOBS: '/org/:orgSlug/jobs',
  ORG_JOB_DETAIL: '/org/:orgSlug/jobs/:jobId',
  ORG_JOB_APPLY: '/org/:orgSlug/jobs/:jobId/apply',
  CANDIDATE_PROCESS: '/candidate/process/:publicToken',
} as const;

// Rutas privadas (app)
export const APP_ROUTES = {
  DASHBOARD: '/app/dashboard',
  // Ofertas
  OFFERS: '/app/offers',
  OFFER_CREATE: '/app/offers/create',
  OFFER_DETAIL: '/app/offers/:id',
  // Clientes
  CLIENTS: '/app/clients',
  CLIENT_DETAIL: '/app/clients/:id',
  // Candidatos
  CANDIDATE_DETAIL: '/app/candidates/:id',
  // Equipo
  TEAM: '/app/team',
  // Settings
  SETTINGS_PIPELINE: '/app/settings/pipeline',
  SETTINGS_EMAIL_TEMPLATES: '/app/settings/email-templates',
  SETTINGS_SMTP: '/app/settings/smtp',
  SETTINGS_ORGANIZATION: '/app/settings/organization',
  SETTINGS_PROFILE: '/app/settings/profile',
  // Admin
  ADMIN: '/app/admin',
} as const;

// Portal del candidato
export const PORTAL_ROUTES = {
  DASHBOARD: '/portal',
  PROFILE: '/portal/profile',
  PROCESS: '/portal/process/:processId',
} as const;

// Helpers para construir rutas con parametros
export const buildRoute = {
  jobDetail: (jobId: string) => `/jobs/${jobId}`,
  jobApply: (jobId: string) => `/jobs/${jobId}/apply`,
  orgJobs: (orgSlug: string) => `/org/${orgSlug}/jobs`,
  orgJobDetail: (orgSlug: string, jobId: string) => `/org/${orgSlug}/jobs/${jobId}`,
  orgJobApply: (orgSlug: string, jobId: string) => `/org/${orgSlug}/jobs/${jobId}/apply`,
  candidateProcess: (token: string) => `/candidate/process/${token}`,
  offerDetail: (id: string) => `/app/offers/${id}`,
  clientDetail: (id: string) => `/app/clients/${id}`,
  candidateDetail: (id: string) => `/app/candidates/${id}`,
  portalProcess: (processId: string) => `/portal/process/${processId}`,
} as const;

// Rutas que no requieren autenticacion
export const UNAUTHENTICATED_ROUTES = [
  PUBLIC_ROUTES.LOGIN,
  PUBLIC_ROUTES.UNAUTHORIZED,
  PUBLIC_ROUTES.JOBS,
  '/jobs/', // para rutas dinamicas
  '/org/',  // para rutas de organizacion
  '/candidate/process/', // para proceso publico
] as const;

// Rutas por rol
export const ROLE_DEFAULT_ROUTES = {
  admin: APP_ROUTES.ADMIN,
  recruiter: APP_ROUTES.DASHBOARD,
  org_recruiter: APP_ROUTES.DASHBOARD,
  candidate: PORTAL_ROUTES.DASHBOARD,
} as const;

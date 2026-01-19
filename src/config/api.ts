
// Base URL del API
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Endpoints del API
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    INVITE: '/users/invite',
  },

  // Clients
  CLIENTS: {
    BASE: '/clients',
    BY_ID: (id: string) => `/clients/${id}`,
    ASSIGN_RECRUITER: (id: string) => `/clients/${id}/recruiter`,
  },

  // Job Offers
  JOB_OFFERS: {
    BASE: '/job-offers',
    BY_ID: (id: string) => `/job-offers/${id}`,
    STATUS: (id: string) => `/job-offers/${id}/status`,
    CANDIDATES: (id: string) => `/job-offers/${id}/candidates`,
  },

  // Candidates
  CANDIDATES: {
    BASE: '/candidates',
    BY_ID: (id: string) => `/candidates/${id}`,
    NOTES: (id: string) => `/candidates/${id}/notes`,
    DOCUMENTS: (id: string) => `/candidates/${id}/documents`,
  },

  // Selection Process
  SELECTION_PROCESS: {
    BASE: '/selection-process',
    BY_ID: (id: string) => `/selection-process/${id}`,
    STATUS: (id: string) => `/selection-process/${id}/status`,
    TIMELINE: (id: string) => `/selection-process/${id}/timeline`,
  },

  // Pipeline
  PIPELINE: {
    STAGES: '/pipeline/stages',
    STAGE_BY_ID: (id: string) => `/pipeline/stages/${id}`,
    REORDER: '/pipeline/stages/reorder',
  },

  // Email Templates
  EMAIL_TEMPLATES: {
    BASE: '/email-templates',
    BY_ID: (id: string) => `/email-templates/${id}`,
    SEND_TEST: (id: string) => `/email-templates/${id}/test`,
  },

  // Organization
  ORGANIZATION: {
    SETTINGS: '/organization/settings',
    SMTP: '/organization/smtp',
    SMTP_TEST: '/organization/smtp/test',
  },

  // Security
  SECURITY: {
    SESSIONS: '/security/sessions',
    SESSION_BY_ID: (id: string) => `/security/sessions/${id}`,
  },

  // Public
  PUBLIC: {
    JOB_OFFERS: '/public/job-offers',
    JOB_OFFER_BY_ID: (id: string) => `/public/job-offers/${id}`,
    ORGANIZATION: (slug: string) => `/public/organizations/${slug}`,
    ORG_JOB_OFFERS: (slug: string) => `/public/organizations/${slug}/job-offers`,
    APPLY: (jobId: string) => `/public/job-offers/${jobId}/apply`,
  },

  // Candidate Portal
  PORTAL: {
    DASHBOARD: '/portal/dashboard',
    PROFILE: '/portal/profile',
    PROCESSES: '/portal/processes',
    PROCESS_BY_ID: (id: string) => `/portal/processes/${id}`,
  },

  // Admin
  ADMIN: {
    STATS: '/admin/stats',
    ACTIVITY: '/admin/activity',
  },
} as const;

// Headers por defecto
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
} as const;

// Codigos de error HTTP
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

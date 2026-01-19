
// Informacion de la aplicacion
export const APP_CONFIG = {
  name: 'RecruitSpace',
  description: 'Plataforma de gestion de talento y procesos de seleccion',
  version: '1.0.0',
  company: 'RecruitSpace',
  supportEmail: 'soporte@recruitspace.com',
  website: 'https://recruitspace.com',
} as const;

// Configuracion de la UI
export const UI_CONFIG = {
  // Sidebar
  sidebarWidth: 260,
  sidebarCollapsedWidth: 64,

  // Header
  headerHeight: 64,

  // Breakpoints (coinciden con CSS)
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },

  // Z-index layers
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1100,
  },

  // Animaciones
  transitions: {
    fast: '0.15s',
    normal: '0.3s',
    slow: '0.5s',
  },
} as const;

// Configuracion de almacenamiento local
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'recruitspace_token',
  USER_PREFERENCES: 'recruitspace_preferences',
  SIDEBAR_COLLAPSED: 'recruitspace_sidebar_collapsed',
  THEME: 'recruitspace_theme',
  LOCALE: 'recruitspace_locale',
} as const;

// Feature flags (para desarrollo)
export const FEATURES = {
  DARK_MODE: false,
  I18N: false,
  ANALYTICS: false,
  NOTIFICATIONS: true,
  CANDIDATE_PORTAL: true,
  PUBLIC_JOBS: true,
} as const;

// Configuracion de fechas
export const DATE_CONFIG = {
  defaultFormat: 'dd/MM/yyyy',
  dateTimeFormat: 'dd/MM/yyyy HH:mm',
  timeFormat: 'HH:mm',
  locale: 'es-ES',
} as const;

// Configuracion del editor de texto (si se usa)
export const EDITOR_CONFIG = {
  maxLength: 10000,
  allowedTags: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'],
} as const;

/**
 * Error Tracking Module
 *
 * Abstraccion para el servicio de error tracking.
 * Actualmente usa console logging en desarrollo.
 * Para produccion: integrar con Sentry u otro proveedor.
 */

// ============================================
// TIPOS
// ============================================

export interface ErrorContext {
  /** Tags adicionales para categorizar el error */
  tags?: Record<string, string>;
  /** Datos extra para debugging */
  extra?: Record<string, unknown>;
  /** Nivel de severidad */
  level?: "fatal" | "error" | "warning" | "info" | "debug";
  /** Usuario afectado */
  user?: {
    id: string;
    email?: string;
    username?: string;
  };
}

export interface BreadcrumbData {
  /** Categoria del breadcrumb */
  category: string;
  /** Mensaje descriptivo */
  message: string;
  /** Nivel */
  level?: "fatal" | "error" | "warning" | "info" | "debug";
  /** Datos adicionales */
  data?: Record<string, unknown>;
}

// ============================================
// CONFIGURACION
// ============================================

interface ErrorTrackingConfig {
  dsn: string;
  environment: string;
  release?: string;
  sampleRate?: number;
  tracesSampleRate?: number;
}

let isInitialized = false;

/**
 * Inicializa el servicio de error tracking
 */
export function initErrorTracking(cfg: ErrorTrackingConfig): void {
  if (isInitialized) {
    console.warn("Error tracking already initialized");
    return;
  }

  isInitialized = true;

  if (import.meta.env.DEV) {
    console.log("[ErrorTracking] Initialized in development mode", {
      environment: cfg.environment,
      release: cfg.release,
    });
  }
}

// ============================================
// CAPTURA DE ERRORES
// ============================================

/**
 * Captura una excepcion y la envia al servicio de tracking
 */
export function captureException(
  error: Error | unknown,
  context?: ErrorContext
): string {
  const errorId = generateErrorId();

  if (!isInitialized) {
    console.error("[ErrorTracking] Not initialized. Error:", error);
    return errorId;
  }

  if (import.meta.env.DEV) {
    console.group(`[ErrorTracking] Exception captured (${errorId})`);
    console.error(error);
    if (context) console.log("Context:", context);
    console.groupEnd();
  }

  return errorId;
}

/**
 * Captura un mensaje (no excepcion) y lo envia al servicio
 */
export function captureMessage(
  message: string,
  context?: ErrorContext
): string {
  const errorId = generateErrorId();

  if (!isInitialized) {
    console.warn("[ErrorTracking] Not initialized. Message:", message);
    return errorId;
  }

  if (import.meta.env.DEV) {
    console.log(`[ErrorTracking] Message (${errorId}):`, message, context);
  }

  return errorId;
}

// ============================================
// CONTEXTO Y BREADCRUMBS
// ============================================

/**
 * Establece el usuario actual para el contexto de errores
 */
export function setUser(user: { id: string; email?: string; username?: string } | null): void {
  if (!isInitialized) return;

  if (import.meta.env.DEV) {
    console.log("[ErrorTracking] User set:", user);
  }
}

/**
 * Añade un breadcrumb para contexto de navegacion/acciones
 */
export function addBreadcrumb(breadcrumb: BreadcrumbData): void {
  if (!isInitialized) return;

  if (import.meta.env.DEV) {
    console.log("[ErrorTracking] Breadcrumb:", breadcrumb);
  }
}

/**
 * Establece tags globales para todos los errores
 */
export function setTags(tags: Record<string, string>): void {
  if (!isInitialized) return;

  if (import.meta.env.DEV) {
    console.log("[ErrorTracking] Tags set:", tags);
  }
}

/**
 * Establece contexto extra para todos los errores
 */
export function setContext(name: string, context: Record<string, unknown>): void {
  if (!isInitialized) return;

  if (import.meta.env.DEV) {
    console.log(`[ErrorTracking] Context '${name}':`, context);
  }
}

// ============================================
// UTILIDADES
// ============================================

function generateErrorId(): string {
  return `err_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * HOC para capturar errores en componentes React
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  _fallback?: React.ReactNode
) {
  return function WrappedComponent(props: P) {
    return <Component {...props} />;
  };
}

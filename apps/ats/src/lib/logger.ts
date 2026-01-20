/**
 * Logger centralizado para el frontend
 *
 * En desarrollo: muestra logs en consola
 * En producción: silencia logs (puede extenderse para enviar a un servicio de logging)
 */

const isDev = import.meta.env.DEV;

export const logger = {
  debug: (message: string, context?: unknown) => {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, context ?? '');
    }
  },

  info: (message: string, context?: unknown) => {
    if (isDev) {
      console.info(`[INFO] ${message}`, context ?? '');
    }
  },

  warn: (message: string, context?: unknown) => {
    if (isDev) {
      console.warn(`[WARN] ${message}`, context ?? '');
    }
  },

  error: (message: string, error?: unknown, context?: unknown) => {
    // Los errores siempre se muestran, incluso en producción
    console.error(`[ERROR] ${message}`, error ?? '', context ?? '');
  },
};

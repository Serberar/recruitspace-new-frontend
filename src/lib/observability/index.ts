/**
 * Observability Module
 *
 * Proporciona herramientas para monitoreo y debugging de la aplicacion:
 *
 * - **Error Tracking**: Captura y reporta errores (Sentry-ready)
 * - **Web Vitals**: Metricas de rendimiento (Core Web Vitals)
 * - **Distributed Tracing**: Correlation IDs para tracing frontend-backend
 *
 * @example
 * ```ts
 * // Inicializacion en main.tsx
 * import {
 *   initErrorTracking,
 *   initWebVitals,
 *   onWebVital,
 *   setUser,
 * } from '@/lib/observability';
 *
 * // Error tracking
 * initErrorTracking({
 *   dsn: import.meta.env.VITE_SENTRY_DSN,
 *   environment: import.meta.env.MODE,
 * });
 *
 * // Web vitals
 * initWebVitals();
 * onWebVital((metric) => {
 *   console.log(`${metric.name}: ${metric.value}`);
 * });
 *
 * // Establecer usuario despues del login
 * setUser({ id: user.id, email: user.email });
 * ```
 */

// Error Tracking
export {
  initErrorTracking,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  setTags,
  setContext,
  withErrorBoundary,
  type ErrorContext,
  type BreadcrumbData,
} from "./errorTracking";

// Web Vitals
export {
  initWebVitals,
  stopWebVitals,
  onWebVital,
  getVitalsSummary,
  type WebVitalMetric,
  type WebVitalCallback,
} from "./webVitals";

// Distributed Tracing
export {
  generateTraceId,
  generateSpanId,
  startTrace,
  startSpan,
  endSpan,
  endTrace,
  getCurrentTraceId,
  getCurrentSpanId,
  getTraceHeaders,
  parseTraceParent,
  createTracingInterceptor,
  withTracing,
  traced,
  TRACE_HEADERS,
  type TraceContext,
  type SpanData,
} from "./tracing";

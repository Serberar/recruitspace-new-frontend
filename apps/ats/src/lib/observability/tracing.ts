/**
 * Distributed Tracing Module
 *
 * Implementa correlation IDs para tracing distribuido entre frontend y backend.
 * Permite rastrear una request desde el navegador hasta el backend.
 */

// ============================================
// TIPOS
// ============================================

export interface TraceContext {
  /** ID unico de la traza (se propaga al backend) */
  traceId: string;
  /** ID del span actual */
  spanId: string;
  /** ID del span padre (si existe) */
  parentSpanId?: string;
  /** Timestamp de inicio */
  startTime: number;
  /** Nombre de la operacion */
  operation: string;
  /** Tags adicionales */
  tags?: Record<string, string>;
}

export interface SpanData {
  /** Nombre de la operacion */
  operation: string;
  /** Tags para categorizar */
  tags?: Record<string, string>;
  /** Datos adicionales */
  data?: Record<string, unknown>;
}

// ============================================
// GENERACION DE IDs
// ============================================

/**
 * Genera un trace ID unico (formato compatible con OpenTelemetry)
 * 32 caracteres hexadecimales
 */
export function generateTraceId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Genera un span ID unico
 * 16 caracteres hexadecimales
 */
export function generateSpanId(): string {
  const array = new Uint8Array(8);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ============================================
// TRACE CONTEXT
// ============================================

let currentTraceId: string | null = null;
let currentSpanId: string | null = null;

/**
 * Inicia una nueva traza
 */
export function startTrace(operation: string, tags?: Record<string, string>): TraceContext {
  currentTraceId = generateTraceId();
  currentSpanId = generateSpanId();

  const context: TraceContext = {
    traceId: currentTraceId,
    spanId: currentSpanId,
    startTime: performance.now(),
    operation,
    tags,
  };

  if (import.meta.env.DEV) {
    console.log(`[Tracing] Started trace: ${operation}`, {
      traceId: currentTraceId,
      spanId: currentSpanId,
    });
  }

  return context;
}

/**
 * Crea un span hijo dentro de la traza actual
 */
export function startSpan(data: SpanData): TraceContext | null {
  if (!currentTraceId) {
    console.warn("[Tracing] No active trace. Call startTrace first.");
    return null;
  }

  const parentSpanId = currentSpanId;
  currentSpanId = generateSpanId();

  const context: TraceContext = {
    traceId: currentTraceId,
    spanId: currentSpanId,
    parentSpanId: parentSpanId ?? undefined,
    startTime: performance.now(),
    operation: data.operation,
    tags: data.tags,
  };

  if (import.meta.env.DEV) {
    console.log(`[Tracing] Started span: ${data.operation}`, {
      spanId: currentSpanId,
      parentSpanId,
    });
  }

  return context;
}

/**
 * Finaliza un span
 */
export function endSpan(context: TraceContext, success: boolean = true): void {
  const duration = performance.now() - context.startTime;

  if (import.meta.env.DEV) {
    console.log(`[Tracing] Ended span: ${context.operation}`, {
      duration: `${duration.toFixed(2)}ms`,
      success,
    });
  }

  // Aqui se enviaria el span al collector (ej: Sentry, Jaeger, etc.)
}

/**
 * Finaliza la traza actual
 */
export function endTrace(): void {
  if (import.meta.env.DEV && currentTraceId) {
    console.log(`[Tracing] Ended trace: ${currentTraceId}`);
  }

  currentTraceId = null;
  currentSpanId = null;
}

/**
 * Obtiene el trace ID actual (para propagacion)
 */
export function getCurrentTraceId(): string | null {
  return currentTraceId;
}

/**
 * Obtiene el span ID actual
 */
export function getCurrentSpanId(): string | null {
  return currentSpanId;
}

// ============================================
// HEADERS PARA PROPAGACION
// ============================================

/**
 * Headers estandar para propagacion de traza (W3C Trace Context)
 */
export const TRACE_HEADERS = {
  TRACE_PARENT: "traceparent",
  TRACE_STATE: "tracestate",
  // Headers custom para compatibilidad
  X_TRACE_ID: "x-trace-id",
  X_SPAN_ID: "x-span-id",
  X_CORRELATION_ID: "x-correlation-id",
} as const;

/**
 * Genera headers de tracing para una request HTTP
 *
 * @example
 * ```ts
 * const headers = getTraceHeaders();
 * fetch('/api/data', { headers });
 * ```
 */
export function getTraceHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};

  if (currentTraceId && currentSpanId) {
    // W3C Trace Context format
    // traceparent: {version}-{trace-id}-{span-id}-{trace-flags}
    headers[TRACE_HEADERS.TRACE_PARENT] = `00-${currentTraceId}-${currentSpanId}-01`;

    // Headers custom para backends que no soporten W3C
    headers[TRACE_HEADERS.X_TRACE_ID] = currentTraceId;
    headers[TRACE_HEADERS.X_SPAN_ID] = currentSpanId;
    headers[TRACE_HEADERS.X_CORRELATION_ID] = currentTraceId;
  }

  return headers;
}

/**
 * Parsea un header traceparent
 */
export function parseTraceParent(header: string): {
  traceId: string;
  spanId: string;
  sampled: boolean;
} | null {
  const match = header.match(/^00-([a-f0-9]{32})-([a-f0-9]{16})-([0-9]{2})$/);

  if (!match) return null;

  return {
    traceId: match[1],
    spanId: match[2],
    sampled: match[3] === "01",
  };
}

// ============================================
// AXIOS INTERCEPTOR
// ============================================

/**
 * Interceptor de Axios para añadir headers de tracing automaticamente
 *
 * @example
 * ```ts
 * import axios from 'axios';
 * import { createTracingInterceptor } from '@/lib/observability/tracing';
 *
 * axios.interceptors.request.use(createTracingInterceptor());
 * ```
 */
export function createTracingInterceptor() {
  return (config: { headers?: Record<string, string> }) => {
    const traceHeaders = getTraceHeaders();

    config.headers = {
      ...config.headers,
      ...traceHeaders,
    };

    return config;
  };
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Wrapper para ejecutar una funcion con tracing
 *
 * @example
 * ```ts
 * const result = await withTracing('fetchUsers', async () => {
 *   return await api.getUsers();
 * });
 * ```
 */
export async function withTracing<T>(
  operation: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>
): Promise<T> {
  const span = startSpan({ operation, tags });

  try {
    const result = await fn();
    if (span) endSpan(span, true);
    return result;
  } catch (error) {
    if (span) endSpan(span, false);
    throw error;
  }
}

/**
 * Decorator para metodos con tracing
 */
export function traced(operation?: string) {
  return function (
    target: unknown,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: unknown[]) {
      const opName = operation || `${(target as object).constructor.name}.${propertyKey}`;
      return withTracing(opName, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
}

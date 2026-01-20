/**
 * Web Vitals Module
 *
 * Metricas de rendimiento del navegador siguiendo las Core Web Vitals de Google.
 * https://web.dev/vitals/
 */

// ============================================
// TIPOS
// ============================================

export interface WebVitalMetric {
  /** Nombre de la metrica */
  name: "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";
  /** Valor de la metrica */
  value: number;
  /** Rating: good, needs-improvement, poor */
  rating: "good" | "needs-improvement" | "poor";
  /** Delta desde la ultima medicion */
  delta: number;
  /** ID unico de la metrica */
  id: string;
  /** Entries de performance relacionadas */
  entries: PerformanceEntry[];
  /** Tipo de navegacion */
  navigationType: "navigate" | "reload" | "back-forward" | "prerender";
}

export type WebVitalCallback = (metric: WebVitalMetric) => void;

// ============================================
// UMBRALES (segun Google)
// ============================================

const THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },      // Cumulative Layout Shift
  FCP: { good: 1800, poor: 3000 },     // First Contentful Paint (ms)
  FID: { good: 100, poor: 300 },       // First Input Delay (ms)
  INP: { good: 200, poor: 500 },       // Interaction to Next Paint (ms)
  LCP: { good: 2500, poor: 4000 },     // Largest Contentful Paint (ms)
  TTFB: { good: 800, poor: 1800 },     // Time to First Byte (ms)
} as const;

// ============================================
// MEDICION
// ============================================

let vitalsCallbacks: WebVitalCallback[] = [];

/**
 * Registra un callback para recibir metricas de Web Vitals
 *
 * @example
 * ```ts
 * onWebVital((metric) => {
 *   console.log(`${metric.name}: ${metric.value} (${metric.rating})`);
 *   // Enviar a analytics
 *   analytics.track('web_vital', metric);
 * });
 * ```
 */
export function onWebVital(callback: WebVitalCallback): () => void {
  vitalsCallbacks.push(callback);

  // Retorna funcion para desuscribirse
  return () => {
    vitalsCallbacks = vitalsCallbacks.filter((cb) => cb !== callback);
  };
}

/**
 * Calcula el rating basado en umbrales de Google
 */
function getRating(
  name: keyof typeof THRESHOLDS,
  value: number
): "good" | "needs-improvement" | "poor" {
  const threshold = THRESHOLDS[name];
  if (value <= threshold.good) return "good";
  if (value <= threshold.poor) return "needs-improvement";
  return "poor";
}

/**
 * Notifica a todos los callbacks registrados
 */
function reportMetric(metric: WebVitalMetric): void {
  vitalsCallbacks.forEach((callback) => {
    try {
      callback(metric);
    } catch (error) {
      console.error("[WebVitals] Error in callback:", error);
    }
  });
}

// ============================================
// OBSERVERS
// ============================================

let lcpObserver: PerformanceObserver | null = null;
let fidObserver: PerformanceObserver | null = null;
let clsObserver: PerformanceObserver | null = null;

/**
 * Inicia la medicion de Web Vitals
 *
 * @example
 * ```ts
 * // En main.tsx o App.tsx
 * initWebVitals();
 *
 * onWebVital((metric) => {
 *   sendToAnalytics(metric);
 * });
 * ```
 */
export function initWebVitals(): void {
  if (typeof window === "undefined" || !("PerformanceObserver" in window)) {
    console.warn("[WebVitals] PerformanceObserver not supported");
    return;
  }

  // Largest Contentful Paint (LCP)
  try {
    lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        startTime: number;
      };

      if (lastEntry) {
        const value = lastEntry.startTime;
        reportMetric({
          name: "LCP",
          value,
          rating: getRating("LCP", value),
          delta: value,
          id: `lcp-${Date.now()}`,
          entries,
          navigationType: getNavigationType(),
        });
      }
    });
    lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
  } catch (e) {
    console.warn("[WebVitals] LCP not supported");
  }

  // First Input Delay (FID)
  try {
    fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const firstEntry = entries[0] as PerformanceEntry & {
        processingStart: number;
        startTime: number;
      };

      if (firstEntry) {
        const value = firstEntry.processingStart - firstEntry.startTime;
        reportMetric({
          name: "FID",
          value,
          rating: getRating("FID", value),
          delta: value,
          id: `fid-${Date.now()}`,
          entries,
          navigationType: getNavigationType(),
        });
      }
    });
    fidObserver.observe({ type: "first-input", buffered: true });
  } catch (e) {
    console.warn("[WebVitals] FID not supported");
  }

  // Cumulative Layout Shift (CLS)
  try {
    let clsValue = 0;
    let clsEntries: PerformanceEntry[] = [];

    clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as (PerformanceEntry & {
        hadRecentInput: boolean;
        value: number;
      })[]) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      }
    });
    clsObserver.observe({ type: "layout-shift", buffered: true });

    // Reportar CLS al descargar la pagina
    window.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden" && clsValue > 0) {
        reportMetric({
          name: "CLS",
          value: clsValue,
          rating: getRating("CLS", clsValue),
          delta: clsValue,
          id: `cls-${Date.now()}`,
          entries: clsEntries,
          navigationType: getNavigationType(),
        });
      }
    });
  } catch (e) {
    console.warn("[WebVitals] CLS not supported");
  }

  // First Contentful Paint (FCP)
  try {
    const fcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const fcpEntry = entries.find((e) => e.name === "first-contentful-paint");

      if (fcpEntry) {
        const value = fcpEntry.startTime;
        reportMetric({
          name: "FCP",
          value,
          rating: getRating("FCP", value),
          delta: value,
          id: `fcp-${Date.now()}`,
          entries,
          navigationType: getNavigationType(),
        });
        fcpObserver.disconnect();
      }
    });
    fcpObserver.observe({ type: "paint", buffered: true });
  } catch (e) {
    console.warn("[WebVitals] FCP not supported");
  }

  // Time to First Byte (TTFB)
  try {
    const navEntry = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;

    if (navEntry) {
      const value = navEntry.responseStart - navEntry.requestStart;
      reportMetric({
        name: "TTFB",
        value,
        rating: getRating("TTFB", value),
        delta: value,
        id: `ttfb-${Date.now()}`,
        entries: [navEntry],
        navigationType: getNavigationType(),
      });
    }
  } catch (e) {
    console.warn("[WebVitals] TTFB not supported");
  }

  if (import.meta.env.DEV) {
    console.log("[WebVitals] Initialized");
  }
}

/**
 * Detiene la medicion de Web Vitals
 */
export function stopWebVitals(): void {
  lcpObserver?.disconnect();
  fidObserver?.disconnect();
  clsObserver?.disconnect();
  vitalsCallbacks = [];
}

// ============================================
// UTILIDADES
// ============================================

function getNavigationType(): WebVitalMetric["navigationType"] {
  const navEntry = performance.getEntriesByType(
    "navigation"
  )[0] as PerformanceNavigationTiming;

  if (navEntry) {
    switch (navEntry.type) {
      case "reload":
        return "reload";
      case "back_forward":
        return "back-forward";
      case "prerender":
        return "prerender";
      default:
        return "navigate";
    }
  }

  return "navigate";
}

/**
 * Obtiene un resumen de las metricas actuales
 */
export function getVitalsSummary(): Record<string, { value: number; rating: string } | null> {
  const summary: Record<string, { value: number; rating: string } | null> = {
    LCP: null,
    FID: null,
    CLS: null,
    FCP: null,
    TTFB: null,
    INP: null,
  };

  // Las metricas se actualizan via callbacks
  // Este es un placeholder para obtener el ultimo estado

  return summary;
}

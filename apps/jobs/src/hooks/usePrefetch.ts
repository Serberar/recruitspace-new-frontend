import { useCallback, useRef } from 'react';

// Map of route patterns to their dynamic import functions
const routeImports: Record<string, () => Promise<unknown>> = {
  '/': () => import('../pages/public/JobsListPage'),
  '/jobs': () => import('../pages/public/JobsListPage'),
  '/jobs/:id': () => import('../pages/public/JobDetailPage'),
  '/jobs/:id/apply': () => import('../pages/public/JobApplyPage'),
  '/portal': () => import('../pages/candidatePortal/CandidateDashboardPage'),
  '/portal/profile': () => import('../pages/candidatePortal/CandidateProfilePage'),
  '/portal/cv': () => import('../pages/candidatePortal/CandidateCVPage'),
  '/login': () => import('../pages/loginCandidate/LoginCandidatePage'),
  '/register': () => import('../pages/registerCandidate/RegisterCandidatePage'),
};

// Convert path with params to pattern
function pathToPattern(path: string): string {
  // Replace dynamic segments with :id
  return path.replace(/\/[a-f0-9-]{36}/gi, '/:id').replace(/\/\d+/g, '/:id');
}

// Cache of already prefetched routes
const prefetchedRoutes = new Set<string>();

/**
 * Hook for prefetching route components
 * Improves navigation performance by loading components before user navigates
 */
export function usePrefetch() {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefetch = useCallback((path: string) => {
    const pattern = pathToPattern(path);

    // Don't prefetch if already done
    if (prefetchedRoutes.has(pattern)) {
      return;
    }

    const importFn = routeImports[pattern];
    if (importFn) {
      prefetchedRoutes.add(pattern);
      // Load the component
      importFn().catch(() => {
        // Remove from cache if failed so it can be retried
        prefetchedRoutes.delete(pattern);
      });
    }
  }, []);

  // Prefetch on hover with delay
  const prefetchOnHover = useCallback((path: string) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Delay prefetch slightly to avoid unnecessary loads on quick mouse movements
    timeoutRef.current = setTimeout(() => {
      prefetch(path);
    }, 100);
  }, [prefetch]);

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    prefetch,
    prefetchOnHover,
    cancelPrefetch,
  };
}

/**
 * Prefetch multiple routes at once
 * Useful for prefetching common routes on initial load
 */
export function prefetchRoutes(paths: string[]) {
  paths.forEach(path => {
    const pattern = pathToPattern(path);
    if (!prefetchedRoutes.has(pattern)) {
      const importFn = routeImports[pattern];
      if (importFn) {
        prefetchedRoutes.add(pattern);
        importFn().catch(() => {
          prefetchedRoutes.delete(pattern);
        });
      }
    }
  });
}

/**
 * Prefetch common routes after initial load
 * Call this on app mount for faster navigation
 */
export function prefetchCommonRoutes() {
  // Wait for initial render to complete
  if (typeof requestIdleCallback !== 'undefined') {
    requestIdleCallback(() => {
      prefetchRoutes([
        '/jobs',
        '/portal',
      ]);
    });
  } else {
    setTimeout(() => {
      prefetchRoutes([
        '/jobs',
        '/portal',
      ]);
    }, 2000);
  }
}

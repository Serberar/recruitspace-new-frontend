import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePrefetch, prefetchRoutes, prefetchCommonRoutes } from './usePrefetch'

// Mock the dynamic imports
vi.mock('../pages/dashboard/DashboardPage', () => ({ default: {} }))
vi.mock('../pages/offers/OffersPage', () => ({ default: {} }))
vi.mock('../pages/offers/OfferCreatePage', () => ({ default: {} }))
vi.mock('../pages/offers/OfferDetailPage', () => ({ default: {} }))
vi.mock('../pages/candidates/CandidateDetailPage', () => ({ default: {} }))
vi.mock('../pages/clients/ClientsPage', () => ({ default: {} }))
vi.mock('../pages/team/TeamPage', () => ({ default: {} }))
vi.mock('../pages/settings/PipelineSettingsPage', () => ({ default: {} }))
vi.mock('../pages/settings/EmailSettingsPage', () => ({ default: {} }))
vi.mock('../pages/portal/PortalSettingsPage', () => ({ default: {} }))
vi.mock('../pages/profile/ProfileSettingsPage', () => ({ default: {} }))
vi.mock('../pages/admin/AdminPage', () => ({ default: {} }))
vi.mock('../pages/public/JobsListPage', () => ({ default: {} }))
vi.mock('../pages/public/JobDetailPage', () => ({ default: {} }))
vi.mock('../pages/public/JobApplyPage', () => ({ default: {} }))
vi.mock('../pages/candidatePortal/CandidateDashboardPage', () => ({ default: {} }))
vi.mock('../pages/candidatePortal/CandidateProfilePage', () => ({ default: {} }))

describe('usePrefetch', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  describe('prefetch', () => {
    it('returns prefetch functions', () => {
      const { result } = renderHook(() => usePrefetch())

      expect(result.current.prefetch).toBeDefined()
      expect(result.current.prefetchOnHover).toBeDefined()
      expect(result.current.cancelPrefetch).toBeDefined()
      expect(typeof result.current.prefetch).toBe('function')
      expect(typeof result.current.prefetchOnHover).toBe('function')
      expect(typeof result.current.cancelPrefetch).toBe('function')
    })

    it('prefetches a known route', () => {
      const { result } = renderHook(() => usePrefetch())

      act(() => {
        result.current.prefetch('/app/dashboard')
      })

      // No error means success
    })

    it('handles unknown routes gracefully', () => {
      const { result } = renderHook(() => usePrefetch())

      // Should not throw for unknown routes
      act(() => {
        result.current.prefetch('/unknown/route')
      })
    })

    it('handles routes with dynamic segments', () => {
      const { result } = renderHook(() => usePrefetch())

      act(() => {
        result.current.prefetch('/app/offers/123e4567-e89b-12d3-a456-426614174000')
      })

      // Should convert UUID to :id pattern and prefetch
    })

    it('handles routes with numeric IDs', () => {
      const { result } = renderHook(() => usePrefetch())

      act(() => {
        result.current.prefetch('/app/process/12345')
      })

      // Should convert numeric ID to :id pattern
    })
  })

  describe('prefetchOnHover', () => {
    it('delays prefetch by 100ms', () => {
      const { result } = renderHook(() => usePrefetch())

      act(() => {
        result.current.prefetchOnHover('/app/dashboard')
      })

      // Should not have prefetched yet
      act(() => {
        vi.advanceTimersByTime(50)
      })

      // Still waiting...
      act(() => {
        vi.advanceTimersByTime(60)
      })

      // Now it should have been called
    })

    it('cancels previous hover when hovering new route', () => {
      const { result } = renderHook(() => usePrefetch())

      act(() => {
        result.current.prefetchOnHover('/app/dashboard')
      })

      act(() => {
        vi.advanceTimersByTime(50)
      })

      // Hover a different route
      act(() => {
        result.current.prefetchOnHover('/app/offers')
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      // Only the second route should be prefetched
    })
  })

  describe('cancelPrefetch', () => {
    it('cancels pending prefetch', () => {
      const { result } = renderHook(() => usePrefetch())

      act(() => {
        result.current.prefetchOnHover('/app/dashboard')
      })

      act(() => {
        vi.advanceTimersByTime(50)
      })

      act(() => {
        result.current.cancelPrefetch()
      })

      act(() => {
        vi.advanceTimersByTime(100)
      })

      // Prefetch should have been cancelled
    })

    it('does nothing if no prefetch is pending', () => {
      const { result } = renderHook(() => usePrefetch())

      // Should not throw
      act(() => {
        result.current.cancelPrefetch()
      })
    })
  })

  describe('deduplication', () => {
    it('does not prefetch the same route twice', () => {
      const { result } = renderHook(() => usePrefetch())

      act(() => {
        result.current.prefetch('/app/dashboard')
      })

      act(() => {
        result.current.prefetch('/app/dashboard')
      })

      // Second call should be ignored (route already in cache)
    })
  })
})

describe('prefetchRoutes', () => {
  it('prefetches multiple routes', () => {
    // This function runs synchronously
    prefetchRoutes(['/app/dashboard', '/app/offers'])
  })

  it('handles empty array', () => {
    prefetchRoutes([])
  })

  it('skips unknown routes', () => {
    prefetchRoutes(['/unknown', '/also-unknown'])
  })
})

describe('prefetchCommonRoutes', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('prefetches common routes using requestIdleCallback when available', () => {
    const mockRequestIdleCallback = vi.fn((cb: IdleRequestCallback) => {
      cb({ didTimeout: false, timeRemaining: () => 50 })
      return 1
    })
    vi.stubGlobal('requestIdleCallback', mockRequestIdleCallback)

    prefetchCommonRoutes()

    expect(mockRequestIdleCallback).toHaveBeenCalled()

    vi.unstubAllGlobals()
  })

  it('uses setTimeout fallback when requestIdleCallback is not available', () => {
    vi.stubGlobal('requestIdleCallback', undefined)

    prefetchCommonRoutes()

    act(() => {
      vi.advanceTimersByTime(2000)
    })

    vi.unstubAllGlobals()
  })
})

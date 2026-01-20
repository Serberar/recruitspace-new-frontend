import { describe, it, expect, vi, beforeAll, beforeEach, afterAll } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useIntersectionObserver, useLazyLoad } from './useIntersectionObserver'

// Mock IntersectionObserver
const mockObserve = vi.fn()
const mockUnobserve = vi.fn()
const mockDisconnect = vi.fn()

let intersectionCallback: IntersectionObserverCallback

class MockIntersectionObserver implements IntersectionObserver {
  root: Element | Document | null = null
  rootMargin: string = ''
  thresholds: ReadonlyArray<number> = []

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    intersectionCallback = callback
    this.root = options?.root ?? null
    this.rootMargin = options?.rootMargin ?? ''
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : [options?.threshold ?? 0]
  }

  observe = mockObserve
  unobserve = mockUnobserve
  disconnect = mockDisconnect
  takeRecords = vi.fn(() => [])
}

// Store original to restore later
const originalIntersectionObserver = global.IntersectionObserver

// Replace IntersectionObserver for all tests
beforeAll(() => {
  // @ts-expect-error - mocking global
  global.IntersectionObserver = MockIntersectionObserver
  // @ts-expect-error - mocking window
  window.IntersectionObserver = MockIntersectionObserver
})

afterAll(() => {
  // @ts-expect-error - restoring global
  global.IntersectionObserver = originalIntersectionObserver
  // @ts-expect-error - restoring window
  window.IntersectionObserver = originalIntersectionObserver
})

describe('useIntersectionObserver', () => {
  beforeEach(() => {
    mockObserve.mockClear()
    mockUnobserve.mockClear()
    mockDisconnect.mockClear()
  })

  it('returns initial state with isIntersecting false', () => {
    const ref = { current: document.createElement('div') }

    const { result } = renderHook(() => useIntersectionObserver(ref))

    expect(result.current.isIntersecting).toBe(false)
    expect(result.current.entry).toBeUndefined()
  })

  it('observes the element when ref is set', () => {
    const element = document.createElement('div')
    const ref = { current: element }

    renderHook(() => useIntersectionObserver(ref))

    expect(mockObserve).toHaveBeenCalledWith(element)
  })

  it('does not observe when ref is null', () => {
    const ref = { current: null }

    renderHook(() => useIntersectionObserver(ref))

    expect(mockObserve).not.toHaveBeenCalled()
  })

  it('updates isIntersecting when element enters viewport', () => {
    const element = document.createElement('div')
    const ref = { current: element }

    const { result } = renderHook(() => useIntersectionObserver(ref))

    // Simulate intersection
    act(() => {
      intersectionCallback(
        [
          {
            isIntersecting: true,
            target: element,
            intersectionRatio: 1,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: Date.now(),
          },
        ],
        {} as IntersectionObserver
      )
    })

    expect(result.current.isIntersecting).toBe(true)
  })

  it('updates isIntersecting when element exits viewport', () => {
    const element = document.createElement('div')
    const ref = { current: element }

    const { result } = renderHook(() => useIntersectionObserver(ref))

    // Enter viewport
    act(() => {
      intersectionCallback(
        [{ isIntersecting: true, target: element } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(result.current.isIntersecting).toBe(true)

    // Exit viewport
    act(() => {
      intersectionCallback(
        [{ isIntersecting: false, target: element } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(result.current.isIntersecting).toBe(false)
  })

  it('freezes state when freezeOnceVisible is true and element is visible', () => {
    const element = document.createElement('div')
    const ref = { current: element }

    const { result } = renderHook(() =>
      useIntersectionObserver(ref, { freezeOnceVisible: true })
    )

    // Enter viewport
    act(() => {
      intersectionCallback(
        [{ isIntersecting: true, target: element } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(result.current.isIntersecting).toBe(true)

    // Try to exit - should stay true because frozen
    act(() => {
      intersectionCallback(
        [{ isIntersecting: false, target: element } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    // State is frozen, still shows true
    expect(result.current.isIntersecting).toBe(true)
  })

  it('disconnects observer on unmount', () => {
    const element = document.createElement('div')
    const ref = { current: element }

    const { unmount } = renderHook(() => useIntersectionObserver(ref))

    unmount()

    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('provides entry in the return value', () => {
    const element = document.createElement('div')
    const ref = { current: element }

    const { result } = renderHook(() => useIntersectionObserver(ref))

    const mockEntry = {
      isIntersecting: true,
      target: element,
      intersectionRatio: 0.75,
      boundingClientRect: { top: 100 } as DOMRectReadOnly,
      intersectionRect: {} as DOMRectReadOnly,
      rootBounds: null,
      time: Date.now(),
    } as IntersectionObserverEntry

    act(() => {
      intersectionCallback([mockEntry], {} as IntersectionObserver)
    })

    expect(result.current.entry).toBeDefined()
    expect(result.current.entry?.intersectionRatio).toBe(0.75)
  })
})

describe('useLazyLoad', () => {
  beforeEach(() => {
    mockObserve.mockClear()
    mockDisconnect.mockClear()
  })

  it('returns false initially', () => {
    const element = document.createElement('div')
    const ref = { current: element }

    const { result } = renderHook(() => useLazyLoad(ref))

    expect(result.current).toBe(false)
  })

  it('returns true when element becomes visible', () => {
    const element = document.createElement('div')
    const ref = { current: element }

    const { result } = renderHook(() => useLazyLoad(ref))

    act(() => {
      intersectionCallback(
        [{ isIntersecting: true, target: element } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(result.current).toBe(true)
  })

  it('stays true after element is no longer visible (frozen)', () => {
    const element = document.createElement('div')
    const ref = { current: element }

    const { result } = renderHook(() => useLazyLoad(ref))

    // Become visible
    act(() => {
      intersectionCallback(
        [{ isIntersecting: true, target: element } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    expect(result.current).toBe(true)

    // Exit viewport
    act(() => {
      intersectionCallback(
        [{ isIntersecting: false, target: element } as IntersectionObserverEntry],
        {} as IntersectionObserver
      )
    })

    // Should stay true due to freezeOnceVisible
    expect(result.current).toBe(true)
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useThrottle, useThrottledCallback } from './useThrottle'

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('useThrottle hook', () => {
    it('returns initial value immediately', () => {
      const { result } = renderHook(() => useThrottle('initial', 300))
      expect(result.current).toBe('initial')
    })

    it('throttles value updates within interval', () => {
      const { result, rerender } = renderHook(
        ({ value, interval }) => useThrottle(value, interval),
        { initialProps: { value: 'initial', interval: 300 } }
      )

      rerender({ value: 'updated', interval: 300 })

      // Value should update after interval
      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(result.current).toBe('updated')
    })

    it('updates after interval passes', () => {
      const { result, rerender } = renderHook(
        ({ value, interval }) => useThrottle(value, interval),
        { initialProps: { value: 'initial', interval: 300 } }
      )

      rerender({ value: 'updated', interval: 300 })

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(result.current).toBe('updated')
    })

    it('works with objects', () => {
      const initial = { x: 0, y: 0 }
      const updated = { x: 100, y: 100 }

      const { result, rerender } = renderHook(
        ({ value, interval }) => useThrottle(value, interval),
        { initialProps: { value: initial, interval: 300 } }
      )

      rerender({ value: updated, interval: 300 })

      act(() => { vi.advanceTimersByTime(300) })

      expect(result.current).toEqual({ x: 100, y: 100 })
    })

    it('cleans up timeout on unmount', () => {
      const { rerender, unmount } = renderHook(
        ({ value, interval }) => useThrottle(value, interval),
        { initialProps: { value: 'initial', interval: 300 } }
      )

      rerender({ value: 'updated', interval: 300 })
      unmount()

      // Should not throw
      act(() => {
        vi.advanceTimersByTime(300)
      })
    })
  })

  describe('useThrottledCallback hook', () => {
    it('returns a function', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useThrottledCallback(callback, 300))
      expect(typeof result.current).toBe('function')
    })

    it('calls callback immediately on first invocation', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useThrottledCallback(callback, 300))

      act(() => {
        result.current('arg1')
      })

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('arg1')
    })

    it('throttles subsequent calls within interval', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useThrottledCallback(callback, 300))

      act(() => {
        result.current('call1')
        result.current('call2')
        result.current('call3')
      })

      // Only first call should have been made
      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('call1')
    })

    it('schedules trailing call for last invocation', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useThrottledCallback(callback, 300))

      act(() => {
        result.current('call1')
        result.current('call2')
        result.current('call3')
      })

      expect(callback).toHaveBeenCalledTimes(1)

      act(() => {
        vi.advanceTimersByTime(300)
      })

      // Trailing call should be made
      expect(callback).toHaveBeenCalledTimes(2)
      expect(callback).toHaveBeenLastCalledWith('call3')
    })

    it('allows new call after interval', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useThrottledCallback(callback, 300))

      act(() => {
        result.current('call1')
      })

      expect(callback).toHaveBeenCalledTimes(1)

      act(() => {
        vi.advanceTimersByTime(300)
      })

      act(() => {
        result.current('call2')
      })

      expect(callback).toHaveBeenCalledTimes(2)
      expect(callback).toHaveBeenLastCalledWith('call2')
    })

    it('passes all arguments to callback', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useThrottledCallback(callback, 300))

      act(() => {
        result.current('arg1', 'arg2', 'arg3')
      })

      expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
    })

    it('cleans up on unmount', () => {
      const callback = vi.fn()
      const { result, unmount } = renderHook(() => useThrottledCallback(callback, 300))

      act(() => {
        result.current('call1')
        result.current('call2')
      })

      expect(callback).toHaveBeenCalledTimes(1)

      unmount()

      act(() => {
        vi.advanceTimersByTime(300)
      })

      // Trailing call should not be made after unmount
      expect(callback).toHaveBeenCalledTimes(1)
    })

    it('uses latest callback version', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      const { result, rerender } = renderHook(
        ({ cb }) => useThrottledCallback(cb, 300),
        { initialProps: { cb: callback1 } }
      )

      act(() => {
        result.current('call1')
        result.current('call2')
      })

      expect(callback1).toHaveBeenCalledTimes(1)

      // Change callback before trailing call
      rerender({ cb: callback2 })

      act(() => {
        vi.advanceTimersByTime(300)
      })

      // Trailing call should use new callback
      expect(callback2).toHaveBeenCalledTimes(1)
      expect(callback2).toHaveBeenCalledWith('call2')
    })
  })
})

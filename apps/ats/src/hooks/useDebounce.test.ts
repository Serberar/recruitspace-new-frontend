import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDebounce, useDebouncedCallback } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('useDebounce hook', () => {
    it('returns initial value immediately', () => {
      const { result } = renderHook(() => useDebounce('initial', 300))
      expect(result.current).toBe('initial')
    })

    it('does not update value before delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 300 } }
      )

      rerender({ value: 'updated', delay: 300 })

      // Before delay, value should still be initial
      act(() => {
        vi.advanceTimersByTime(200)
      })
      expect(result.current).toBe('initial')
    })

    it('updates value after delay', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 300 } }
      )

      rerender({ value: 'updated', delay: 300 })

      act(() => {
        vi.advanceTimersByTime(300)
      })
      expect(result.current).toBe('updated')
    })

    it('resets timer on rapid changes', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'a', delay: 300 } }
      )

      // Rapid changes
      rerender({ value: 'ab', delay: 300 })
      act(() => { vi.advanceTimersByTime(100) })

      rerender({ value: 'abc', delay: 300 })
      act(() => { vi.advanceTimersByTime(100) })

      rerender({ value: 'abcd', delay: 300 })
      act(() => { vi.advanceTimersByTime(100) })

      // Should still be initial since timer keeps resetting
      expect(result.current).toBe('a')

      // After full delay from last change
      act(() => { vi.advanceTimersByTime(300) })
      expect(result.current).toBe('abcd')
    })

    it('works with objects', () => {
      const initialObj = { count: 0 }
      const updatedObj = { count: 1 }

      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: initialObj, delay: 300 } }
      )

      rerender({ value: updatedObj, delay: 300 })

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(result.current).toEqual({ count: 1 })
    })

    it('works with different delays', () => {
      const { result, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 500 } }
      )

      rerender({ value: 'updated', delay: 500 })

      act(() => { vi.advanceTimersByTime(300) })
      expect(result.current).toBe('initial')

      act(() => { vi.advanceTimersByTime(200) })
      expect(result.current).toBe('updated')
    })

    it('cleans up timeout on unmount', () => {
      const { unmount, rerender } = renderHook(
        ({ value, delay }) => useDebounce(value, delay),
        { initialProps: { value: 'initial', delay: 300 } }
      )

      rerender({ value: 'updated', delay: 300 })
      unmount()

      // Should not throw or cause issues
      act(() => {
        vi.advanceTimersByTime(300)
      })
    })
  })

  describe('useDebouncedCallback hook', () => {
    it('returns a function', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useDebouncedCallback(callback, 300))
      expect(typeof result.current).toBe('function')
    })

    it('does not call callback immediately', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useDebouncedCallback(callback, 300))

      act(() => {
        result.current('arg1')
      })

      expect(callback).not.toHaveBeenCalled()
    })

    it('calls callback after delay', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useDebouncedCallback(callback, 300))

      act(() => {
        result.current('arg1')
      })

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('arg1')
    })

    it('passes all arguments to callback', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useDebouncedCallback(callback, 300))

      act(() => {
        result.current('arg1', 'arg2', 'arg3')
      })

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 'arg3')
    })

    it('only calls once for rapid invocations', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useDebouncedCallback(callback, 300))

      act(() => {
        result.current('call1')
        result.current('call2')
        result.current('call3')
      })

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('call3')
    })

    it('resets timer on each call', () => {
      const callback = vi.fn()
      const { result } = renderHook(() => useDebouncedCallback(callback, 300))

      act(() => {
        result.current('call1')
      })

      act(() => {
        vi.advanceTimersByTime(200)
      })

      act(() => {
        result.current('call2')
      })

      act(() => {
        vi.advanceTimersByTime(200)
      })

      // Should not have been called yet
      expect(callback).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(100)
      })

      expect(callback).toHaveBeenCalledTimes(1)
      expect(callback).toHaveBeenCalledWith('call2')
    })

    it('cleans up on unmount', () => {
      const callback = vi.fn()
      const { result, unmount } = renderHook(() => useDebouncedCallback(callback, 300))

      act(() => {
        result.current('arg')
      })

      unmount()

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(callback).not.toHaveBeenCalled()
    })

    it('uses latest callback version', () => {
      const callback1 = vi.fn()
      const callback2 = vi.fn()

      const { result, rerender } = renderHook(
        ({ cb }) => useDebouncedCallback(cb, 300),
        { initialProps: { cb: callback1 } }
      )

      act(() => {
        result.current('arg')
      })

      // Change the callback before delay completes
      rerender({ cb: callback2 })

      act(() => {
        vi.advanceTimersByTime(300)
      })

      expect(callback1).not.toHaveBeenCalled()
      expect(callback2).toHaveBeenCalledWith('arg')
    })
  })
})

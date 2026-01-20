import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useErrorHandler, normalizeError, isApiError, getErrorMessage } from './useErrorHandler'

describe('useErrorHandler', () => {
  describe('initial state', () => {
    it('starts with no error', () => {
      const { result } = renderHook(() => useErrorHandler())
      expect(result.current.error).toBeNull()
    })
  })

  describe('handleError', () => {
    it('sets error when called with Error object', () => {
      const { result } = renderHook(() => useErrorHandler())
      const testError = new Error('Test error')

      act(() => {
        result.current.handleError(testError)
      })

      expect(result.current.error).toBe(testError)
    })

    it('converts string to Error object', () => {
      const { result } = renderHook(() => useErrorHandler())

      act(() => {
        result.current.handleError('String error')
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('String error')
    })

    it('converts unknown types to Error', () => {
      const { result } = renderHook(() => useErrorHandler())

      act(() => {
        result.current.handleError(12345)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('12345')
    })

    it('calls onError callback when provided', () => {
      const onError = vi.fn()
      const { result } = renderHook(() => useErrorHandler({ onError }))
      const testError = new Error('Test error')

      act(() => {
        result.current.handleError(testError)
      })

      expect(onError).toHaveBeenCalledWith(testError)
    })

    it('throws error when throwOnError is true', () => {
      const { result } = renderHook(() => useErrorHandler({ throwOnError: true }))

      expect(() => {
        act(() => {
          result.current.handleError(new Error('Test error'))
        })
      }).toThrow('Test error')
    })

    it('does not throw when throwOnError is false', () => {
      const { result } = renderHook(() => useErrorHandler({ throwOnError: false }))

      expect(() => {
        act(() => {
          result.current.handleError(new Error('Test error'))
        })
      }).not.toThrow()
    })
  })

  describe('clearError', () => {
    it('clears the error state', () => {
      const { result } = renderHook(() => useErrorHandler())

      act(() => {
        result.current.handleError(new Error('Test error'))
      })

      expect(result.current.error).not.toBeNull()

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('withErrorHandling', () => {
    it('returns result on successful promise', async () => {
      const { result } = renderHook(() => useErrorHandler())
      const successPromise = Promise.resolve('success')

      let returnValue: string | undefined
      await act(async () => {
        returnValue = await result.current.withErrorHandling(successPromise)
      })

      expect(returnValue).toBe('success')
      expect(result.current.error).toBeNull()
    })

    it('catches error from rejected promise', async () => {
      const { result } = renderHook(() => useErrorHandler())
      const failPromise = Promise.reject(new Error('Promise failed'))

      let returnValue: unknown
      await act(async () => {
        returnValue = await result.current.withErrorHandling(failPromise)
      })

      expect(returnValue).toBeUndefined()
      expect(result.current.error?.message).toBe('Promise failed')
    })

    it('clears previous error before new operation', async () => {
      const { result } = renderHook(() => useErrorHandler())

      // Set initial error
      await act(async () => {
        await result.current.withErrorHandling(Promise.reject(new Error('First error')))
      })

      expect(result.current.error?.message).toBe('First error')

      // Run successful operation - should clear error
      await act(async () => {
        await result.current.withErrorHandling(Promise.resolve('success'))
      })

      expect(result.current.error).toBeNull()
    })
  })
})

describe('normalizeError', () => {
  it('returns Error object as-is', () => {
    const error = new Error('Test')
    expect(normalizeError(error)).toBe(error)
  })

  it('converts string to Error', () => {
    const result = normalizeError('String error')
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toBe('String error')
  })

  it('converts object with message property', () => {
    const result = normalizeError({ message: 'Object error' })
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toBe('Object error')
  })

  it('handles unknown types', () => {
    const result = normalizeError(null)
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toBe('An unknown error occurred')
  })

  it('handles undefined', () => {
    const result = normalizeError(undefined)
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toBe('An unknown error occurred')
  })
})

describe('isApiError', () => {
  it('returns true for Error with response property', () => {
    const error = new Error('API error')
    ;(error as any).response = { status: 400 }
    expect(isApiError(error)).toBe(true)
  })

  it('returns false for regular Error', () => {
    const error = new Error('Regular error')
    expect(isApiError(error)).toBe(false)
  })

  it('returns false for non-Error values', () => {
    expect(isApiError('string')).toBe(false)
    expect(isApiError(null)).toBe(false)
    expect(isApiError(undefined)).toBe(false)
    expect(isApiError({})).toBe(false)
  })
})

describe('getErrorMessage', () => {
  it('extracts message from API error response', () => {
    const error = new Error('API error')
    ;(error as any).response = { status: 400, data: { message: 'Custom API message' } }
    expect(getErrorMessage(error)).toBe('Custom API message')
  })

  it('returns Error.message for regular errors', () => {
    const error = new Error('Regular error message')
    expect(getErrorMessage(error)).toBe('Regular error message')
  })

  it('returns default message for unknown errors', () => {
    expect(getErrorMessage(null)).toBe('Ha ocurrido un error inesperado')
    expect(getErrorMessage(undefined)).toBe('Ha ocurrido un error inesperado')
    expect(getErrorMessage(123)).toBe('Ha ocurrido un error inesperado')
  })

  it('handles API error without message in response', () => {
    const error = new Error('Fallback message')
    ;(error as any).response = { status: 500 }
    expect(getErrorMessage(error)).toBe('Fallback message')
  })
})

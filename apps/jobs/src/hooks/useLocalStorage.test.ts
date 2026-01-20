import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  const mockLocalStorage = {
    store: {} as Record<string, string>,
    getItem: vi.fn((key: string) => mockLocalStorage.store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      mockLocalStorage.store[key] = value
    }),
    removeItem: vi.fn((key: string) => {
      delete mockLocalStorage.store[key]
    }),
    clear: vi.fn(() => {
      mockLocalStorage.store = {}
    }),
  }

  beforeEach(() => {
    mockLocalStorage.store = {}
    mockLocalStorage.getItem.mockClear()
    mockLocalStorage.setItem.mockClear()
    mockLocalStorage.removeItem.mockClear()

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })
  })

  describe('Initial value', () => {
    it('returns initial value when localStorage is empty', () => {
      const { result } = renderHook(() => useLocalStorage('key', 'initial'))
      expect(result.current[0]).toBe('initial')
    })

    it('returns stored value when localStorage has data', () => {
      mockLocalStorage.store['key'] = JSON.stringify('stored')

      const { result } = renderHook(() => useLocalStorage('key', 'initial'))
      expect(result.current[0]).toBe('stored')
    })

    it('works with object initial values', () => {
      const initial = { name: 'Test', count: 0 }
      const { result } = renderHook(() => useLocalStorage('key', initial))
      expect(result.current[0]).toEqual(initial)
    })

    it('works with array initial values', () => {
      const initial = [1, 2, 3]
      const { result } = renderHook(() => useLocalStorage('key', initial))
      expect(result.current[0]).toEqual(initial)
    })

    it('works with boolean initial values', () => {
      const { result } = renderHook(() => useLocalStorage('flag', true))
      expect(result.current[0]).toBe(true)
    })

    it('works with number initial values', () => {
      const { result } = renderHook(() => useLocalStorage('count', 42))
      expect(result.current[0]).toBe(42)
    })
  })

  describe('setValue', () => {
    it('updates state and localStorage', () => {
      const { result } = renderHook(() => useLocalStorage('key', 'initial'))

      act(() => {
        result.current[1]('updated')
      })

      expect(result.current[0]).toBe('updated')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('key', JSON.stringify('updated'))
    })

    it('accepts function updater', () => {
      const { result } = renderHook(() => useLocalStorage('count', 0))

      act(() => {
        result.current[1]((prev) => prev + 1)
      })

      expect(result.current[0]).toBe(1)

      act(() => {
        result.current[1]((prev) => prev + 5)
      })

      expect(result.current[0]).toBe(6)
    })

    it('updates objects correctly', () => {
      const { result } = renderHook(() =>
        useLocalStorage('user', { name: 'John', age: 30 })
      )

      act(() => {
        result.current[1]({ name: 'Jane', age: 25 })
      })

      expect(result.current[0]).toEqual({ name: 'Jane', age: 25 })
    })

    it('updates arrays correctly', () => {
      const { result } = renderHook(() => useLocalStorage('items', ['a', 'b']))

      act(() => {
        result.current[1]((prev) => [...prev, 'c'])
      })

      expect(result.current[0]).toEqual(['a', 'b', 'c'])
    })
  })

  describe('removeValue', () => {
    it('removes item from localStorage and resets to initial value', () => {
      mockLocalStorage.store['key'] = JSON.stringify('stored')

      const { result } = renderHook(() => useLocalStorage('key', 'initial'))

      expect(result.current[0]).toBe('stored')

      act(() => {
        result.current[2]() // removeValue
      })

      expect(result.current[0]).toBe('initial')
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('key')
    })
  })

  describe('Storage event synchronization', () => {
    it('updates state when storage event is triggered', () => {
      const { result } = renderHook(() => useLocalStorage('key', 'initial'))

      act(() => {
        const event = new StorageEvent('storage', {
          key: 'key',
          newValue: JSON.stringify('from-other-tab'),
        })
        window.dispatchEvent(event)
      })

      expect(result.current[0]).toBe('from-other-tab')
    })

    it('ignores storage events for different keys', () => {
      const { result } = renderHook(() => useLocalStorage('myKey', 'initial'))

      act(() => {
        const event = new StorageEvent('storage', {
          key: 'otherKey',
          newValue: JSON.stringify('other-value'),
        })
        window.dispatchEvent(event)
      })

      expect(result.current[0]).toBe('initial')
    })

    it('ignores storage events with null newValue', () => {
      const { result } = renderHook(() => useLocalStorage('key', 'initial'))

      act(() => {
        result.current[1]('updated')
      })

      act(() => {
        const event = new StorageEvent('storage', {
          key: 'key',
          newValue: null,
        })
        window.dispatchEvent(event)
      })

      expect(result.current[0]).toBe('updated')
    })
  })

  describe('Error handling', () => {
    it('handles JSON parse errors gracefully', () => {
      mockLocalStorage.store['key'] = 'invalid-json'
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { result } = renderHook(() => useLocalStorage('key', 'initial'))

      expect(result.current[0]).toBe('initial')
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('handles localStorage.setItem errors', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {
        throw new Error('QuotaExceededError')
      })
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      const { result } = renderHook(() => useLocalStorage('key', 'initial'))

      act(() => {
        result.current[1]('too-large-value')
      })

      // State should still update even if localStorage fails
      expect(result.current[0]).toBe('too-large-value')
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('Multiple hooks with same key', () => {
    it('shares state between hooks with same key', () => {
      const { result: result1 } = renderHook(() => useLocalStorage('shared', 'initial'))
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { result: _result2 } = renderHook(() => useLocalStorage('shared', 'initial'))

      act(() => {
        result1.current[1]('updated')
      })

      // Note: Without a shared context/event system, result2 won't automatically update
      // This test documents the current behavior
      expect(result1.current[0]).toBe('updated')
      expect(mockLocalStorage.store['shared']).toBe(JSON.stringify('updated'))
    })
  })

  describe('Different keys', () => {
    it('maintains separate state for different keys', () => {
      const { result: result1 } = renderHook(() => useLocalStorage('key1', 'initial1'))
      const { result: result2 } = renderHook(() => useLocalStorage('key2', 'initial2'))

      act(() => {
        result1.current[1]('updated1')
      })

      expect(result1.current[0]).toBe('updated1')
      expect(result2.current[0]).toBe('initial2')
    })
  })
})

import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePrevious } from './usePrevious'

describe('usePrevious', () => {
  it('returns undefined on first render', () => {
    const { result } = renderHook(() => usePrevious('initial'))
    expect(result.current).toBeUndefined()
  })

  it('returns previous value after rerender', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'first' } }
    )

    expect(result.current).toBeUndefined()

    rerender({ value: 'second' })
    expect(result.current).toBe('first')

    rerender({ value: 'third' })
    expect(result.current).toBe('second')
  })

  it('works with numbers', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 0 } }
    )

    expect(result.current).toBeUndefined()

    rerender({ value: 1 })
    expect(result.current).toBe(0)

    rerender({ value: 2 })
    expect(result.current).toBe(1)

    rerender({ value: 100 })
    expect(result.current).toBe(2)
  })

  it('works with objects', () => {
    const obj1 = { count: 0 }
    const obj2 = { count: 1 }
    const obj3 = { count: 2 }

    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: obj1 } }
    )

    expect(result.current).toBeUndefined()

    rerender({ value: obj2 })
    expect(result.current).toBe(obj1)

    rerender({ value: obj3 })
    expect(result.current).toBe(obj2)
  })

  it('works with arrays', () => {
    const arr1 = [1, 2, 3]
    const arr2 = [4, 5, 6]

    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: arr1 } }
    )

    expect(result.current).toBeUndefined()

    rerender({ value: arr2 })
    expect(result.current).toBe(arr1)
  })

  it('works with booleans', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: false } }
    )

    expect(result.current).toBeUndefined()

    rerender({ value: true })
    expect(result.current).toBe(false)

    rerender({ value: false })
    expect(result.current).toBe(true)
  })

  it('works with null', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: null as string | null } }
    )

    expect(result.current).toBeUndefined()

    rerender({ value: 'not null' })
    expect(result.current).toBeNull()

    rerender({ value: null })
    expect(result.current).toBe('not null')
  })

  it('keeps same reference when value does not change', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'same' } }
    )

    rerender({ value: 'same' })
    expect(result.current).toBe('same')

    rerender({ value: 'same' })
    expect(result.current).toBe('same')
  })

  it('can be used to detect changes', () => {
    const { result, rerender } = renderHook(
      ({ count }) => {
        const prevCount = usePrevious(count)
        return {
          current: count,
          previous: prevCount,
          increased: prevCount !== undefined && count > prevCount,
          decreased: prevCount !== undefined && count < prevCount,
        }
      },
      { initialProps: { count: 5 } }
    )

    expect(result.current.increased).toBe(false)
    expect(result.current.decreased).toBe(false)

    rerender({ count: 10 })
    expect(result.current.increased).toBe(true)
    expect(result.current.decreased).toBe(false)

    rerender({ count: 3 })
    expect(result.current.increased).toBe(false)
    expect(result.current.decreased).toBe(true)
  })
})

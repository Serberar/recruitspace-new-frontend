import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorBoundary } from './ErrorBoundary'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for expected errors
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('normal rendering', () => {
    it('renders children when no error', () => {
      render(
        <ErrorBoundary>
          <div>Child content</div>
        </ErrorBoundary>
      )

      expect(screen.getByText('Child content')).toBeInTheDocument()
    })
  })

  describe('error handling', () => {
    it('renders default fallback when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Algo salio mal')).toBeInTheDocument()
      expect(screen.getByText('Ha ocurrido un error inesperado.')).toBeInTheDocument()
    })

    it('renders retry button in default fallback', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByRole('button', { name: 'Intentar de nuevo' })).toBeInTheDocument()
    })

    it('renders custom ReactNode fallback', () => {
      render(
        <ErrorBoundary fallback={<div>Custom error UI</div>}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Custom error UI')).toBeInTheDocument()
    })

    it('renders function fallback with error and resetError', () => {
      const fallbackFn = vi.fn((error: Error, resetError: () => void) => (
        <div>
          <span>Error: {error.message}</span>
          <button onClick={resetError}>Reset</button>
        </div>
      ))

      render(
        <ErrorBoundary fallback={fallbackFn}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(fallbackFn).toHaveBeenCalled()
      expect(screen.getByText('Error: Test error')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reset' })).toBeInTheDocument()
    })
  })

  describe('reset functionality', () => {
    it('calls resetError function when retry button is clicked', async () => {
      const user = userEvent.setup()
      const resetSpy = vi.fn()

      // Use a fallback function that exposes the resetError function
      render(
        <ErrorBoundary
          fallback={(error, resetError) => {
            // Wrap the resetError to spy on it
            const wrappedReset = () => {
              resetSpy()
              resetError()
            }
            return (
              <div>
                <span>Error occurred</span>
                <button onClick={wrappedReset}>Retry</button>
              </div>
            )
          }}
        >
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Error occurred')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Retry' }))

      // The reset function was called
      expect(resetSpy).toHaveBeenCalled()
    })

    it('resets when resetKeys change', () => {
      const { rerender } = render(
        <ErrorBoundary resetKeys={['key1']}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(screen.getByText('Algo salio mal')).toBeInTheDocument()

      // Change resetKeys
      rerender(
        <ErrorBoundary resetKeys={['key2']}>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )

      expect(screen.getByText('No error')).toBeInTheDocument()
    })
  })

  describe('callbacks', () => {
    it('calls onError callback when error occurs', () => {
      const onError = vi.fn()

      render(
        <ErrorBoundary onError={onError}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(onError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({ componentStack: expect.any(String) })
      )
    })

    it('logs error to console', () => {
      const consoleSpy = vi.spyOn(console, 'error')

      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        'ErrorBoundary caught an error:',
        expect.any(Error),
        expect.any(Object)
      )
    })
  })
})

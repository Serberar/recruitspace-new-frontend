import { describe, it, expect, vi } from 'vitest'
import { render as rtlRender, screen as rtlScreen } from '@testing-library/react'
import { render, screen, userEvent, waitFor } from '../../test/test-utils'
import { ToastProvider, useToast } from './Toast'

// Test component that uses the toast hook
function ToastTester() {
  const { success, error, warning, info, toasts, removeToast } = useToast()

  return (
    <div>
      <button onClick={() => success('Success message')}>Show Success</button>
      <button onClick={() => error('Error message')}>Show Error</button>
      <button onClick={() => warning('Warning message')}>Show Warning</button>
      <button onClick={() => info('Info message')}>Show Info</button>
      {toasts.length > 0 && (
        <button onClick={() => removeToast(toasts[0].id)}>Remove First</button>
      )}
      <span data-testid="toast-count">{toasts.length}</span>
    </div>
  )
}

describe('Toast', () => {
  describe('ToastProvider', () => {
    it('renders children', () => {
      render(
        <ToastProvider>
          <div>App content</div>
        </ToastProvider>
      )
      expect(screen.getByText('App content')).toBeInTheDocument()
    })

    it('provides toast context to children', () => {
      render(
        <ToastProvider>
          <ToastTester />
        </ToastProvider>
      )
      expect(screen.getByText('Show Success')).toBeInTheDocument()
    })
  })

  describe('useToast hook', () => {
    it('throws error when used outside provider', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

      // Use rtlRender (raw render without ToastProvider wrapper)
      expect(() => {
        rtlRender(<ToastTester />)
      }).toThrow('useToast must be used within a ToastProvider')

      consoleError.mockRestore()
    })
  })

  describe('Toast types', () => {
    it('shows success toast', async () => {
      const user = userEvent.setup()

      render(
        <ToastProvider>
          <ToastTester />
        </ToastProvider>
      )

      await user.click(screen.getByText('Show Success'))

      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument()
      })
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('shows error toast', async () => {
      const user = userEvent.setup()

      render(
        <ToastProvider>
          <ToastTester />
        </ToastProvider>
      )

      await user.click(screen.getByText('Show Error'))

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument()
      })
    })

    it('shows warning toast', async () => {
      const user = userEvent.setup()

      render(
        <ToastProvider>
          <ToastTester />
        </ToastProvider>
      )

      await user.click(screen.getByText('Show Warning'))

      await waitFor(() => {
        expect(screen.getByText('Warning message')).toBeInTheDocument()
      })
    })

    it('shows info toast', async () => {
      const user = userEvent.setup()

      render(
        <ToastProvider>
          <ToastTester />
        </ToastProvider>
      )

      await user.click(screen.getByText('Show Info'))

      await waitFor(() => {
        expect(screen.getByText('Info message')).toBeInTheDocument()
      })
    })
  })

  describe('Manual dismiss', () => {
    it('can manually remove a toast', async () => {
      const user = userEvent.setup()

      render(
        <ToastProvider>
          <ToastTester />
        </ToastProvider>
      )

      await user.click(screen.getByText('Show Success'))

      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument()
      })

      await user.click(screen.getByText('Remove First'))

      await waitFor(() => {
        expect(screen.queryByText('Success message')).not.toBeInTheDocument()
      })
    })
  })

  describe('Multiple toasts', () => {
    it('can show multiple toasts', async () => {
      const user = userEvent.setup()

      render(
        <ToastProvider>
          <ToastTester />
        </ToastProvider>
      )

      await user.click(screen.getByText('Show Success'))
      await user.click(screen.getByText('Show Error'))
      await user.click(screen.getByText('Show Warning'))

      await waitFor(() => {
        expect(screen.getByText('Success message')).toBeInTheDocument()
        expect(screen.getByText('Error message')).toBeInTheDocument()
        expect(screen.getByText('Warning message')).toBeInTheDocument()
      })
      expect(screen.getByTestId('toast-count')).toHaveTextContent('3')
    })
  })

  describe('Accessibility', () => {
    it('has role="alert" for toast messages', async () => {
      const user = userEvent.setup()

      render(
        <ToastProvider>
          <ToastTester />
        </ToastProvider>
      )

      await user.click(screen.getByText('Show Success'))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })

    it('close button has accessible label', async () => {
      const user = userEvent.setup()

      render(
        <ToastProvider>
          <ToastTester />
        </ToastProvider>
      )

      await user.click(screen.getByText('Show Success'))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cerrar notificacion/i })).toBeInTheDocument()
      })
    })
  })

  describe('Toast styling', () => {
    it('applies correct class for success type', async () => {
      const user = userEvent.setup()

      render(
        <ToastProvider>
          <ToastTester />
        </ToastProvider>
      )

      await user.click(screen.getByText('Show Success'))

      await waitFor(() => {
        const toast = screen.getByRole('alert')
        expect(toast.className).toContain('success')
      })
    })

    it('applies correct class for error type', async () => {
      const user = userEvent.setup()

      render(
        <ToastProvider>
          <ToastTester />
        </ToastProvider>
      )

      await user.click(screen.getByText('Show Error'))

      await waitFor(() => {
        const toast = screen.getByRole('alert')
        expect(toast.className).toContain('error')
      })
    })
  })
})

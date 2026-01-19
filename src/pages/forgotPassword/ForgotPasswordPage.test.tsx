import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import ForgotPasswordPage from './ForgotPasswordPage'
import { ToastProvider } from '../../components/ui/Toast'

// Mock i18n
const mockChangeLanguage = vi.fn()
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'app.language': 'Idioma',
        'footer.privacy': 'Privacidad',
        'footer.terms': 'Términos',
        'footer.cookies': 'Cookies',
        'footer.contact': 'Contacto',
        'footer.reportProblem': 'Reportar problema',
      }
      return translations[key] || key
    },
    i18n: {
      language: 'es',
      changeLanguage: mockChangeLanguage,
    },
  }),
}))

// Mock authService
const mockForgotPasswordAPI = vi.fn()
vi.mock('../../features/auth/services/authService', () => ({
  forgotPasswordAPI: (email: string) => mockForgotPasswordAPI(email),
}))

const renderPage = () => {
  return render(
    <ToastProvider>
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    </ToastProvider>
  )
}

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('form state', () => {
    it('renders form initially', () => {
      renderPage()

      expect(screen.getByRole('heading', { name: 'Recuperar contrasena' })).toBeInTheDocument()
      expect(screen.getByLabelText('Correo electronico')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Enviar enlace de recuperacion' })).toBeInTheDocument()
    })

    it('renders description text', () => {
      renderPage()

      expect(screen.getByText(/Introduce tu correo electronico/)).toBeInTheDocument()
    })

    it('renders back to login link', () => {
      renderPage()

      const loginLink = screen.getByRole('link', { name: 'Volver a iniciar sesion' })
      expect(loginLink).toBeInTheDocument()
      expect(loginLink).toHaveAttribute('href', '/login')
    })
  })

  describe('form validation', () => {
    it('shows error when submitting empty email', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.click(screen.getByRole('button', { name: 'Enviar enlace de recuperacion' }))

      expect(screen.getByText('Por favor, introduce tu correo electronico.')).toBeInTheDocument()
      expect(mockForgotPasswordAPI).not.toHaveBeenCalled()
    })

    it('shows error when email is only whitespace', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.type(screen.getByLabelText('Correo electronico'), '   ')
      await user.click(screen.getByRole('button', { name: 'Enviar enlace de recuperacion' }))

      expect(screen.getByText('Por favor, introduce tu correo electronico.')).toBeInTheDocument()
    })
  })

  describe('form submission', () => {
    it('calls forgotPasswordAPI with email on submit', async () => {
      const user = userEvent.setup()
      mockForgotPasswordAPI.mockResolvedValue(undefined)
      renderPage()

      await user.type(screen.getByLabelText('Correo electronico'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: 'Enviar enlace de recuperacion' }))

      expect(mockForgotPasswordAPI).toHaveBeenCalledWith('test@example.com')
    })

    it('shows loading state while submitting', async () => {
      const user = userEvent.setup()
      let resolvePromise: () => void
      mockForgotPasswordAPI.mockImplementation(() => new Promise((resolve) => {
        resolvePromise = resolve
      }))
      renderPage()

      await user.type(screen.getByLabelText('Correo electronico'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: 'Enviar enlace de recuperacion' }))

      expect(screen.getByRole('button', { name: 'Enviando...' })).toBeDisabled()

      resolvePromise!()
    })

    it('disables input while loading', async () => {
      const user = userEvent.setup()
      let resolvePromise: () => void
      mockForgotPasswordAPI.mockImplementation(() => new Promise((resolve) => {
        resolvePromise = resolve
      }))
      renderPage()

      await user.type(screen.getByLabelText('Correo electronico'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: 'Enviar enlace de recuperacion' }))

      expect(screen.getByLabelText('Correo electronico')).toBeDisabled()

      resolvePromise!()
    })
  })

  describe('success state', () => {
    it('shows success message after submission', async () => {
      const user = userEvent.setup()
      mockForgotPasswordAPI.mockResolvedValue(undefined)
      renderPage()

      await user.type(screen.getByLabelText('Correo electronico'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: 'Enviar enlace de recuperacion' }))

      await waitFor(() => {
        expect(screen.getByText('Correo enviado')).toBeInTheDocument()
      })
    })

    it('shows email in success message', async () => {
      const user = userEvent.setup()
      mockForgotPasswordAPI.mockResolvedValue(undefined)
      renderPage()

      await user.type(screen.getByLabelText('Correo electronico'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: 'Enviar enlace de recuperacion' }))

      await waitFor(() => {
        expect(screen.getByText(/test@example.com/)).toBeInTheDocument()
      })
    })

    it('allows sending another email', async () => {
      const user = userEvent.setup()
      mockForgotPasswordAPI.mockResolvedValue(undefined)
      renderPage()

      await user.type(screen.getByLabelText('Correo electronico'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: 'Enviar enlace de recuperacion' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Enviar otro correo' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Enviar otro correo' }))

      expect(screen.getByRole('heading', { name: 'Recuperar contrasena' })).toBeInTheDocument()
    })

    it('has back to login link in success state', async () => {
      const user = userEvent.setup()
      mockForgotPasswordAPI.mockResolvedValue(undefined)
      renderPage()

      await user.type(screen.getByLabelText('Correo electronico'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: 'Enviar enlace de recuperacion' }))

      await waitFor(() => {
        const loginLink = screen.getByRole('link', { name: 'Volver a iniciar sesion' })
        expect(loginLink).toHaveAttribute('href', '/login')
      })
    })
  })

  describe('error handling', () => {
    it('shows error message on API failure', async () => {
      const user = userEvent.setup()
      mockForgotPasswordAPI.mockRejectedValue(new Error('Network error'))
      renderPage()

      await user.type(screen.getByLabelText('Correo electronico'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: 'Enviar enlace de recuperacion' }))

      await waitFor(() => {
        expect(screen.getByText('Ha ocurrido un error. Por favor, intentalo de nuevo.')).toBeInTheDocument()
      })
    })

    it('stays on form after error', async () => {
      const user = userEvent.setup()
      mockForgotPasswordAPI.mockRejectedValue(new Error('Network error'))
      renderPage()

      await user.type(screen.getByLabelText('Correo electronico'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: 'Enviar enlace de recuperacion' }))

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Recuperar contrasena' })).toBeInTheDocument()
      })
    })
  })
})

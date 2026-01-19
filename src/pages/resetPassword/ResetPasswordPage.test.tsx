import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ResetPasswordPage from './ResetPasswordPage'
import { ToastProvider } from '../../components/ui/Toast'

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

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
const mockResetPasswordAPI = vi.fn()
vi.mock('../../features/auth/services/authService', () => ({
  resetPasswordAPI: (token: string, password: string) => mockResetPasswordAPI(token, password),
}))

// Mock error handler
vi.mock('../../hooks/useErrorHandler', () => ({
  getErrorMessage: (err: Error) => err.message,
}))

const renderPage = (token?: string) => {
  const searchParams = token ? `?token=${token}` : ''
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[`/reset-password${searchParams}`]}>
        <ResetPasswordPage />
      </MemoryRouter>
    </ToastProvider>
  )
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('without token', () => {
    it('shows error state when no token provided', () => {
      renderPage()

      expect(screen.getByText('Enlace invalido')).toBeInTheDocument()
      expect(screen.getByText(/El enlace de restablecimiento no es valido/)).toBeInTheDocument()
    })

    it('has button to request new link', () => {
      renderPage()

      expect(screen.getByRole('button', { name: 'Solicitar nuevo enlace' })).toBeInTheDocument()
    })

    it('navigates to forgot-password when button clicked', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.click(screen.getByRole('button', { name: 'Solicitar nuevo enlace' }))

      expect(mockNavigate).toHaveBeenCalledWith('/forgot-password')
    })
  })

  describe('with token - form state', () => {
    it('renders form with token', () => {
      renderPage('valid-token-123')

      expect(screen.getByRole('heading', { name: 'Nueva contrasena' })).toBeInTheDocument()
      expect(screen.getByLabelText('Nueva contrasena')).toBeInTheDocument()
      expect(screen.getByLabelText('Confirmar contrasena')).toBeInTheDocument()
    })

    it('renders description text', () => {
      renderPage('valid-token-123')

      expect(screen.getByText(/Introduce tu nueva contrasena/)).toBeInTheDocument()
    })

    it('renders back to login link', () => {
      renderPage('valid-token-123')

      const loginLink = screen.getByRole('link', { name: 'Volver a iniciar sesion' })
      expect(loginLink).toHaveAttribute('href', '/login')
    })
  })

  describe('form validation', () => {
    it('shows error when password is empty', async () => {
      const user = userEvent.setup()
      renderPage('valid-token')

      await user.click(screen.getByRole('button', { name: 'Actualizar contrasena' }))

      expect(screen.getByText('La contrasena es requerida')).toBeInTheDocument()
    })

    it('shows error when password is too short', async () => {
      const user = userEvent.setup()
      renderPage('valid-token')

      await user.type(screen.getByLabelText('Nueva contrasena'), 'short')
      await user.click(screen.getByRole('button', { name: 'Actualizar contrasena' }))

      expect(screen.getByText('La contrasena debe tener al menos 8 caracteres')).toBeInTheDocument()
    })

    it('shows error when confirm password is empty', async () => {
      const user = userEvent.setup()
      renderPage('valid-token')

      await user.type(screen.getByLabelText('Nueva contrasena'), 'validpassword123')
      await user.click(screen.getByRole('button', { name: 'Actualizar contrasena' }))

      expect(screen.getByText('Confirma tu contrasena')).toBeInTheDocument()
    })

    it('shows error when passwords do not match', async () => {
      const user = userEvent.setup()
      renderPage('valid-token')

      await user.type(screen.getByLabelText('Nueva contrasena'), 'validpassword123')
      await user.type(screen.getByLabelText('Confirmar contrasena'), 'differentpassword')
      await user.click(screen.getByRole('button', { name: 'Actualizar contrasena' }))

      expect(screen.getByText('Las contrasenas no coinciden')).toBeInTheDocument()
    })

    it('does not call API when validation fails', async () => {
      const user = userEvent.setup()
      renderPage('valid-token')

      await user.click(screen.getByRole('button', { name: 'Actualizar contrasena' }))

      expect(mockResetPasswordAPI).not.toHaveBeenCalled()
    })
  })

  describe('form submission', () => {
    it('calls resetPasswordAPI with token and password', async () => {
      const user = userEvent.setup()
      mockResetPasswordAPI.mockResolvedValue(undefined)
      renderPage('valid-token-123')

      await user.type(screen.getByLabelText('Nueva contrasena'), 'newpassword123')
      await user.type(screen.getByLabelText('Confirmar contrasena'), 'newpassword123')
      await user.click(screen.getByRole('button', { name: 'Actualizar contrasena' }))

      expect(mockResetPasswordAPI).toHaveBeenCalledWith('valid-token-123', 'newpassword123')
    })

    it('shows loading state while submitting', async () => {
      const user = userEvent.setup()
      let resolvePromise: () => void
      mockResetPasswordAPI.mockImplementation(() => new Promise((resolve) => {
        resolvePromise = resolve
      }))
      renderPage('valid-token')

      await user.type(screen.getByLabelText('Nueva contrasena'), 'newpassword123')
      await user.type(screen.getByLabelText('Confirmar contrasena'), 'newpassword123')
      await user.click(screen.getByRole('button', { name: 'Actualizar contrasena' }))

      expect(screen.getByRole('button', { name: 'Actualizando...' })).toBeDisabled()

      resolvePromise!()
    })
  })

  describe('success state', () => {
    it('shows success message after password reset', async () => {
      const user = userEvent.setup()
      mockResetPasswordAPI.mockResolvedValue(undefined)
      renderPage('valid-token')

      await user.type(screen.getByLabelText('Nueva contrasena'), 'newpassword123')
      await user.type(screen.getByLabelText('Confirmar contrasena'), 'newpassword123')
      await user.click(screen.getByRole('button', { name: 'Actualizar contrasena' }))

      await waitFor(() => {
        expect(screen.getByText('Contrasena actualizada')).toBeInTheDocument()
      })
    })

    it('shows confirmation text in success state', async () => {
      const user = userEvent.setup()
      mockResetPasswordAPI.mockResolvedValue(undefined)
      renderPage('valid-token')

      await user.type(screen.getByLabelText('Nueva contrasena'), 'newpassword123')
      await user.type(screen.getByLabelText('Confirmar contrasena'), 'newpassword123')
      await user.click(screen.getByRole('button', { name: 'Actualizar contrasena' }))

      await waitFor(() => {
        expect(screen.getByText(/Tu contrasena ha sido restablecida correctamente/)).toBeInTheDocument()
      })
    })

    it('has login button in success state', async () => {
      const user = userEvent.setup()
      mockResetPasswordAPI.mockResolvedValue(undefined)
      renderPage('valid-token')

      await user.type(screen.getByLabelText('Nueva contrasena'), 'newpassword123')
      await user.type(screen.getByLabelText('Confirmar contrasena'), 'newpassword123')
      await user.click(screen.getByRole('button', { name: 'Actualizar contrasena' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Iniciar sesion' })).toBeInTheDocument()
      })
    })

    it('navigates to login when button clicked', async () => {
      const user = userEvent.setup()
      mockResetPasswordAPI.mockResolvedValue(undefined)
      renderPage('valid-token')

      await user.type(screen.getByLabelText('Nueva contrasena'), 'newpassword123')
      await user.type(screen.getByLabelText('Confirmar contrasena'), 'newpassword123')
      await user.click(screen.getByRole('button', { name: 'Actualizar contrasena' }))

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Iniciar sesion' }))
      })

      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })
  })

  describe('error handling', () => {
    it('shows error message on API failure', async () => {
      const user = userEvent.setup()
      mockResetPasswordAPI.mockRejectedValue(new Error('Token expired'))
      renderPage('valid-token')

      await user.type(screen.getByLabelText('Nueva contrasena'), 'newpassword123')
      await user.type(screen.getByLabelText('Confirmar contrasena'), 'newpassword123')
      await user.click(screen.getByRole('button', { name: 'Actualizar contrasena' }))

      await waitFor(() => {
        expect(screen.getByText('Token expired')).toBeInTheDocument()
      })
    })

    it('shows default error message when no message provided', async () => {
      const user = userEvent.setup()
      mockResetPasswordAPI.mockRejectedValue(new Error(''))
      renderPage('valid-token')

      await user.type(screen.getByLabelText('Nueva contrasena'), 'newpassword123')
      await user.type(screen.getByLabelText('Confirmar contrasena'), 'newpassword123')
      await user.click(screen.getByRole('button', { name: 'Actualizar contrasena' }))

      await waitFor(() => {
        expect(screen.getByText('El enlace es invalido o ha expirado.')).toBeInTheDocument()
      })
    })

    it('stays on form after error', async () => {
      const user = userEvent.setup()
      mockResetPasswordAPI.mockRejectedValue(new Error('Token expired'))
      renderPage('valid-token')

      await user.type(screen.getByLabelText('Nueva contrasena'), 'newpassword123')
      await user.type(screen.getByLabelText('Confirmar contrasena'), 'newpassword123')
      await user.click(screen.getByRole('button', { name: 'Actualizar contrasena' }))

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Nueva contrasena' })).toBeInTheDocument()
      })
    })
  })
})

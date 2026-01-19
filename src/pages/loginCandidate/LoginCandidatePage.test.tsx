import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import LoginCandidatePage from './LoginCandidatePage'
import authReducer from '../../features/auth/authSlice'
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
        'common:login.passwordLabel': 'Contraseña',
        'common:login.submit': 'Iniciar sesión',
        'common:login.invalidCredentials': 'Credenciales inválidas',
        'common:login.showPassword': 'Mostrar contraseña',
        'common:login.hidePassword': 'Ocultar contraseña',
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
const mockLoginCandidateAPI = vi.fn()
const mockResendVerificationAPI = vi.fn()
vi.mock('../../features/auth/services/authService', () => ({
  loginCandidateAPI: (data: { username: string; password: string }) => mockLoginCandidateAPI(data),
  resendVerificationAPI: (email: string) => mockResendVerificationAPI(email),
}))

// Mock error handler
vi.mock('../../hooks/useErrorHandler', () => ({
  getErrorMessage: (err: Error) => err.message,
}))

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
  })
}

const renderPage = () => {
  const store = createTestStore()
  return render(
    <Provider store={store}>
      <ToastProvider>
        <BrowserRouter>
          <LoginCandidatePage />
        </BrowserRouter>
      </ToastProvider>
    </Provider>
  )
}

describe('LoginCandidatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders candidate login form', () => {
      renderPage()

      expect(screen.getByRole('heading', { name: 'Portal de Candidatos' })).toBeInTheDocument()
      expect(screen.getByText('Inicia sesion para acceder a tus candidaturas')).toBeInTheDocument()
    })

    it('renders email/username input', () => {
      renderPage()

      expect(screen.getByLabelText(/Usuario o correo electronico/)).toBeInTheDocument()
    })

    it('renders password input', () => {
      renderPage()

      expect(screen.getByLabelText(/Contraseña/)).toBeInTheDocument()
    })

    it('renders submit button', () => {
      renderPage()

      expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeInTheDocument()
    })

    it('renders logo', () => {
      renderPage()

      // Multiple logos may appear (header + footer), just check at least one exists
      expect(screen.getAllByText('R').length).toBeGreaterThan(0)
      expect(screen.getAllByText('ecruitSpace').length).toBeGreaterThan(0)
    })
  })

  describe('navigation links', () => {
    it('renders forgot password link', () => {
      renderPage()

      const link = screen.getByRole('link', { name: 'Olvidaste tu contrasena?' })
      expect(link).toHaveAttribute('href', '/forgot-password')
    })

    it('renders candidate register link', () => {
      renderPage()

      const link = screen.getByRole('link', { name: 'Registrate como candidato' })
      expect(link).toHaveAttribute('href', '/register-candidate')
    })

    it('renders recruiter login link', () => {
      renderPage()

      const link = screen.getByRole('link', { name: 'Inicia sesion aqui' })
      expect(link).toHaveAttribute('href', '/login')
    })
  })

  describe('password visibility toggle', () => {
    it('password is hidden by default', () => {
      renderPage()

      expect(screen.getByLabelText(/Contraseña/)).toHaveAttribute('type', 'password')
    })

    it('toggles password visibility', async () => {
      const user = userEvent.setup()
      const { container } = renderPage()

      // The toggle button is inside a span with aria-hidden, so we find it by class
      const toggleButton = container.querySelector('button[class*="togglePassword"]') as HTMLButtonElement
      expect(toggleButton).toBeInTheDocument()
      await user.click(toggleButton)

      expect(screen.getByLabelText(/Contraseña/)).toHaveAttribute('type', 'text')
    })
  })

  describe('form submission', () => {
    it('calls loginCandidateAPI with credentials', async () => {
      const user = userEvent.setup()
      mockLoginCandidateAPI.mockResolvedValue({
        id: 'candidate-123',
        firstName: 'Jane',
        accessToken: 'token-123',
        role: 'candidate',
      })
      renderPage()

      await user.type(screen.getByLabelText(/Usuario o correo electronico/), 'jane@example.com')
      await user.type(screen.getByLabelText(/Contraseña/), 'password123')
      await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

      await waitFor(() => {
        expect(mockLoginCandidateAPI).toHaveBeenCalledWith({
          username: 'jane@example.com',
          password: 'password123',
        })
      })
    })

    it('navigates to portal on successful login', async () => {
      const user = userEvent.setup()
      mockLoginCandidateAPI.mockResolvedValue({
        id: 'candidate-123',
        firstName: 'Jane',
        accessToken: 'token-123',
        role: 'candidate',
      })
      renderPage()

      await user.type(screen.getByLabelText(/Usuario o correo electronico/), 'jane@example.com')
      await user.type(screen.getByLabelText(/Contraseña/), 'password123')
      await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/portal')
      })
    })

    it('shows error on failed login', async () => {
      const user = userEvent.setup()
      mockLoginCandidateAPI.mockRejectedValue(new Error('Invalid credentials'))
      renderPage()

      await user.type(screen.getByLabelText(/Usuario o correo electronico/), 'jane@example.com')
      await user.type(screen.getByLabelText(/Contraseña/), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Invalid credentials')
      })
    })
  })

  describe('resend verification', () => {
    it('shows resend section toggle', () => {
      renderPage()

      expect(screen.getByRole('button', { name: 'No has recibido el correo de verificacion?' })).toBeInTheDocument()
    })

    it('shows resend form when toggled', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.click(screen.getByRole('button', { name: 'No has recibido el correo de verificacion?' }))

      expect(screen.getByPlaceholderText('Tu email')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reenviar' })).toBeInTheDocument()
    })

    it('calls resendVerificationAPI', async () => {
      const user = userEvent.setup()
      mockResendVerificationAPI.mockResolvedValue(undefined)
      renderPage()

      await user.click(screen.getByRole('button', { name: 'No has recibido el correo de verificacion?' }))
      await user.type(screen.getByPlaceholderText('Tu email'), 'test@example.com')
      await user.click(screen.getByRole('button', { name: 'Reenviar' }))

      await waitFor(() => {
        expect(mockResendVerificationAPI).toHaveBeenCalledWith('test@example.com')
      })
    })
  })
})

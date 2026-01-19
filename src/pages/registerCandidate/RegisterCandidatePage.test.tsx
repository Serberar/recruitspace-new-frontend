import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import RegisterCandidatePage from './RegisterCandidatePage'
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
const mockRegisterCandidateAPI = vi.fn()
const mockResendVerificationAPI = vi.fn()
vi.mock('../../features/auth/services/authService', () => ({
  registerCandidateAPI: (data: Record<string, string>) => mockRegisterCandidateAPI(data),
  resendVerificationAPI: (email: string) => mockResendVerificationAPI(email),
}))

// Mock error handler
vi.mock('../../hooks/useErrorHandler', () => ({
  getErrorMessage: (err: Error) => err.message,
}))

const renderPage = () => {
  return render(
    <ToastProvider>
      <BrowserRouter>
        <RegisterCandidatePage />
      </BrowserRouter>
    </ToastProvider>
  )
}

describe('RegisterCandidatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders register form', () => {
      renderPage()

      expect(screen.getByRole('heading', { name: 'Crear cuenta de candidato' })).toBeInTheDocument()
    })

    it('renders all form fields', () => {
      renderPage()

      expect(screen.getByLabelText(/Nombre/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Apellido/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Email/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Telefono/)).toBeInTheDocument()
      expect(screen.getByLabelText(/^Contrasena/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Confirmar contrasena/)).toBeInTheDocument()
    })

    it('renders submit button', () => {
      renderPage()

      expect(screen.getByRole('button', { name: 'Crear cuenta' })).toBeInTheDocument()
    })

    it('renders logo', () => {
      renderPage()

      // Multiple logos may appear (header + footer), just check at least one exists
      expect(screen.getAllByText('R').length).toBeGreaterThan(0)
      expect(screen.getAllByText('ecruitSpace').length).toBeGreaterThan(0)
    })
  })

  describe('navigation links', () => {
    it('renders login link', () => {
      renderPage()

      const link = screen.getByRole('link', { name: 'Inicia sesion' })
      expect(link).toHaveAttribute('href', '/login-candidate')
    })

    it('renders recruiter register link', () => {
      renderPage()

      const link = screen.getByRole('link', { name: 'Registrate aqui' })
      expect(link).toHaveAttribute('href', '/register')
    })
  })

  describe('password visibility toggle', () => {
    it('password is hidden by default', () => {
      renderPage()

      const passwordInputs = screen.getAllByPlaceholderText(/caracteres|contrasena/i)
      passwordInputs.forEach(input => {
        expect(input).toHaveAttribute('type', 'password')
      })
    })

    it('toggles password visibility', async () => {
      const user = userEvent.setup()
      renderPage()

      const toggleButton = screen.getByRole('button', { name: 'Mostrar contrasena' })
      await user.click(toggleButton)

      const passwordInput = screen.getByLabelText(/^Contrasena/)
      expect(passwordInput).toHaveAttribute('type', 'text')
    })
  })

  describe('form validation', () => {
    it('shows error for short first name', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.type(screen.getByLabelText(/Nombre/), 'J')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      await waitFor(() => {
        expect(screen.getByText('El nombre debe tener al menos 2 caracteres')).toBeInTheDocument()
      })
    })

    it('shows error for short last name', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.type(screen.getByLabelText(/Nombre/), 'John')
      await user.type(screen.getByLabelText(/Apellido/), 'D')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      await waitFor(() => {
        expect(screen.getByText('El apellido debe tener al menos 2 caracteres')).toBeInTheDocument()
      })
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      renderPage()

      // The email input has HTML5 validation (type="email")
      // This test verifies the input exists and has proper attributes
      const emailInput = screen.getByLabelText(/Email/)
      expect(emailInput).toHaveAttribute('type', 'email')
      expect(emailInput).toHaveAttribute('autocomplete', 'email')

      // Type a valid email and verify it's accepted
      await user.type(emailInput, 'valid@example.com')
      expect(emailInput).toHaveValue('valid@example.com')
    })

    it('shows error for short password', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.type(screen.getByLabelText(/Nombre/), 'John')
      await user.type(screen.getByLabelText(/Apellido/), 'Doe')
      await user.type(screen.getByLabelText(/Email/), 'john@example.com')
      await user.type(screen.getByLabelText(/^Contrasena/), '12345')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      await waitFor(() => {
        expect(screen.getByText('La contrasena debe tener al menos 6 caracteres')).toBeInTheDocument()
      })
    })

    it('shows error for mismatched passwords', async () => {
      const user = userEvent.setup()
      renderPage()

      await user.type(screen.getByLabelText(/Nombre/), 'John')
      await user.type(screen.getByLabelText(/Apellido/), 'Doe')
      await user.type(screen.getByLabelText(/Email/), 'john@example.com')
      await user.type(screen.getByLabelText(/^Contrasena/), 'password123')
      await user.type(screen.getByLabelText(/Confirmar contrasena/), 'different')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      await waitFor(() => {
        expect(screen.getByText('Las contrasenas no coinciden')).toBeInTheDocument()
      })
    })
  })

  describe('form submission', () => {
    it('calls registerCandidateAPI with form data', async () => {
      const user = userEvent.setup()
      mockRegisterCandidateAPI.mockResolvedValue({
        id: 'candidate-123',
        email: 'john@example.com',
      })
      renderPage()

      await user.type(screen.getByLabelText(/Nombre/), 'John')
      await user.type(screen.getByLabelText(/Apellido/), 'Doe')
      await user.type(screen.getByLabelText(/Email/), 'john@example.com')
      await user.type(screen.getByLabelText(/Telefono/), '+34600000000')
      await user.type(screen.getByLabelText(/^Contrasena/), 'password123')
      await user.type(screen.getByLabelText(/Confirmar contrasena/), 'password123')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      await waitFor(() => {
        expect(mockRegisterCandidateAPI).toHaveBeenCalledWith({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
          phone: '+34600000000',
        })
      })
    })

    it('shows success state after registration', async () => {
      const user = userEvent.setup()
      mockRegisterCandidateAPI.mockResolvedValue({
        id: 'candidate-123',
        email: 'john@example.com',
      })
      renderPage()

      await user.type(screen.getByLabelText(/Nombre/), 'John')
      await user.type(screen.getByLabelText(/Apellido/), 'Doe')
      await user.type(screen.getByLabelText(/Email/), 'john@example.com')
      await user.type(screen.getByLabelText(/^Contrasena/), 'password123')
      await user.type(screen.getByLabelText(/Confirmar contrasena/), 'password123')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      await waitFor(() => {
        expect(screen.getByText('Registro exitoso')).toBeInTheDocument()
      })
    })

    it('shows registered email in success message', async () => {
      const user = userEvent.setup()
      mockRegisterCandidateAPI.mockResolvedValue({
        id: 'candidate-123',
        email: 'john@example.com',
      })
      renderPage()

      await user.type(screen.getByLabelText(/Nombre/), 'John')
      await user.type(screen.getByLabelText(/Apellido/), 'Doe')
      await user.type(screen.getByLabelText(/Email/), 'john@example.com')
      await user.type(screen.getByLabelText(/^Contrasena/), 'password123')
      await user.type(screen.getByLabelText(/Confirmar contrasena/), 'password123')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      await waitFor(() => {
        expect(screen.getByText(/john@example.com/)).toBeInTheDocument()
      })
    })

    it('shows error on failed registration', async () => {
      const user = userEvent.setup()
      mockRegisterCandidateAPI.mockRejectedValue(new Error('Email already exists'))
      renderPage()

      await user.type(screen.getByLabelText(/Nombre/), 'John')
      await user.type(screen.getByLabelText(/Apellido/), 'Doe')
      await user.type(screen.getByLabelText(/Email/), 'existing@example.com')
      await user.type(screen.getByLabelText(/^Contrasena/), 'password123')
      await user.type(screen.getByLabelText(/Confirmar contrasena/), 'password123')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent('Email already exists')
      })
    })
  })

  describe('success state', () => {
    it('has login button in success state', async () => {
      const user = userEvent.setup()
      mockRegisterCandidateAPI.mockResolvedValue({ id: '123' })
      renderPage()

      await user.type(screen.getByLabelText(/Nombre/), 'John')
      await user.type(screen.getByLabelText(/Apellido/), 'Doe')
      await user.type(screen.getByLabelText(/Email/), 'john@example.com')
      await user.type(screen.getByLabelText(/^Contrasena/), 'password123')
      await user.type(screen.getByLabelText(/Confirmar contrasena/), 'password123')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Ir a iniciar sesion' })).toBeInTheDocument()
      })
    })

    it('navigates to login on button click', async () => {
      const user = userEvent.setup()
      mockRegisterCandidateAPI.mockResolvedValue({ id: '123' })
      renderPage()

      await user.type(screen.getByLabelText(/Nombre/), 'John')
      await user.type(screen.getByLabelText(/Apellido/), 'Doe')
      await user.type(screen.getByLabelText(/Email/), 'john@example.com')
      await user.type(screen.getByLabelText(/^Contrasena/), 'password123')
      await user.type(screen.getByLabelText(/Confirmar contrasena/), 'password123')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Ir a iniciar sesion' }))
      })

      expect(mockNavigate).toHaveBeenCalledWith('/login')
    })

    it('has resend verification option', async () => {
      const user = userEvent.setup()
      mockRegisterCandidateAPI.mockResolvedValue({ id: '123' })
      renderPage()

      await user.type(screen.getByLabelText(/Nombre/), 'John')
      await user.type(screen.getByLabelText(/Apellido/), 'Doe')
      await user.type(screen.getByLabelText(/Email/), 'john@example.com')
      await user.type(screen.getByLabelText(/^Contrasena/), 'password123')
      await user.type(screen.getByLabelText(/Confirmar contrasena/), 'password123')
      await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Reenviar correo de verificacion' })).toBeInTheDocument()
      })
    })
  })
})

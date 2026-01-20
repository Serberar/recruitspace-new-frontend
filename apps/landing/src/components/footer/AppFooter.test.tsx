import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { AppFooter } from './AppFooter'
import { ToastProvider } from '../ui/Toast'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'footer.privacy': 'Privacidad',
        'footer.terms': 'Términos',
        'footer.cookies': 'Cookies',
        'footer.contact': 'Contacto',
        'footer.reportProblem': 'Reportar problema',
        'feedback.title': 'Enviar feedback',
        'feedback.type': 'Tipo',
        'feedback.typeBug': 'Bug',
        'feedback.typeSuggestion': 'Sugerencia',
        'feedback.typeQuestion': 'Pregunta',
        'feedback.description': 'Descripcion',
        'feedback.descriptionPlaceholder': 'Describe el problema...',
        'feedback.email': 'Email',
        'feedback.emailPlaceholder': 'tu@email.com',
        'feedback.emailHint': 'Opcional',
        'feedback.submit': 'Enviar',
        'app.cancel': 'Cancelar',
      }
      return translations[key] || key
    },
    i18n: {
      language: 'es',
      changeLanguage: vi.fn(),
    },
  }),
}))

// Mock feedbackApi
vi.mock('../../services/feedbackApi', () => ({
  feedbackApi: {
    create: vi.fn().mockResolvedValue({}),
  },
  getBrowserInfo: vi.fn().mockReturnValue('Test Browser'),
}))

const renderFooter = (props = {}) => {
  return render(
    <ToastProvider>
      <BrowserRouter>
        <AppFooter {...props} />
      </BrowserRouter>
    </ToastProvider>
  )
}

describe('AppFooter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders footer element', () => {
      renderFooter()
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('renders language selector', () => {
      renderFooter()
      expect(screen.getByLabelText('Select language')).toBeInTheDocument()
    })

    it('renders logo', () => {
      renderFooter()
      expect(screen.getByText('R')).toBeInTheDocument()
      expect(screen.getByText('ecruitSpace')).toBeInTheDocument()
    })

    it('shows current year in copyright', () => {
      renderFooter()
      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument()
    })
  })

  describe('full variant (default)', () => {
    it('renders all navigation links', () => {
      renderFooter()

      expect(screen.getByRole('link', { name: 'Privacidad' })).toHaveAttribute('href', '/privacy')
      expect(screen.getByRole('link', { name: 'Términos' })).toHaveAttribute('href', '/terms')
      expect(screen.getByRole('link', { name: 'Cookies' })).toHaveAttribute('href', '/cookies')
      expect(screen.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/contact')
    })

    it('renders feedback button', () => {
      renderFooter()
      expect(screen.getByRole('button', { name: 'Reportar problema' })).toBeInTheDocument()
    })
  })

  describe('minimal variant', () => {
    it('does not render navigation links', () => {
      renderFooter({ variant: 'minimal' })

      expect(screen.queryByRole('link', { name: 'Privacidad' })).not.toBeInTheDocument()
      expect(screen.queryByRole('link', { name: 'Términos' })).not.toBeInTheDocument()
    })

    it('still renders feedback button', () => {
      renderFooter({ variant: 'minimal' })
      expect(screen.getByRole('button', { name: 'Reportar problema' })).toBeInTheDocument()
    })

    it('applies minimal class', () => {
      renderFooter({ variant: 'minimal' })
      const footer = screen.getByRole('contentinfo')
      expect(footer.className).toContain('minimal')
    })
  })

  describe('dark theme', () => {
    it('applies dark class', () => {
      renderFooter({ theme: 'dark' })
      const footer = screen.getByRole('contentinfo')
      expect(footer.className).toContain('dark')
    })
  })

  describe('feedback modal', () => {
    it('opens feedback modal when button is clicked', async () => {
      const user = userEvent.setup()
      renderFooter()

      await user.click(screen.getByRole('button', { name: 'Reportar problema' }))

      expect(screen.getByText('Enviar feedback')).toBeInTheDocument()
    })

    it('closes feedback modal when close button is clicked', async () => {
      const user = userEvent.setup()
      renderFooter()

      await user.click(screen.getByRole('button', { name: 'Reportar problema' }))
      expect(screen.getByText('Enviar feedback')).toBeInTheDocument()

      await user.click(screen.getByRole('button', { name: 'Cerrar' }))
      expect(screen.queryByText('Enviar feedback')).not.toBeInTheDocument()
    })
  })
})

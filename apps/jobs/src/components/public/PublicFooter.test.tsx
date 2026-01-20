import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { PublicFooter } from './PublicFooter'
import { ToastProvider } from '../ui/Toast'

// Mock i18n
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
      changeLanguage: vi.fn(),
    },
  }),
}))

const renderFooter = () => {
  return render(
    <ToastProvider>
      <BrowserRouter>
        <PublicFooter />
      </BrowserRouter>
    </ToastProvider>
  )
}

describe('PublicFooter', () => {
  describe('rendering', () => {
    it('renders footer element', () => {
      renderFooter()

      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })

    it('renders language selector', () => {
      renderFooter()

      // LanguageSelector (default variant) renders a select with aria-label
      expect(screen.getByLabelText('Select language')).toBeInTheDocument()
    })
  })

  describe('branding', () => {
    it('shows RecruitSpace brand name', () => {
      renderFooter()

      // Logo component renders the brand name
      expect(screen.getByText('ecruitSpace')).toBeInTheDocument()
    })
  })

  describe('copyright', () => {
    it('shows current year in copyright', () => {
      renderFooter()

      const currentYear = new Date().getFullYear()
      expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument()
    })
  })
})

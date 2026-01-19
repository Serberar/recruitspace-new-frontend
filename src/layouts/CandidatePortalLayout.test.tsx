import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import CandidatePortalLayout from './CandidatePortalLayout'
import { ToastProvider } from '../components/ui/Toast'

// Mock the CandidateMenu component
vi.mock('../components/candidateMenu', () => ({
  CandidateMenu: () => <nav data-testid="candidate-menu">Candidate Menu</nav>,
}))

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

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ToastProvider>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </ToastProvider>
  )
}

describe('CandidatePortalLayout', () => {
  describe('rendering', () => {
    it('renders children', () => {
      renderWithProviders(
        <CandidatePortalLayout>
          <div data-testid="child">Child Content</div>
        </CandidatePortalLayout>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('Child Content')).toBeInTheDocument()
    })

    it('renders the CandidateMenu component', () => {
      renderWithProviders(
        <CandidatePortalLayout>
          <div>Content</div>
        </CandidatePortalLayout>
      )

      expect(screen.getByTestId('candidate-menu')).toBeInTheDocument()
    })

    it('renders main content area', () => {
      renderWithProviders(
        <CandidatePortalLayout>
          <div>Content</div>
        </CandidatePortalLayout>
      )

      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })
  })

  describe('layout structure', () => {
    it('has layout wrapper with minimum height', () => {
      const { container } = renderWithProviders(
        <CandidatePortalLayout>
          <div>Content</div>
        </CandidatePortalLayout>
      )

      expect(container.firstChild).toHaveStyle({ minHeight: '100vh' })
    })

    it('main element has proper styling', () => {
      renderWithProviders(
        <CandidatePortalLayout>
          <div>Content</div>
        </CandidatePortalLayout>
      )

      const main = screen.getByRole('main')
      expect(main).toHaveStyle({ maxWidth: '1200px', margin: '0 auto' })
    })

    it('renders multiple children', () => {
      renderWithProviders(
        <CandidatePortalLayout>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </CandidatePortalLayout>
      )

      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
    })
  })
})

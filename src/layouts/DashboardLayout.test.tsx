import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import DashboardLayout from './DashboardLayout'
import { ToastProvider } from '../components/ui/Toast'

// Mock the Menu component
vi.mock('../components/menu/Menu', () => ({
  default: () => <nav data-testid="menu">Menu Component</nav>,
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

describe('DashboardLayout', () => {
  describe('rendering', () => {
    it('renders children', () => {
      renderWithProviders(
        <DashboardLayout>
          <div data-testid="child">Child Content</div>
        </DashboardLayout>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
      expect(screen.getByText('Child Content')).toBeInTheDocument()
    })

    it('renders the Menu component', () => {
      renderWithProviders(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      )

      expect(screen.getByTestId('menu')).toBeInTheDocument()
    })

    it('renders main content area', () => {
      renderWithProviders(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      )

      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })
  })

  describe('layout structure', () => {
    it('has layout wrapper with correct class', () => {
      const { container } = renderWithProviders(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      )

      // CSS Modules adds hash to class names, so check if class contains 'layout'
      expect(container.firstChild?.className).toMatch(/layout/)
    })

    it('main element has correct class', () => {
      renderWithProviders(
        <DashboardLayout>
          <div>Content</div>
        </DashboardLayout>
      )

      const main = screen.getByRole('main')
      // CSS Modules adds hash to class names
      expect(main.className).toMatch(/main/)
    })

    it('renders multiple children', () => {
      renderWithProviders(
        <DashboardLayout>
          <div data-testid="child1">Child 1</div>
          <div data-testid="child2">Child 2</div>
        </DashboardLayout>
      )

      expect(screen.getByTestId('child1')).toBeInTheDocument()
      expect(screen.getByTestId('child2')).toBeInTheDocument()
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SysadminLayout from './SysadminLayout'
import { ToastProvider } from '../components/ui/Toast'

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock Redux dispatch
const mockDispatch = vi.fn()
vi.mock('../hooks/reduxHooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

// Mock logout API
vi.mock('../features/sysadmin/services/sysadminAuthService', () => ({
  logoutSysadminAPI: vi.fn(),
}))

// Mock sysadminSlice
vi.mock('../features/sysadmin/sysadminSlice', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>
  return {
    ...actual,
    sysadminLogout: vi.fn(() => ({ type: 'sysadmin/logout' })),
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

const renderWithRouter = (ui: React.ReactElement, initialEntry = '/sysadmin/dashboard') => {
  return render(
    <ToastProvider>
      <MemoryRouter initialEntries={[initialEntry]}>
        {ui}
      </MemoryRouter>
    </ToastProvider>
  )
}

describe('SysadminLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders children', () => {
      renderWithRouter(
        <SysadminLayout>
          <div data-testid="child">Child Content</div>
        </SysadminLayout>
      )

      expect(screen.getByTestId('child')).toBeInTheDocument()
    })

    it('renders brand name', () => {
      renderWithRouter(
        <SysadminLayout>
          <div>Content</div>
        </SysadminLayout>
      )

      // Logo component splits the brand name
      expect(screen.getAllByText('ecruitSpace').length).toBeGreaterThan(0)
      expect(screen.getByText('System Administration')).toBeInTheDocument()
    })

    it('renders main content area', () => {
      renderWithRouter(
        <SysadminLayout>
          <div>Content</div>
        </SysadminLayout>
      )

      const main = screen.getByRole('main')
      expect(main).toBeInTheDocument()
    })

    it('renders footer', () => {
      renderWithRouter(
        <SysadminLayout>
          <div>Content</div>
        </SysadminLayout>
      )

      // AppFooter should render with minimal variant
      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('renders Dashboard link', () => {
      renderWithRouter(
        <SysadminLayout>
          <div>Content</div>
        </SysadminLayout>
      )

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      expect(dashboardLink).toBeInTheDocument()
      expect(dashboardLink).toHaveAttribute('href', '/sysadmin/dashboard')
    })

    it('renders Settings link', () => {
      renderWithRouter(
        <SysadminLayout>
          <div>Content</div>
        </SysadminLayout>
      )

      const settingsLink = screen.getByRole('link', { name: /configuración/i })
      expect(settingsLink).toBeInTheDocument()
      expect(settingsLink).toHaveAttribute('href', '/sysadmin/settings')
    })

    it('highlights active Dashboard link', () => {
      renderWithRouter(
        <SysadminLayout>
          <div>Content</div>
        </SysadminLayout>,
        '/sysadmin/dashboard'
      )

      const dashboardLink = screen.getByRole('link', { name: /dashboard/i })
      // CSS Modules adds hash to class names
      expect(dashboardLink.className).toMatch(/navLinkActive/)
    })

    it('highlights active Settings link', () => {
      renderWithRouter(
        <SysadminLayout>
          <div>Content</div>
        </SysadminLayout>,
        '/sysadmin/settings'
      )

      const settingsLink = screen.getByRole('link', { name: /configuración/i })
      // CSS Modules adds hash to class names
      expect(settingsLink.className).toMatch(/navLinkActive/)
    })
  })

  describe('logout', () => {
    it('renders logout button', () => {
      renderWithRouter(
        <SysadminLayout>
          <div>Content</div>
        </SysadminLayout>
      )

      expect(screen.getByRole('button', { name: /cerrar sesión/i })).toBeInTheDocument()
    })

    it('calls logout on button click', async () => {
      const user = userEvent.setup()

      renderWithRouter(
        <SysadminLayout>
          <div>Content</div>
        </SysadminLayout>
      )

      const logoutButton = screen.getByRole('button', { name: /cerrar sesión/i })
      await user.click(logoutButton)

      expect(mockDispatch).toHaveBeenCalled()
      expect(mockNavigate).toHaveBeenCalledWith('/sysadmin/login')
    })
  })

  describe('layout structure', () => {
    it('has layout wrapper with correct class', () => {
      const { container } = renderWithRouter(
        <SysadminLayout>
          <div>Content</div>
        </SysadminLayout>
      )

      // CSS Modules adds hash, so use attribute selector
      expect(container.querySelector('[class*="layout"]')).toBeInTheDocument()
    })

    it('has header element', () => {
      renderWithRouter(
        <SysadminLayout>
          <div>Content</div>
        </SysadminLayout>
      )

      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('has nav element', () => {
      renderWithRouter(
        <SysadminLayout>
          <div>Content</div>
        </SysadminLayout>
      )

      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('has footer element', () => {
      renderWithRouter(
        <SysadminLayout>
          <div>Content</div>
        </SysadminLayout>
      )

      expect(screen.getByRole('contentinfo')).toBeInTheDocument()
    })
  })

  describe('icons', () => {
    it('renders shield icon in brand', () => {
      const { container } = renderWithRouter(
        <SysadminLayout>
          <div>Content</div>
        </SysadminLayout>
      )

      // Check for SVG icons
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })
})

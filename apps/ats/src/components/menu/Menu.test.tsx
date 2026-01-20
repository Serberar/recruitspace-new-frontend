import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Menu from './Menu'

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock useRole
vi.mock('../../hooks/useRole', () => ({
  useRole: () => 'recruiter',
}))

// Mock redux
const mockDispatch = vi.fn()
vi.mock('../../hooks/reduxHooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

// Mock authSlice
vi.mock('../../store/slices/authSlice', () => ({
  logout: vi.fn(() => ({ type: 'auth/logout' })),
}))

// Mock authService
const mockLogoutUser = vi.fn()
vi.mock('../../services/authService', () => ({
  logoutUser: () => mockLogoutUser(),
}))

// Mock menuConfig
vi.mock('../../routes/menuConfig', () => ({
  getGroupedMenuItems: () => ({
    main: [
      { path: '/app/dashboard', label: 'nav.dashboard', icon: 'dashboard' },
      { path: '/app/offers', label: 'nav.offers', icon: 'briefcase' },
    ],
    settings: [
      { path: '/app/settings/profile', label: 'nav.profile', icon: 'user' },
    ],
    org_admin: [],
  }),
}))

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common:nav.dashboard': 'Dashboard',
        'common:nav.offers': 'Ofertas',
        'common:nav.profile': 'Perfil',
        'common:nav.logout': 'Cerrar sesion',
      }
      return translations[key] || key
    },
  }),
}))

const renderMenu = (initialEntry = '/app/dashboard') => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Menu />
    </MemoryRouter>
  )
}

describe('Menu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLogoutUser.mockResolvedValue(true)
  })

  describe('rendering', () => {
    it('renders header element', () => {
      renderMenu()
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('renders logo link to /app', () => {
      renderMenu()
      const logoLink = screen.getByRole('link', { name: /ecruitSpace/i })
      expect(logoLink).toHaveAttribute('href', '/app')
    })

    it('renders navigation links', () => {
      renderMenu()
      expect(screen.getAllByRole('link', { name: /Dashboard/i }).length).toBeGreaterThan(0)
      expect(screen.getAllByRole('link', { name: /Ofertas/i }).length).toBeGreaterThan(0)
      expect(screen.getAllByRole('link', { name: /Perfil/i }).length).toBeGreaterThan(0)
    })

    it('renders logout button', () => {
      renderMenu()
      // Both desktop and mobile logout buttons exist
      expect(screen.getAllByRole('button', { name: /Cerrar sesion/i }).length).toBeGreaterThan(0)
    })

    it('renders hamburger menu button for mobile', () => {
      renderMenu()
      expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
    })
  })

  describe('navigation', () => {
    it('links have correct href attributes', () => {
      renderMenu()

      const dashboardLinks = screen.getAllByRole('link', { name: /Dashboard/i })
      const ofertasLinks = screen.getAllByRole('link', { name: /Ofertas/i })
      const perfilLinks = screen.getAllByRole('link', { name: /Perfil/i })

      expect(dashboardLinks[0]).toHaveAttribute('href', '/app/dashboard')
      expect(ofertasLinks[0]).toHaveAttribute('href', '/app/offers')
      expect(perfilLinks[0]).toHaveAttribute('href', '/app/settings/profile')
    })

    it('highlights active link', () => {
      renderMenu('/app/dashboard')

      const dashboardLinks = screen.getAllByRole('link', { name: /Dashboard/i })
      expect(dashboardLinks[0].className).toContain('navLinkActive')
    })
  })

  describe('logout', () => {
    it('calls logout when button is clicked', async () => {
      const user = userEvent.setup()
      renderMenu()

      const logoutButtons = screen.getAllByRole('button', { name: /Cerrar sesion/i })
      await user.click(logoutButtons[0])

      await waitFor(() => {
        expect(mockLogoutUser).toHaveBeenCalled()
      })
    })

    it('dispatches logout action on successful logout', async () => {
      const user = userEvent.setup()
      renderMenu()

      const logoutButtons = screen.getAllByRole('button', { name: /Cerrar sesion/i })
      await user.click(logoutButtons[0])

      await waitFor(() => {
        expect(mockDispatch).toHaveBeenCalled()
      })
    })

    it('navigates to /login after logout', async () => {
      const user = userEvent.setup()
      renderMenu()

      const logoutButtons = screen.getAllByRole('button', { name: /Cerrar sesion/i })
      await user.click(logoutButtons[0])

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true })
      })
    })

    it('does not navigate if logout fails', async () => {
      mockLogoutUser.mockResolvedValue(false)
      const user = userEvent.setup()
      renderMenu()

      const logoutButtons = screen.getAllByRole('button', { name: /Cerrar sesion/i })
      await user.click(logoutButtons[0])

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled()
      })
    })
  })

  describe('mobile menu', () => {
    it('opens mobile menu when hamburger is clicked', async () => {
      const user = userEvent.setup()
      const { container } = renderMenu()

      const hamburger = screen.getByRole('button', { name: 'Menu' })
      await user.click(hamburger)

      const mobileMenu = container.querySelector('[class*="mobileMenuOpen"]')
      expect(mobileMenu).toBeInTheDocument()
    })

    it('closes mobile menu when clicking overlay', async () => {
      const user = userEvent.setup()
      const { container } = renderMenu()

      // Open menu
      await user.click(screen.getByRole('button', { name: 'Menu' }))

      // Click overlay
      const overlay = container.querySelector('[class*="overlay"]')
      expect(overlay).toBeInTheDocument()
      await user.click(overlay!)

      // Menu should be closed (no mobileMenuOpen class)
      const mobileMenu = container.querySelector('[class*="mobileMenuOpen"]')
      expect(mobileMenu).not.toBeInTheDocument()
    })

    it('closes mobile menu when clicking a nav link', async () => {
      const user = userEvent.setup()
      const { container } = renderMenu()

      // Open menu
      await user.click(screen.getByRole('button', { name: 'Menu' }))

      // Click a link
      const links = screen.getAllByRole('link', { name: /Dashboard/i })
      await user.click(links[0])

      // Menu should be closed
      const mobileMenu = container.querySelector('[class*="mobileMenuOpen"]')
      expect(mobileMenu).not.toBeInTheDocument()
    })
  })
})

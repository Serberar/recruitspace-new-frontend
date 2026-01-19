import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CandidateMenu from './CandidateMenu'

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock redux
const mockDispatch = vi.fn()
vi.mock('../../hooks/reduxHooks', () => ({
  useAppDispatch: () => mockDispatch,
}))

// Mock authSlice
vi.mock('../../features/auth/authSlice', () => ({
  logout: vi.fn(() => ({ type: 'auth/logout' })),
}))

// Mock authService
const mockLogoutUser = vi.fn()
vi.mock('../../features/auth/services/authService', () => ({
  logoutUser: () => mockLogoutUser(),
}))

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'candidatePortal.menu.dashboard': 'Mi Portal',
        'candidatePortal.menu.cv': 'Mi CV',
        'candidatePortal.menu.profile': 'Mi Perfil',
        'candidatePortal.menu.jobOffers': 'Ofertas de trabajo',
        'nav.logout': 'Cerrar sesion',
      }
      return translations[key] || key
    },
  }),
}))

const renderMenu = (initialEntry = '/portal') => {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <CandidateMenu />
    </MemoryRouter>
  )
}

describe('CandidateMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLogoutUser.mockResolvedValue(true)
  })

  describe('rendering', () => {
    it('renders header element', () => {
      renderMenu()
      expect(screen.getByRole('banner')).toBeInTheDocument()
    })

    it('renders logo link to /portal', () => {
      renderMenu()
      const logoLink = screen.getByRole('link', { name: /ecruitSpace/i })
      expect(logoLink).toHaveAttribute('href', '/portal')
    })

    it('renders all menu items', () => {
      renderMenu()
      // Desktop and mobile menus render the same links
      expect(screen.getAllByRole('link', { name: /Mi Portal/i }).length).toBeGreaterThan(0)
      expect(screen.getAllByRole('link', { name: /Mi CV/i }).length).toBeGreaterThan(0)
      expect(screen.getAllByRole('link', { name: /Mi Perfil/i }).length).toBeGreaterThan(0)
      expect(screen.getAllByRole('link', { name: /Ofertas de trabajo/i }).length).toBeGreaterThan(0)
    })

    it('renders logout button', () => {
      renderMenu()
      // Both desktop and mobile logout buttons exist
      expect(screen.getAllByRole('button', { name: /Cerrar sesion/i }).length).toBeGreaterThan(0)
    })

    it('renders hamburger menu button', () => {
      renderMenu()
      expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
    })

    it('renders SVG icons for each menu item', () => {
      const { container } = renderMenu()
      const svgs = container.querySelectorAll('svg')
      expect(svgs.length).toBeGreaterThan(0)
    })
  })

  describe('navigation', () => {
    it('links have correct href attributes', () => {
      renderMenu()

      const portalLinks = screen.getAllByRole('link', { name: /Mi Portal/i })
      const cvLinks = screen.getAllByRole('link', { name: /Mi CV/i })
      const profileLinks = screen.getAllByRole('link', { name: /Mi Perfil/i })
      const jobsLinks = screen.getAllByRole('link', { name: /Ofertas de trabajo/i })

      expect(portalLinks[0]).toHaveAttribute('href', '/portal')
      expect(cvLinks[0]).toHaveAttribute('href', '/portal/cv')
      expect(profileLinks[0]).toHaveAttribute('href', '/portal/profile')
      expect(jobsLinks[0]).toHaveAttribute('href', '/jobs')
    })

    it('highlights active portal link', () => {
      renderMenu('/portal')

      const portalLinks = screen.getAllByRole('link', { name: /Mi Portal/i })
      expect(portalLinks[0].className).toContain('navLinkActive')
    })

    it('highlights active CV link', () => {
      renderMenu('/portal/cv')

      const cvLinks = screen.getAllByRole('link', { name: /Mi CV/i })
      expect(cvLinks[0].className).toContain('navLinkActive')
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

      await user.click(screen.getByRole('button', { name: 'Menu' }))

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

      // Menu should be closed
      const mobileMenu = container.querySelector('[class*="mobileMenuOpen"]')
      expect(mobileMenu).not.toBeInTheDocument()
    })

    it('closes mobile menu when clicking a nav link', async () => {
      const user = userEvent.setup()
      const { container } = renderMenu()

      // Open menu
      await user.click(screen.getByRole('button', { name: 'Menu' }))

      // Click a link (get the first one in mobile menu)
      const links = screen.getAllByRole('link', { name: /Mi Portal/i })
      await user.click(links[0])

      // Menu should be closed
      const mobileMenu = container.querySelector('[class*="mobileMenuOpen"]')
      expect(mobileMenu).not.toBeInTheDocument()
    })

    it('renders mobile logout button', async () => {
      const user = userEvent.setup()
      renderMenu()

      await user.click(screen.getByRole('button', { name: 'Menu' }))

      // Should have both desktop and mobile logout buttons
      const logoutButtons = screen.getAllByRole('button', { name: /Cerrar sesion/i })
      expect(logoutButtons.length).toBeGreaterThanOrEqual(2)
    })
  })
})

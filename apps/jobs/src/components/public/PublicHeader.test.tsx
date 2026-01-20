import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, createAuthenticatedState, createUnauthenticatedState } from '../../test/test-utils'
import { PublicHeader } from './PublicHeader'

// Mock authService
vi.mock('../../features/auth/services/authService', () => ({
  logoutUser: vi.fn().mockResolvedValue({}),
}))

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'public.header.login': 'Iniciar sesión',
        'public.header.register': 'Registrarse',
        'public.header.myAccount': 'Mi cuenta',
        'public.header.myPortal': 'Mi portal',
        'public.header.myProfile': 'Mi perfil',
        'public.header.logout': 'Cerrar sesión',
      }
      return translations[key] || key
    },
  }),
}))

describe('PublicHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('unauthenticated state', () => {
    it('shows login and register links when not logged in', () => {
      render(<PublicHeader />, {
        preloadedState: createUnauthenticatedState(),
        useMemoryRouter: true,
      })

      expect(screen.getByText('Iniciar sesión')).toBeInTheDocument()
      expect(screen.getByText('Registrarse')).toBeInTheDocument()
    })

    it('login link navigates to /login-candidate', () => {
      render(<PublicHeader />, {
        preloadedState: createUnauthenticatedState(),
        useMemoryRouter: true,
      })

      const loginLink = screen.getByText('Iniciar sesión')
      expect(loginLink.closest('a')).toHaveAttribute('href', '/login-candidate')
    })

    it('register link navigates to /register-candidate', () => {
      render(<PublicHeader />, {
        preloadedState: createUnauthenticatedState(),
        useMemoryRouter: true,
      })

      const registerLink = screen.getByText('Registrarse')
      expect(registerLink.closest('a')).toHaveAttribute('href', '/register-candidate')
    })
  })

  describe('authenticated state', () => {
    it('shows user menu when logged in', () => {
      render(<PublicHeader />, {
        preloadedState: createAuthenticatedState({ user: 'Juan' }),
        useMemoryRouter: true,
      })

      expect(screen.getByText('Juan')).toBeInTheDocument()
      expect(screen.getByText('J')).toBeInTheDocument() // Avatar initial
    })

    it('shows user avatar with first letter uppercase', () => {
      render(<PublicHeader />, {
        preloadedState: createAuthenticatedState({ user: 'maria' }),
        useMemoryRouter: true,
      })

      expect(screen.getByText('M')).toBeInTheDocument()
    })

    it('opens dropdown menu on click', async () => {
      const user = userEvent.setup()
      render(<PublicHeader />, {
        preloadedState: createAuthenticatedState({ user: 'Test User' }),
        useMemoryRouter: true,
      })

      const menuButton = screen.getByRole('button', { expanded: false })
      await user.click(menuButton)

      expect(screen.getByText('Mi portal')).toBeInTheDocument()
      expect(screen.getByText('Cerrar sesión')).toBeInTheDocument()
    })

    it('shows profile link for candidates', async () => {
      const user = userEvent.setup()
      render(<PublicHeader />, {
        preloadedState: createAuthenticatedState({ user: 'Candidate', role: 'candidate' }),
        useMemoryRouter: true,
      })

      const menuButton = screen.getByRole('button', { expanded: false })
      await user.click(menuButton)

      expect(screen.getByText('Mi perfil')).toBeInTheDocument()
    })

    it('does not show profile link for non-candidates', async () => {
      const user = userEvent.setup()
      render(<PublicHeader />, {
        preloadedState: createAuthenticatedState({ user: 'Admin', role: 'org_admin' }),
        useMemoryRouter: true,
      })

      const menuButton = screen.getByRole('button', { expanded: false })
      await user.click(menuButton)

      expect(screen.queryByText('Mi perfil')).not.toBeInTheDocument()
    })

    it('portal link goes to /portal for candidates', async () => {
      const user = userEvent.setup()
      render(<PublicHeader />, {
        preloadedState: createAuthenticatedState({ user: 'Candidate', role: 'candidate' }),
        useMemoryRouter: true,
      })

      const menuButton = screen.getByRole('button', { expanded: false })
      await user.click(menuButton)

      const portalLink = screen.getByText('Mi portal')
      expect(portalLink.closest('a')).toHaveAttribute('href', '/portal')
    })

    it('portal link goes to /app/dashboard for admins', async () => {
      const user = userEvent.setup()
      render(<PublicHeader />, {
        preloadedState: createAuthenticatedState({ user: 'Admin', role: 'org_admin' }),
        useMemoryRouter: true,
      })

      const menuButton = screen.getByRole('button', { expanded: false })
      await user.click(menuButton)

      const portalLink = screen.getByText('Mi portal')
      expect(portalLink.closest('a')).toHaveAttribute('href', '/app/dashboard')
    })

    it('closes menu when clicking outside', async () => {
      const user = userEvent.setup()
      render(
        <div>
          <PublicHeader />
          <button data-testid="outside">Outside</button>
        </div>,
        {
          preloadedState: createAuthenticatedState({ user: 'Test' }),
          useMemoryRouter: true,
        }
      )

      const menuButton = screen.getByRole('button', { expanded: false })
      await user.click(menuButton)

      expect(screen.getByText('Mi portal')).toBeInTheDocument()

      // Click outside
      fireEvent.mouseDown(screen.getByTestId('outside'))

      await waitFor(() => {
        expect(screen.queryByText('Mi portal')).not.toBeInTheDocument()
      })
    })

    it('handles logout', async () => {
      const user = userEvent.setup()
      const { store } = render(<PublicHeader />, {
        preloadedState: createAuthenticatedState({ user: 'Test' }),
        useMemoryRouter: true,
        initialEntries: ['/jobs'],
      })

      const menuButton = screen.getByRole('button', { expanded: false })
      await user.click(menuButton)

      const logoutButton = screen.getByText('Cerrar sesión')
      await user.click(logoutButton)

      // Auth state should be cleared
      await waitFor(() => {
        expect(store.getState().auth.isLoggedIn).toBe(false)
      })
    })
  })

  describe('branding', () => {
    it('shows RecruitSpace logo when showBranding is true', () => {
      render(<PublicHeader showBranding />, {
        preloadedState: createUnauthenticatedState(),
        useMemoryRouter: true,
      })

      // Logo component should be rendered (link to /jobs)
      const brandLink = screen.getByRole('link', { name: /recruitspace/i })
      expect(brandLink).toHaveAttribute('href', '/jobs')
    })

    it('shows custom logo when logoUrl is provided', () => {
      render(
        <PublicHeader
          logoUrl="https://example.com/logo.png"
          organizationName="My Company"
        />,
        {
          preloadedState: createUnauthenticatedState(),
          useMemoryRouter: true,
        }
      )

      const logo = screen.getByRole('img', { name: 'My Company' })
      expect(logo).toHaveAttribute('src', 'https://example.com/logo.png')
    })

    it('shows organization name when no logo and no branding', () => {
      render(<PublicHeader organizationName="Acme Corp" />, {
        preloadedState: createUnauthenticatedState(),
        useMemoryRouter: true,
      })

      expect(screen.getByText('Acme Corp')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has aria-expanded on menu button', async () => {
      const user = userEvent.setup()
      render(<PublicHeader />, {
        preloadedState: createAuthenticatedState({ user: 'Test' }),
        useMemoryRouter: true,
      })

      const menuButton = screen.getByRole('button')
      expect(menuButton).toHaveAttribute('aria-expanded', 'false')

      await user.click(menuButton)

      expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('has aria-haspopup on menu button', () => {
      render(<PublicHeader />, {
        preloadedState: createAuthenticatedState({ user: 'Test' }),
        useMemoryRouter: true,
      })

      const menuButton = screen.getByRole('button')
      expect(menuButton).toHaveAttribute('aria-haspopup', 'true')
    })
  })
})

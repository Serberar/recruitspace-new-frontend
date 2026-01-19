import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { render, createAuthenticatedState, createUnauthenticatedState } from '../test/test-utils'
import PrivateRoute from './PrivateRoute'

// Mock Navigate component to track redirects
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Redirecting to {to}</div>,
  }
})

describe('PrivateRoute', () => {
  describe('Authentication checks', () => {
    it('renders children when user is authenticated', () => {
      render(
        <PrivateRoute>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          useMemoryRouter: true,
          preloadedState: createAuthenticatedState({ role: 'org_admin' }),
        }
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('redirects to login when user is not authenticated', () => {
      render(
        <PrivateRoute>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          useMemoryRouter: true,
          preloadedState: createUnauthenticatedState(),
        }
      )

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
      const navigate = screen.getByTestId('navigate')
      expect(navigate).toHaveAttribute('data-to', '/login')
    })

    it('returns null while auth is loading', () => {
      const { container } = render(
        <PrivateRoute>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          useMemoryRouter: true,
          preloadedState: {
            auth: {
              id: null,
              user: null,
              accessToken: null,
              role: null,
              isLoggedIn: false,
              isAuthLoading: true,
            },
          },
        }
      )

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
      expect(container.firstChild).toBeNull()
    })
  })

  describe('Role-based access control', () => {
    it('allows access when no allowedRoles specified', () => {
      render(
        <PrivateRoute>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          useMemoryRouter: true,
          preloadedState: createAuthenticatedState({ role: 'any_role' }),
        }
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('allows access when user role is in allowedRoles', () => {
      render(
        <PrivateRoute allowedRoles={['org_admin', 'recruiter']}>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          useMemoryRouter: true,
          preloadedState: createAuthenticatedState({ role: 'org_admin' }),
        }
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('redirects to unauthorized when user role is not in allowedRoles', () => {
      render(
        <PrivateRoute allowedRoles={['org_admin']}>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          useMemoryRouter: true,
          preloadedState: createAuthenticatedState({ role: 'candidate' }),
        }
      )

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
      const navigate = screen.getByTestId('navigate')
      expect(navigate).toHaveAttribute('data-to', '/unauthorized')
    })

    it('handles case-insensitive role matching', () => {
      render(
        <PrivateRoute allowedRoles={['org_admin']}>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          useMemoryRouter: true,
          preloadedState: createAuthenticatedState({ role: 'ORG_ADMIN' }),
        }
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('allows access with multiple allowed roles', () => {
      const roles = ['org_admin', 'recruiter', 'org_recruiter']

      roles.forEach(role => {
        const { unmount } = render(
          <PrivateRoute allowedRoles={roles}>
            <div>Protected Content for {role}</div>
          </PrivateRoute>,
          {
            useMemoryRouter: true,
            preloadedState: createAuthenticatedState({ role }),
          }
        )

        expect(screen.getByText(`Protected Content for ${role}`)).toBeInTheDocument()
        unmount()
      })
    })

    it('denies access when role is null', () => {
      render(
        <PrivateRoute allowedRoles={['org_admin']}>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          useMemoryRouter: true,
          preloadedState: {
            auth: {
              id: '1',
              user: 'Test',
              accessToken: 'token',
              role: null,
              isLoggedIn: true,
            },
          },
        }
      )

      const navigate = screen.getByTestId('navigate')
      expect(navigate).toHaveAttribute('data-to', '/unauthorized')
    })
  })

  describe('Edge cases', () => {
    it('handles empty allowedRoles array as allowing all roles', () => {
      render(
        <PrivateRoute allowedRoles={[]}>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          useMemoryRouter: true,
          preloadedState: createAuthenticatedState({ role: 'any_role' }),
        }
      )

      // Empty array means no roles allowed, should redirect
      const navigate = screen.getByTestId('navigate')
      expect(navigate).toHaveAttribute('data-to', '/unauthorized')
    })

    it('renders complex children correctly', () => {
      render(
        <PrivateRoute>
          <div>
            <h1>Dashboard</h1>
            <nav>Navigation</nav>
            <main>Content</main>
          </div>
        </PrivateRoute>,
        {
          useMemoryRouter: true,
          preloadedState: createAuthenticatedState({ role: 'org_admin' }),
        }
      )

      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
      expect(screen.getByRole('navigation')).toBeInTheDocument()
      expect(screen.getByRole('main')).toBeInTheDocument()
    })
  })
})

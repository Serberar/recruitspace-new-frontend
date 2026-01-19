/**
 * Integration tests for role-based permissions
 * Tests access control including:
 * - Admin-only routes
 * - Recruiter routes
 * - Candidate-only routes
 * - Role-specific UI elements
 */
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { render, createAuthenticatedState } from '../test-utils'
import AppRoutes from '../../routes/AppRoutes'
import PrivateRoute from '../../routes/PrivateRoute'

// Use the same base URL as the app
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Setup MSW server with all required API handlers
const server = setupServer(
  // Dashboard stats
  http.get(`${API_BASE}/stats/dashboard`, () => {
    return HttpResponse.json({ data: { offers: 5, candidates: 10 } })
  }),

  // Offers endpoints
  http.get(`${API_BASE}/offer`, () => {
    return HttpResponse.json({ data: [] })
  }),
  http.get(`${API_BASE}/offer/:id`, () => {
    return HttpResponse.json({ data: { id: '1', title: 'Test Offer' } })
  }),

  // Clients endpoints
  http.get(`${API_BASE}/client/assigned`, () => {
    return HttpResponse.json({ data: [{ id: '1', name: 'Client 1' }] })
  }),
  http.get(`${API_BASE}/client/organization`, () => {
    return HttpResponse.json({ data: [{ id: '1', name: 'Client 1' }] })
  }),

  // Team endpoints
  http.get(`${API_BASE}/organization/members`, () => {
    return HttpResponse.json({ data: [] })
  }),

  // Pipeline settings
  http.get(`${API_BASE}/pipeline`, () => {
    return HttpResponse.json({ data: [] })
  }),
  http.get(`${API_BASE}/pipeline/states`, () => {
    return HttpResponse.json({ data: [] })
  }),

  // Email templates
  http.get(`${API_BASE}/email-templates`, () => {
    return HttpResponse.json({ data: [] })
  }),

  // SMTP settings
  http.get(`${API_BASE}/smtp`, () => {
    return HttpResponse.json({ data: null })
  }),
  http.get(`${API_BASE}/smtp/settings`, () => {
    return HttpResponse.json({ data: null })
  }),

  // Organization settings
  http.get(`${API_BASE}/organization`, () => {
    return HttpResponse.json({ data: { name: 'Test Org' } })
  }),
  http.get(`${API_BASE}/organization/settings`, () => {
    return HttpResponse.json({ data: { name: 'Test Org' } })
  }),

  // Candidate portal
  http.get(`${API_BASE}/candidate/processes`, () => {
    return HttpResponse.json({ data: [] })
  }),
  http.get(`${API_BASE}/candidate/profile`, () => {
    return HttpResponse.json({ data: { firstName: 'Test' } })
  }),

  // Refresh token
  http.post(`${API_BASE}/users/refresh`, () => {
    return HttpResponse.json({ accessToken: 'new-token' })
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('Role-Based Permissions Integration', () => {
  describe('Admin Role Permissions', () => {
    const adminState = createAuthenticatedState({ role: 'org_admin' })

    it('admin can access dashboard', async () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/app/dashboard'],
        preloadedState: adminState,
      })

      await waitFor(() => {
        // Should not be redirected to unauthorized
        expect(screen.queryByRole('heading', { name: /acceso denegado/i })).not.toBeInTheDocument()
      })
    })

    it('admin can access offers', async () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/app/offers'],
        preloadedState: adminState,
      })

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /acceso denegado/i })).not.toBeInTheDocument()
      })
    })

    it('admin can access clients', async () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/app/clients'],
        preloadedState: adminState,
      })

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /acceso denegado/i })).not.toBeInTheDocument()
      })
    })

    it('admin can access team management', async () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/app/team'],
        preloadedState: adminState,
      })

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /acceso denegado/i })).not.toBeInTheDocument()
      })
    })

    it('admin can access pipeline settings', async () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/app/settings/pipeline'],
        preloadedState: adminState,
      })

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /acceso denegado/i })).not.toBeInTheDocument()
      })
    })

    it('admin cannot access email templates (recruiter-only route)', async () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/app/settings/email-templates'],
        preloadedState: adminState,
      })

      await waitFor(() => {
        // Email templates is recruiter-only, admin should be redirected to unauthorized
        expect(screen.getByRole('heading', { name: /acceso denegado/i })).toBeInTheDocument()
      })
    })

    it('admin cannot access SMTP settings (recruiter-only route)', async () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/app/settings/smtp'],
        preloadedState: adminState,
      })

      await waitFor(() => {
        // SMTP settings is recruiter-only, admin should be redirected to unauthorized
        expect(screen.getByRole('heading', { name: /acceso denegado/i })).toBeInTheDocument()
      })
    })

    it('admin can access organization settings', async () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/app/settings/organization'],
        preloadedState: adminState,
      })

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /acceso denegado/i })).not.toBeInTheDocument()
      })
    })

    it('admin cannot access candidate portal', () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/portal'],
        preloadedState: adminState,
      })

      expect(screen.getByRole('heading', { name: /acceso denegado/i })).toBeInTheDocument()
    })
  })

  describe('Recruiter Role Permissions', () => {
    const recruiterState = createAuthenticatedState({ role: 'recruiter' })

    it('recruiter can access dashboard', async () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/app/dashboard'],
        preloadedState: recruiterState,
      })

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /acceso denegado/i })).not.toBeInTheDocument()
      })
    })

    it('recruiter can access offers', async () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/app/offers'],
        preloadedState: recruiterState,
      })

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /acceso denegado/i })).not.toBeInTheDocument()
      })
    })

    it('recruiter can access clients', async () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/app/clients'],
        preloadedState: recruiterState,
      })

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /acceso denegado/i })).not.toBeInTheDocument()
      })
    })

    it('recruiter cannot access candidate portal', () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/portal'],
        preloadedState: recruiterState,
      })

      expect(screen.getByRole('heading', { name: /acceso denegado/i })).toBeInTheDocument()
    })
  })

  describe('Candidate Role Permissions', () => {
    const candidateState = createAuthenticatedState({ role: 'candidate' })

    it('candidate can access portal', async () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/portal'],
        preloadedState: candidateState,
      })

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /acceso denegado/i })).not.toBeInTheDocument()
      })
    })

    it('candidate can access profile', async () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/portal/profile'],
        preloadedState: candidateState,
      })

      await waitFor(() => {
        expect(screen.queryByRole('heading', { name: /acceso denegado/i })).not.toBeInTheDocument()
      })
    })

    it('candidate cannot access app dashboard', () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/app/dashboard'],
        preloadedState: candidateState,
      })

      expect(screen.getByRole('heading', { name: /acceso denegado/i })).toBeInTheDocument()
    })

    it('candidate cannot access offers management', () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/app/offers'],
        preloadedState: candidateState,
      })

      expect(screen.getByRole('heading', { name: /acceso denegado/i })).toBeInTheDocument()
    })

    it('candidate cannot access clients', () => {
      render(<AppRoutes />, {
        useMemoryRouter: true,
        initialEntries: ['/app/clients'],
        preloadedState: candidateState,
      })

      expect(screen.getByRole('heading', { name: /acceso denegado/i })).toBeInTheDocument()
    })

  })

  describe('PrivateRoute Component', () => {
    it('renders children when user is authenticated with allowed role', () => {
      render(
        <PrivateRoute allowedRoles={['org_admin']}>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          useMemoryRouter: true,
          preloadedState: createAuthenticatedState({ role: 'org_admin' }),
        }
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('redirects to unauthorized when role is not allowed', () => {
      render(
        <PrivateRoute allowedRoles={['org_admin']}>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          useMemoryRouter: true,
          initialEntries: ['/protected'],
          preloadedState: createAuthenticatedState({ role: 'recruiter' }),
        }
      )

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('redirects to login when not authenticated', () => {
      render(
        <PrivateRoute allowedRoles={['org_admin']}>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          useMemoryRouter: true,
          initialEntries: ['/protected'],
          preloadedState: {
            auth: {
              id: null,
              user: null,
              accessToken: null,
              role: null,
              isLoggedIn: false,
            },
          },
        }
      )

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
    })

    it('allows access when no specific roles are required', () => {
      render(
        <PrivateRoute>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          useMemoryRouter: true,
          preloadedState: createAuthenticatedState({ role: 'any-role' }),
        }
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('handles exact role matching (case-sensitive)', () => {
      render(
        <PrivateRoute allowedRoles={['org_admin']}>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          useMemoryRouter: true,
          preloadedState: createAuthenticatedState({ role: 'org_admin' }),
        }
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('allows multiple roles', () => {
      render(
        <PrivateRoute allowedRoles={['org_admin', 'recruiter']}>
          <div>Protected Content</div>
        </PrivateRoute>,
        {
          useMemoryRouter: true,
          preloadedState: createAuthenticatedState({ role: 'recruiter' }),
        }
      )

      expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })
  })

  describe('Role-Based Route Access Matrix', () => {
    // Routes based on actual routesConfig.tsx
    const routes = [
      { path: '/app/dashboard', allowedRoles: ['org_admin', 'recruiter', 'org_recruiter'] },
      { path: '/app/offers', allowedRoles: ['org_admin', 'recruiter', 'org_recruiter'] },
      { path: '/app/clients', allowedRoles: ['org_admin', 'recruiter', 'org_recruiter'] },
      { path: '/app/team', allowedRoles: ['org_admin', 'org_recruiter'] },
      { path: '/portal', allowedRoles: ['candidate'] },
      { path: '/portal/profile', allowedRoles: ['candidate'] },
    ]

    const roles = ['org_admin', 'recruiter', 'org_recruiter', 'candidate']

    routes.forEach(({ path, allowedRoles }) => {
      roles.forEach((role) => {
        const shouldHaveAccess = allowedRoles.includes(role)

        it(`${role} ${shouldHaveAccess ? 'can' : 'cannot'} access ${path}`, async () => {
          render(<AppRoutes />, {
            useMemoryRouter: true,
            initialEntries: [path],
            preloadedState: createAuthenticatedState({ role }),
          })

          if (shouldHaveAccess) {
            await waitFor(() => {
              // Should not show unauthorized message
              const unauthorized = screen.queryByRole('heading', { name: /acceso denegado/i })
              expect(unauthorized).not.toBeInTheDocument()
            })
          } else {
            // Should redirect to unauthorized
            expect(screen.getByRole('heading', { name: /acceso denegado/i })).toBeInTheDocument()
          }
        })
      })
    })
  })
})

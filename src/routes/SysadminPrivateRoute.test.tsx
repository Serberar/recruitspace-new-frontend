import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import SysadminPrivateRoute from './SysadminPrivateRoute'

// Mock the hook
const mockUseSysadminSession = vi.fn()

vi.mock('../features/sysadmin/hooks/useSysadminSession', () => ({
  useSysadminSession: () => mockUseSysadminSession(),
}))

// Mock Navigate
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Redirecting to {to}</div>,
  }
})

describe('SysadminPrivateRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Authentication', () => {
    it('renders children when sysadmin is authenticated', () => {
      mockUseSysadminSession.mockReturnValue({ isAuthenticated: true })

      render(
        <MemoryRouter>
          <SysadminPrivateRoute>
            <div>Sysadmin Dashboard</div>
          </SysadminPrivateRoute>
        </MemoryRouter>
      )

      expect(screen.getByText('Sysadmin Dashboard')).toBeInTheDocument()
    })

    it('redirects to sysadmin login when not authenticated', () => {
      mockUseSysadminSession.mockReturnValue({ isAuthenticated: false })

      render(
        <MemoryRouter>
          <SysadminPrivateRoute>
            <div>Sysadmin Dashboard</div>
          </SysadminPrivateRoute>
        </MemoryRouter>
      )

      expect(screen.queryByText('Sysadmin Dashboard')).not.toBeInTheDocument()
      const navigate = screen.getByTestId('navigate')
      expect(navigate).toHaveAttribute('data-to', '/sysadmin/login')
    })
  })

  describe('Edge cases', () => {
    it('renders complex children correctly when authenticated', () => {
      mockUseSysadminSession.mockReturnValue({ isAuthenticated: true })

      render(
        <MemoryRouter>
          <SysadminPrivateRoute>
            <div>
              <h1>Sysadmin Panel</h1>
              <section>Metrics</section>
              <section>Settings</section>
            </div>
          </SysadminPrivateRoute>
        </MemoryRouter>
      )

      expect(screen.getByRole('heading', { name: 'Sysadmin Panel' })).toBeInTheDocument()
      expect(screen.getByText('Metrics')).toBeInTheDocument()
      expect(screen.getByText('Settings')).toBeInTheDocument()
    })

    it('correctly uses the useSysadminSession hook', () => {
      mockUseSysadminSession.mockReturnValue({ isAuthenticated: true })

      render(
        <MemoryRouter>
          <SysadminPrivateRoute>
            <div>Content</div>
          </SysadminPrivateRoute>
        </MemoryRouter>
      )

      expect(mockUseSysadminSession).toHaveBeenCalled()
    })
  })
})

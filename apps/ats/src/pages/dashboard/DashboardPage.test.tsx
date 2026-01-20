import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import DashboardPage from './DashboardPage'
import authReducer from '../../store/slices/authSlice'

// Mock navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'dashboard.title': 'Dashboard',
        'dashboard.hello': `Hola, ${params?.name || 'Usuario'}`,
        'dashboard.noOffers': 'No hay ofertas activas',
        'dashboard.createFirstOffer': 'Crear primera oferta',
        'dashboard.createOffer': 'Crear oferta',
        'dashboard.viewOffers': 'Ver ofertas',
        'dashboard.activeOffers': 'Ofertas activas',
        'dashboard.newCandidates': 'Nuevos candidatos',
        'dashboard.allUpToDate': 'Todo al día',
        'dashboard.candidates': 'candidatos',
        'dashboard.client': 'Cliente',
        'app.loading': 'Cargando...',
        'app.error': 'Error',
        'app.retry': 'Reintentar',
        'admin.errorLoading': 'Error al cargar datos',
        'status.active': 'Activa',
        'analytics.periodMonth': 'Mes',
        'analytics.periodQuarter': 'Trimestre',
        'analytics.periodYear': 'Año',
        'analytics.periodAll': 'Todo',
        'analytics.activeProcesses': 'Procesos activos',
        'analytics.hired': 'Contratados',
        'analytics.conversionRate': 'Tasa de conversión',
        'analytics.avgTimeToHire': 'Tiempo medio',
        'dashboard.admin.manageTeam': 'Gestionar equipo',
      }
      return translations[key] || key
    },
  }),
}))

// Mock dashboard API
const mockGetRecruiterDashboard = vi.fn()
const mockGetRecruiterAnalytics = vi.fn()

vi.mock('../../services/dashboardApi', () => ({
  getRecruiterDashboard: () => mockGetRecruiterDashboard(),
}))

vi.mock('../../services/analyticsApi', () => ({
  getRecruiterAnalytics: (params: { period: string }) => mockGetRecruiterAnalytics(params),
}))

// Mock usePermissions
const mockUsePermissions = vi.fn()
vi.mock('../../hooks/useRole', () => ({
  usePermissions: () => mockUsePermissions(),
}))

// Mock error handler
vi.mock('../../hooks/useErrorHandler', () => ({
  getErrorMessage: (err: Error) => err.message,
}))

const createTestStore = (isLoggedIn = true, user = 'John') => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
    preloadedState: {
      auth: {
        id: '123',
        user,
        accessToken: 'token',
        role: 'recruiter',
        isLoggedIn,
        isAuthLoading: false,
      },
    },
  })
}

const renderPage = (store = createTestStore()) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    </Provider>
  )
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePermissions.mockReturnValue({ isAdmin: false })
  })

  describe('loading state', () => {
    it('shows loading spinner while fetching data', () => {
      mockGetRecruiterDashboard.mockImplementation(() => new Promise(() => {}))
      renderPage()

      expect(screen.getByText('Cargando...')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('shows error message on API failure', async () => {
      mockGetRecruiterDashboard.mockRejectedValue(new Error('Network error'))
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument()
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('has retry button on error', async () => {
      mockGetRecruiterDashboard.mockRejectedValue(new Error('Network error'))
      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
      })
    })

    it('retries fetch on retry button click', async () => {
      const user = userEvent.setup()
      mockGetRecruiterDashboard.mockRejectedValueOnce(new Error('Network error'))
      mockGetRecruiterDashboard.mockResolvedValueOnce({
        assignedOffers: [],
        pendingReviewByOffer: [],
        unreadMessages: [],
        totalUnreadMessages: 0,
      })
      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Reintentar' }))

      expect(mockGetRecruiterDashboard).toHaveBeenCalledTimes(2)
    })
  })

  describe('recruiter dashboard - empty state', () => {
    it('shows empty state when no offers or pending items', async () => {
      mockGetRecruiterDashboard.mockResolvedValue({
        assignedOffers: [],
        pendingReviewByOffer: [],
        unreadMessages: [],
        totalUnreadMessages: 0,
      })
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('No hay ofertas activas')).toBeInTheDocument()
      })
    })

    it('shows create first offer button in empty state', async () => {
      mockGetRecruiterDashboard.mockResolvedValue({
        assignedOffers: [],
        pendingReviewByOffer: [],
        unreadMessages: [],
        totalUnreadMessages: 0,
      })
      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Crear primera oferta' })).toBeInTheDocument()
      })
    })

    it('navigates to create offer on button click', async () => {
      const user = userEvent.setup()
      mockGetRecruiterDashboard.mockResolvedValue({
        assignedOffers: [],
        pendingReviewByOffer: [],
        unreadMessages: [],
        totalUnreadMessages: 0,
      })
      renderPage()

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Crear primera oferta' }))
      })

      expect(mockNavigate).toHaveBeenCalledWith('/app/offers/new')
    })
  })

  describe('recruiter dashboard - with data', () => {
    const mockDashboardData = {
      assignedOffers: [
        {
          id: 'offer-1',
          title: 'Frontend Developer',
          active: true,
          client: { name: 'Tech Corp' },
          _count: { selectionProcesses: 5 },
        },
        {
          id: 'offer-2',
          title: 'Backend Developer',
          active: true,
          client: { name: 'Other Corp' },
          _count: { selectionProcesses: 3 },
        },
      ],
      pendingReviewByOffer: [
        { offerId: 'offer-1', offerTitle: 'Frontend Developer', count: 2 },
      ],
      unreadMessages: [],
      totalUnreadMessages: 0,
    }

    it('shows dashboard title and greeting', async () => {
      mockGetRecruiterDashboard.mockResolvedValue(mockDashboardData)
      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument()
        expect(screen.getByText('Hola, John')).toBeInTheDocument()
      })
    })

    it('shows pending candidates section', async () => {
      mockGetRecruiterDashboard.mockResolvedValue(mockDashboardData)
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Nuevos candidatos')).toBeInTheDocument()
        // Frontend Developer appears in both pending candidates and active offers sections
        expect(screen.getAllByText('Frontend Developer').length).toBeGreaterThanOrEqual(1)
      })
    })

    it('shows active offers section', async () => {
      mockGetRecruiterDashboard.mockResolvedValue(mockDashboardData)
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Ofertas activas')).toBeInTheDocument()
      })
    })

    it('navigates to offer on offer card click', async () => {
      const user = userEvent.setup()
      mockGetRecruiterDashboard.mockResolvedValue(mockDashboardData)
      renderPage()

      await waitFor(async () => {
        const offerCards = screen.getAllByText('Frontend Developer')
        await user.click(offerCards[0])
      })

      expect(mockNavigate).toHaveBeenCalledWith('/app/offers/offer-1')
    })
  })

  describe('admin dashboard', () => {
    beforeEach(() => {
      mockUsePermissions.mockReturnValue({ isAdmin: true })
    })

    const mockAnalyticsData = {
      summary: {
        activeProcesses: 25,
        hiredThisPeriod: 10,
        rejectedThisPeriod: 5,
        conversionRate: 40,
        totalApplicationsThisPeriod: 50,
        avgTimeToHire: 14,
      },
      byStatus: [
        { statusId: '1', statusName: 'En proceso', statusColor: '#3498db', count: 15, percentage: 60 },
        { statusId: '2', statusName: 'Finalizado', statusColor: '#27ae60', count: 10, percentage: 40 },
      ],
      byClient: [
        { clientId: '1', clientName: 'Tech Corp', activeOffers: 3, activeProcesses: 8, hired: 2 },
      ],
      byOffer: [
        {
          offerId: '1',
          offerTitle: 'Senior Developer',
          clientName: 'Tech Corp',
          totalCandidates: 20,
          hired: 3,
          conversionRate: 15,
          isActive: true,
        },
      ],
    }

    it('fetches analytics data for admin', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue(mockAnalyticsData)
      renderPage()

      await waitFor(() => {
        expect(mockGetRecruiterAnalytics).toHaveBeenCalledWith({ period: 'month' })
      })
    })

    it('shows KPI cards for admin', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue(mockAnalyticsData)
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Procesos activos')).toBeInTheDocument()
        expect(screen.getByText('25')).toBeInTheDocument()
        // "Contratados" may appear multiple times in the page
        expect(screen.getAllByText('Contratados').length).toBeGreaterThanOrEqual(1)
        // "10" may appear multiple times (KPI + status count)
        expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1)
      })
    })

    it('shows period filters for admin', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue(mockAnalyticsData)
      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Mes' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Trimestre' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Año' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Todo' })).toBeInTheDocument()
      })
    })

    it('changes period on filter click', async () => {
      const user = userEvent.setup()
      mockGetRecruiterAnalytics.mockResolvedValue(mockAnalyticsData)
      renderPage()

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Trimestre' }))
      })

      expect(mockGetRecruiterAnalytics).toHaveBeenCalledWith({ period: 'quarter' })
    })

    it('shows quick actions for admin', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue(mockAnalyticsData)
      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Ver ofertas' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Gestionar equipo' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Crear oferta' })).toBeInTheDocument()
      })
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AnalyticsPage from './AnalyticsPage'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'analytics.title': 'Analíticas',
        'analytics.subtitle': 'Estadísticas de tus procesos de selección',
        'analytics.periodMonth': 'Mes',
        'analytics.periodQuarter': 'Trimestre',
        'analytics.periodYear': 'Año',
        'analytics.periodAll': 'Todo',
        'analytics.activeProcesses': 'Procesos activos',
        'analytics.activeProcessesDesc': 'En curso actualmente',
        'analytics.hired': 'Contratados',
        'analytics.hiredDesc': `${params?.rejected || 0} rechazados`,
        'analytics.conversionRate': 'Tasa de conversión',
        'analytics.conversionRateDesc': `De ${params?.total || 0} aplicaciones`,
        'analytics.avgTimeToHire': 'Tiempo medio',
        'analytics.avgTimeToHireDesc': 'Días hasta contratación',
        'analytics.byStatus': 'Por estado',
        'analytics.byClient': 'Por cliente',
        'analytics.byOffer': 'Por oferta',
        'analytics.client': 'Cliente',
        'analytics.offers': 'Ofertas',
        'analytics.active': 'Activos',
        'analytics.offer': 'Oferta',
        'analytics.candidates': 'Candidatos',
        'analytics.conversion': 'Conversión',
        'analytics.status': 'Estado',
        'analytics.activeStatus': 'Activa',
        'analytics.closedStatus': 'Cerrada',
        'analytics.noData': 'Sin datos',
        'analytics.noClients': 'Sin clientes',
        'analytics.noOffers': 'Sin ofertas',
        'app.loading': 'Cargando...',
        'app.error': 'Error',
        'app.retry': 'Reintentar',
        'admin.errorLoading': 'Error al cargar datos',
      }
      return translations[key] || key
    },
  }),
}))

// Mock analytics API
const mockGetRecruiterAnalytics = vi.fn()
vi.mock('../../features/analytics/services/analyticsApi', () => ({
  getRecruiterAnalytics: (params: { period: string }) => mockGetRecruiterAnalytics(params),
}))

// Mock error handler
vi.mock('../../hooks/useErrorHandler', () => ({
  getErrorMessage: (err: Error) => err.message,
}))

describe('AnalyticsPage', () => {
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

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loading state', () => {
    it('shows loading spinner while fetching data', () => {
      mockGetRecruiterAnalytics.mockImplementation(() => new Promise(() => {}))
      render(<AnalyticsPage />)

      expect(screen.getByText('Cargando...')).toBeInTheDocument()
    })
  })

  describe('error state', () => {
    it('shows error message on API failure', async () => {
      mockGetRecruiterAnalytics.mockRejectedValue(new Error('Network error'))
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument()
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('has retry button on error', async () => {
      mockGetRecruiterAnalytics.mockRejectedValue(new Error('Network error'))
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
      })
    })

    it('retries fetch on retry button click', async () => {
      const user = userEvent.setup()
      mockGetRecruiterAnalytics.mockRejectedValueOnce(new Error('Network error'))
      mockGetRecruiterAnalytics.mockResolvedValueOnce(mockAnalyticsData)
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
      })

      await user.click(screen.getByRole('button', { name: 'Reintentar' }))

      expect(mockGetRecruiterAnalytics).toHaveBeenCalledTimes(2)
    })
  })

  describe('with data', () => {
    it('renders page title', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue(mockAnalyticsData)
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Analíticas' })).toBeInTheDocument()
      })
    })

    it('renders KPI cards', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue(mockAnalyticsData)
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Procesos activos')).toBeInTheDocument()
        expect(screen.getByText('25')).toBeInTheDocument()
        // "Contratados" appears multiple times (KPI card + table headers)
        expect(screen.getAllByText('Contratados').length).toBeGreaterThanOrEqual(1)
        // "10" appears multiple times (KPI card + status count)
        expect(screen.getAllByText('10').length).toBeGreaterThanOrEqual(1)
        expect(screen.getByText('Tasa de conversión')).toBeInTheDocument()
        expect(screen.getByText('40%')).toBeInTheDocument()
        expect(screen.getByText('Tiempo medio')).toBeInTheDocument()
        expect(screen.getByText('14')).toBeInTheDocument()
      })
    })

    it('renders status section', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue(mockAnalyticsData)
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Por estado')).toBeInTheDocument()
        expect(screen.getByText('En proceso')).toBeInTheDocument()
        expect(screen.getByText('Finalizado')).toBeInTheDocument()
      })
    })

    it('renders client section', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue(mockAnalyticsData)
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Por cliente')).toBeInTheDocument()
        // Tech Corp appears multiple times (client table + offer table)
        expect(screen.getAllByText('Tech Corp').length).toBeGreaterThanOrEqual(1)
      })
    })

    it('renders offer section', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue(mockAnalyticsData)
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Por oferta')).toBeInTheDocument()
        expect(screen.getByText('Senior Developer')).toBeInTheDocument()
      })
    })
  })

  describe('period filters', () => {
    it('renders period filter buttons', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue(mockAnalyticsData)
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Mes' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Trimestre' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Año' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Todo' })).toBeInTheDocument()
      })
    })

    it('fetches with default month period', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue(mockAnalyticsData)
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(mockGetRecruiterAnalytics).toHaveBeenCalledWith({ period: 'month' })
      })
    })

    it('changes period on filter click', async () => {
      const user = userEvent.setup()
      mockGetRecruiterAnalytics.mockResolvedValue(mockAnalyticsData)
      render(<AnalyticsPage />)

      await waitFor(async () => {
        await user.click(screen.getByRole('button', { name: 'Trimestre' }))
      })

      expect(mockGetRecruiterAnalytics).toHaveBeenCalledWith({ period: 'quarter' })
    })

    it('highlights active period button', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue(mockAnalyticsData)
      render(<AnalyticsPage />)

      await waitFor(() => {
        const mesButton = screen.getByRole('button', { name: 'Mes' })
        // CSS modules add hash to class names
        expect(mesButton.className).toMatch(/active/)
      })
    })
  })

  describe('empty states', () => {
    it('shows empty message when no status data', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue({
        ...mockAnalyticsData,
        byStatus: [],
      })
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sin datos')).toBeInTheDocument()
      })
    })

    it('shows empty message when no clients', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue({
        ...mockAnalyticsData,
        byClient: [],
      })
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sin clientes')).toBeInTheDocument()
      })
    })

    it('shows empty message when no offers', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue({
        ...mockAnalyticsData,
        byOffer: [],
      })
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Sin ofertas')).toBeInTheDocument()
      })
    })
  })

  describe('null avgTimeToHire', () => {
    it('shows dash when avgTimeToHire is null', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue({
        ...mockAnalyticsData,
        summary: {
          ...mockAnalyticsData.summary,
          avgTimeToHire: null,
        },
      })
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('-')).toBeInTheDocument()
      })
    })
  })

  describe('offer status badges', () => {
    it('shows active badge for active offers', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue(mockAnalyticsData)
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Activa')).toBeInTheDocument()
      })
    })

    it('shows closed badge for inactive offers', async () => {
      mockGetRecruiterAnalytics.mockResolvedValue({
        ...mockAnalyticsData,
        byOffer: [
          {
            ...mockAnalyticsData.byOffer[0],
            isActive: false,
          },
        ],
      })
      render(<AnalyticsPage />)

      await waitFor(() => {
        expect(screen.getByText('Cerrada')).toBeInTheDocument()
      })
    })
  })
})

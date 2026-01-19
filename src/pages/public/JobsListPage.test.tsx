import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { ToastProvider } from '../../components/ui/Toast'
import authReducer from '../../features/auth/authSlice'
import JobsListPage from './JobsListPage'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      const translations: Record<string, string> = {
        'public.jobsList.title': 'Ofertas de empleo',
        'public.jobsList.subtitle': 'Encuentra tu proximo trabajo',
        'public.jobsList.activeOffers': 'Ofertas activas',
        'public.jobsList.dailyUpdates': 'Actualizaciones diarias',
        'public.jobsList.loading': 'Cargando...',
        'public.jobsList.noOffers': 'No hay ofertas disponibles',
        'public.jobsList.loadError': 'Error al cargar las ofertas',
        'public.jobsList.retry': 'Reintentar',
        'public.jobsList.previous': 'Anterior',
        'public.jobsList.next': 'Siguiente',
        'public.jobsList.pageInfo': `Pagina ${params?.page} de ${params?.totalPages}`,
        'public.jobsList.searchPlaceholder': 'Buscar ofertas...',
        'public.jobsList.search': 'Buscar',
        'footer.privacy': 'Privacidad',
        'footer.terms': 'Terminos',
        'footer.cookies': 'Cookies',
        'footer.contact': 'Contacto',
        'footer.reportProblem': 'Reportar problema',
        'app.language': 'Idioma',
      }
      return translations[key] || key
    },
    i18n: {
      language: 'es',
      changeLanguage: vi.fn(),
    },
  }),
}))

// Mock publicJobsApi
const mockGetPublicJobOffers = vi.fn()
const mockGetPublicFilterOptions = vi.fn()

vi.mock('../../features/publicJobs/services/publicJobsApi', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>
  return {
    ...actual,
    getPublicJobOffers: (...args: unknown[]) => mockGetPublicJobOffers(...args),
    getPublicFilterOptions: () => mockGetPublicFilterOptions(),
  }
})

// Mock SEO
vi.mock('../../components/seo', () => ({
  SEO: () => null,
}))

// Mock viewedJobs
vi.mock('../../utils/viewedJobs', () => ({
  getViewedJobIds: () => new Set(),
}))

// Mock feedbackApi
vi.mock('../../services/feedbackApi', () => ({
  feedbackApi: { create: vi.fn().mockResolvedValue({}) },
  getBrowserInfo: vi.fn().mockReturnValue('Test Browser'),
}))

const mockJobs = [
  {
    id: '1',
    title: 'Senior Developer',
    company: 'Tech Corp',
    location: 'Madrid',
    modality: 'REMOTE',
    contractType: 'INDEFINIDO',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Product Manager',
    company: 'Startup Inc',
    location: 'Barcelona',
    modality: 'HYBRID',
    contractType: 'INDEFINIDO',
    createdAt: new Date().toISOString(),
  },
]

const createTestStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
    },
  })
}

const renderPage = () => {
  const store = createTestStore()
  return render(
    <Provider store={store}>
      <ToastProvider>
        <BrowserRouter>
          <JobsListPage />
        </BrowserRouter>
      </ToastProvider>
    </Provider>
  )
}

describe('JobsListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    mockGetPublicFilterOptions.mockResolvedValue({
      categories: ['Tech', 'Product'],
      locations: ['Madrid', 'Barcelona'],
      contractTypes: ['INDEFINIDO', 'TEMPORAL'],
      modalities: ['REMOTE', 'HYBRID', 'ONSITE'],
    })
    mockGetPublicJobOffers.mockResolvedValue({
      data: mockJobs,
      pagination: { page: 1, totalPages: 1, total: 2 },
    })
  })

  describe('rendering', () => {
    it('renders page header', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Encuentra tu proximo trabajo')).toBeInTheDocument()
      })
    })

    it('renders jobs logo with Jobs text', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Jobs')).toBeInTheDocument()
      })
    })

    it('renders header stats', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Ofertas activas')).toBeInTheDocument()
        expect(screen.getByText('Actualizaciones diarias')).toBeInTheDocument()
      })
    })

    it('renders main content area', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('main')).toBeInTheDocument()
      })
    })

    it('renders footer', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('contentinfo')).toBeInTheDocument()
      })
    })
  })

  describe('loading state', () => {
    it('shows loading indicator initially', () => {
      mockGetPublicJobOffers.mockImplementation(() => new Promise(() => {}))
      renderPage()

      expect(screen.getByText('Cargando...')).toBeInTheDocument()
    })
  })

  describe('jobs list', () => {
    it('renders job cards when jobs are loaded', async () => {
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Senior Developer')).toBeInTheDocument()
        expect(screen.getByText('Product Manager')).toBeInTheDocument()
      })
    })

    it('shows empty state when no jobs', async () => {
      mockGetPublicJobOffers.mockResolvedValue({
        data: [],
        pagination: { page: 1, totalPages: 0, total: 0 },
      })

      renderPage()

      await waitFor(() => {
        expect(screen.getByText('No hay ofertas disponibles')).toBeInTheDocument()
      })
    })
  })

  describe('error handling', () => {
    it('shows error message when API fails', async () => {
      mockGetPublicJobOffers.mockRejectedValue({
        response: { data: { message: 'API Error' } },
      })

      renderPage()

      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument()
      })
    })

    it('shows retry button on error', async () => {
      mockGetPublicJobOffers.mockRejectedValue(new Error('Failed'))

      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
      })
    })

    it('retries fetch when retry button is clicked', async () => {
      const user = userEvent.setup()
      mockGetPublicJobOffers.mockRejectedValueOnce(new Error('Failed'))

      renderPage()

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
      })

      mockGetPublicJobOffers.mockResolvedValue({
        data: mockJobs,
        pagination: { page: 1, totalPages: 1, total: 2 },
      })

      await user.click(screen.getByRole('button', { name: 'Reintentar' }))

      await waitFor(() => {
        expect(screen.getByText('Senior Developer')).toBeInTheDocument()
      })
    })
  })

  describe('pagination', () => {
    it('shows pagination when multiple pages', async () => {
      mockGetPublicJobOffers.mockResolvedValue({
        data: mockJobs,
        pagination: { page: 1, totalPages: 3, total: 30 },
      })

      renderPage()

      await waitFor(() => {
        expect(screen.getByText(/Pagina 1 de 3/)).toBeInTheDocument()
      })
    })

    it('disables previous button on first page', async () => {
      mockGetPublicJobOffers.mockResolvedValue({
        data: mockJobs,
        pagination: { page: 1, totalPages: 3, total: 30 },
      })

      renderPage()

      await waitFor(() => {
        const prevButton = screen.getByRole('button', { name: /Anterior/ })
        expect(prevButton).toBeDisabled()
      })
    })

    it('enables next button when not on last page', async () => {
      mockGetPublicJobOffers.mockResolvedValue({
        data: mockJobs,
        pagination: { page: 1, totalPages: 3, total: 30 },
      })

      renderPage()

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Siguiente/ })
        expect(nextButton).not.toBeDisabled()
      })
    })

    it('hides pagination when only one page', async () => {
      mockGetPublicJobOffers.mockResolvedValue({
        data: mockJobs,
        pagination: { page: 1, totalPages: 1, total: 2 },
      })

      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Senior Developer')).toBeInTheDocument()
      })

      expect(screen.queryByText(/Pagina 1 de 1/)).not.toBeInTheDocument()
    })
  })

  describe('search', () => {
    it('fetches jobs with search term on submit', async () => {
      const user = userEvent.setup()
      renderPage()

      await waitFor(() => {
        expect(screen.getByText('Senior Developer')).toBeInTheDocument()
      })

      const searchInput = screen.getByPlaceholderText(/Buscar/i)
      await user.type(searchInput, 'developer')

      const searchButton = screen.getByRole('button', { name: /Buscar/i })
      await user.click(searchButton)

      await waitFor(() => {
        expect(mockGetPublicJobOffers).toHaveBeenCalledWith(
          expect.objectContaining({ search: 'developer' })
        )
      })
    })
  })
})

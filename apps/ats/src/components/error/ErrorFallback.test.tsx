import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import { ErrorFallback, NotFoundFallback, ServerErrorFallback, NetworkErrorFallback } from './ErrorFallback'

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
    t: (key: string) => {
      const translations: Record<string, string> = {
        'error.somethingWentWrong': 'Algo salio mal',
        'error.unexpectedError': 'Ha ocurrido un error inesperado',
        'error.errorDetails': 'Detalles del error',
        'error.tryAgain': 'Intentar de nuevo',
        'error.goHome': 'Ir al inicio',
        'error.goBack': 'Volver atras',
        'error.pageNotFound': 'Pagina no encontrada',
        'error.pageNotFoundDesc': 'La pagina que buscas no existe',
        'error.serverError': 'Error del servidor',
        'error.noConnection': 'Sin conexion',
      }
      return translations[key] || key
    },
  }),
}))

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  )
}

describe('ErrorFallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('basic rendering', () => {
    it('renders with default messages', () => {
      renderWithRouter(<ErrorFallback />)

      expect(screen.getByText('Algo salio mal')).toBeInTheDocument()
      expect(screen.getByText('Ha ocurrido un error inesperado')).toBeInTheDocument()
    })

    it('renders with custom title', () => {
      renderWithRouter(<ErrorFallback title="Custom Error Title" />)

      expect(screen.getByText('Custom Error Title')).toBeInTheDocument()
    })

    it('renders with custom message', () => {
      renderWithRouter(<ErrorFallback message="Custom error message" />)

      expect(screen.getByText('Custom error message')).toBeInTheDocument()
    })

    it('renders error icon', () => {
      const { container } = renderWithRouter(<ErrorFallback />)

      expect(container.querySelector('svg')).toBeInTheDocument()
    })
  })

  describe('buttons', () => {
    it('renders home button by default', () => {
      renderWithRouter(<ErrorFallback />)

      expect(screen.getByRole('button', { name: 'Ir al inicio' })).toBeInTheDocument()
    })

    it('renders retry button when resetError is provided', () => {
      const resetError = vi.fn()
      renderWithRouter(<ErrorFallback resetError={resetError} />)

      expect(screen.getByRole('button', { name: 'Intentar de nuevo' })).toBeInTheDocument()
    })

    it('does not render retry button without resetError', () => {
      renderWithRouter(<ErrorFallback />)

      expect(screen.queryByRole('button', { name: 'Intentar de nuevo' })).not.toBeInTheDocument()
    })

    it('hides home button when showHomeButton is false', () => {
      renderWithRouter(<ErrorFallback showHomeButton={false} />)

      expect(screen.queryByRole('button', { name: 'Ir al inicio' })).not.toBeInTheDocument()
    })

    it('hides retry button when showRetryButton is false', () => {
      const resetError = vi.fn()
      renderWithRouter(<ErrorFallback resetError={resetError} showRetryButton={false} />)

      expect(screen.queryByRole('button', { name: 'Intentar de nuevo' })).not.toBeInTheDocument()
    })
  })

  describe('actions', () => {
    it('calls resetError when retry button is clicked', async () => {
      const user = userEvent.setup()
      const resetError = vi.fn()
      renderWithRouter(<ErrorFallback resetError={resetError} />)

      await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))

      expect(resetError).toHaveBeenCalled()
    })

    it('navigates to home and calls resetError when home button is clicked', async () => {
      const user = userEvent.setup()
      const resetError = vi.fn()
      renderWithRouter(<ErrorFallback resetError={resetError} />)

      await user.click(screen.getByRole('button', { name: 'Ir al inicio' }))

      expect(mockNavigate).toHaveBeenCalledWith('/')
      expect(resetError).toHaveBeenCalled()
    })
  })

  describe('error details', () => {
    it('shows error details when showDetails is true and error is provided', () => {
      const error = new Error('Test error message')
      error.name = 'TestError'
      renderWithRouter(<ErrorFallback error={error} showDetails={true} />)

      expect(screen.getByText('Detalles del error')).toBeInTheDocument()
      // Error details are shown in a pre tag with error name and message
      const errorDetails = screen.getAllByText(/TestError/)
      expect(errorDetails.length).toBeGreaterThan(0)
      expect(screen.getByText(/Test error message/)).toBeInTheDocument()
    })

    it('hides error details when showDetails is false', () => {
      const error = new Error('Test error message')
      renderWithRouter(<ErrorFallback error={error} showDetails={false} />)

      expect(screen.queryByText('Detalles del error')).not.toBeInTheDocument()
    })
  })
})

describe('NotFoundFallback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders 404 message', () => {
    renderWithRouter(<NotFoundFallback />)

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByText('Pagina no encontrada')).toBeInTheDocument()
    expect(screen.getByText('La pagina que buscas no existe')).toBeInTheDocument()
  })

  it('renders go back and go home buttons', () => {
    renderWithRouter(<NotFoundFallback />)

    expect(screen.getByRole('button', { name: 'Volver atras' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ir al inicio' })).toBeInTheDocument()
  })

  it('navigates back when go back is clicked', async () => {
    const user = userEvent.setup()
    renderWithRouter(<NotFoundFallback />)

    await user.click(screen.getByRole('button', { name: 'Volver atras' }))

    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })

  it('navigates home when go home is clicked', async () => {
    const user = userEvent.setup()
    renderWithRouter(<NotFoundFallback />)

    await user.click(screen.getByRole('button', { name: 'Ir al inicio' }))

    expect(mockNavigate).toHaveBeenCalledWith('/')
  })
})

describe('ServerErrorFallback', () => {
  it('renders server error message', () => {
    renderWithRouter(<ServerErrorFallback />)

    expect(screen.getByText('Error del servidor')).toBeInTheDocument()
  })

  it('passes resetError to ErrorFallback', async () => {
    const user = userEvent.setup()
    const resetError = vi.fn()
    renderWithRouter(<ServerErrorFallback resetError={resetError} />)

    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))

    expect(resetError).toHaveBeenCalled()
  })
})

describe('NetworkErrorFallback', () => {
  it('renders network error message', () => {
    renderWithRouter(<NetworkErrorFallback />)

    expect(screen.getByText('Sin conexion')).toBeInTheDocument()
  })

  it('passes resetError to ErrorFallback', async () => {
    const user = userEvent.setup()
    const resetError = vi.fn()
    renderWithRouter(<NetworkErrorFallback resetError={resetError} />)

    await user.click(screen.getByRole('button', { name: 'Intentar de nuevo' }))

    expect(resetError).toHaveBeenCalled()
  })
})

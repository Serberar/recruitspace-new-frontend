import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JobSearchBar } from './JobSearchBar'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'public.jobsList.searchPlaceholder': 'Buscar ofertas...',
        'public.jobsList.search': 'Buscar',
        'public.jobsList.filters': 'Filtros',
        'public.jobsList.allCategories': 'Todas las categorías',
        'public.jobsList.allLocations': 'Todas las ubicaciones',
        'public.jobsList.allModalities': 'Todas las modalidades',
        'public.jobsList.allContractTypes': 'Todos los tipos de contrato',
      }
      return translations[key] || key
    },
  }),
}))

// Mock publicJobsApi
vi.mock('../../features/publicJobs/services/publicJobsApi', () => ({
  getModalityLabel: (modality: string) => modality,
}))

const defaultFilterOptions = {
  categories: ['IT', 'Marketing'],
  locations: ['Madrid', 'Barcelona'],
  modalities: ['remote', 'onsite'],
  contractTypes: ['Tiempo completo'],
}

const defaultProps = {
  search: '',
  onSearchChange: vi.fn(),
  onSearchSubmit: vi.fn(),
  filterOptions: defaultFilterOptions,
  category: '',
  location: '',
  modality: '',
  contractType: '',
  onFilterChange: vi.fn(),
}

describe('JobSearchBar', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('search form', () => {
    it('renders search input', () => {
      render(<JobSearchBar {...defaultProps} />)

      expect(screen.getByPlaceholderText('Buscar ofertas...')).toBeInTheDocument()
    })

    it('renders search button', () => {
      render(<JobSearchBar {...defaultProps} />)

      expect(screen.getByRole('button', { name: 'Buscar' })).toBeInTheDocument()
    })

    it('shows current search value', () => {
      render(<JobSearchBar {...defaultProps} search="developer" />)

      expect(screen.getByDisplayValue('developer')).toBeInTheDocument()
    })

    it('calls onSearchChange when typing', async () => {
      const user = userEvent.setup()
      const onSearchChange = vi.fn()
      render(<JobSearchBar {...defaultProps} onSearchChange={onSearchChange} />)

      const input = screen.getByPlaceholderText('Buscar ofertas...')
      await user.type(input, 'react')

      expect(onSearchChange).toHaveBeenCalledWith('r')
      expect(onSearchChange).toHaveBeenCalledWith('e')
      expect(onSearchChange).toHaveBeenCalledWith('a')
      expect(onSearchChange).toHaveBeenCalledWith('c')
      expect(onSearchChange).toHaveBeenCalledWith('t')
    })

    it('calls onSearchSubmit when form is submitted', async () => {
      const user = userEvent.setup()
      const onSearchSubmit = vi.fn((e) => e.preventDefault())
      render(<JobSearchBar {...defaultProps} onSearchSubmit={onSearchSubmit} />)

      const button = screen.getByRole('button', { name: 'Buscar' })
      await user.click(button)

      expect(onSearchSubmit).toHaveBeenCalled()
    })

    it('calls onSearchSubmit on Enter key', async () => {
      const user = userEvent.setup()
      const onSearchSubmit = vi.fn((e) => e.preventDefault())
      render(<JobSearchBar {...defaultProps} onSearchSubmit={onSearchSubmit} />)

      const input = screen.getByPlaceholderText('Buscar ofertas...')
      await user.type(input, '{enter}')

      expect(onSearchSubmit).toHaveBeenCalled()
    })
  })

  describe('filters toggle', () => {
    it('renders filters toggle button when filters are available', () => {
      render(<JobSearchBar {...defaultProps} />)

      expect(screen.getByRole('button', { name: /filtros/i })).toBeInTheDocument()
    })

    it('does not render filters toggle when no filter options', () => {
      const emptyFilters = {
        categories: [],
        locations: [],
        modalities: [],
        contractTypes: [],
      }
      render(<JobSearchBar {...defaultProps} filterOptions={emptyFilters} />)

      expect(screen.queryByRole('button', { name: /filtros/i })).not.toBeInTheDocument()
    })

    it('toggles filters visibility on click', async () => {
      const user = userEvent.setup()
      const { container } = render(<JobSearchBar {...defaultProps} />)

      const toggleButton = screen.getByRole('button', { name: /filtros/i })

      // Initially collapsed - check for expanded class absence
      const filtersContainer = container.querySelector('[class*="filtersCollapsible"]')
      expect(filtersContainer?.className).not.toMatch(/filtersExpanded/)

      // Click to expand
      await user.click(toggleButton)

      // Now expanded - check for expanded class presence
      expect(filtersContainer?.className).toMatch(/filtersExpanded/)
    })
  })

  describe('active filters badge', () => {
    it('shows badge with count when filters are active', () => {
      render(
        <JobSearchBar
          {...defaultProps}
          category="IT"
          location="Madrid"
        />
      )

      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('does not show badge when no filters are active', () => {
      render(<JobSearchBar {...defaultProps} />)

      // No badge should be present
      const toggleButton = screen.getByRole('button', { name: /filtros/i })
      expect(toggleButton.querySelector('span')).not.toHaveTextContent(/^\d+$/)
    })

    it('updates badge when filters change', () => {
      const { rerender } = render(<JobSearchBar {...defaultProps} />)

      expect(screen.queryByText('1')).not.toBeInTheDocument()

      rerender(<JobSearchBar {...defaultProps} category="IT" />)

      expect(screen.getByText('1')).toBeInTheDocument()
    })
  })

  describe('localStorage persistence', () => {
    it('saves filter expanded state to localStorage', async () => {
      const user = userEvent.setup()
      const { container } = render(<JobSearchBar {...defaultProps} />)

      const toggleButton = screen.getByRole('button', { name: /filtros/i })

      // Initially collapsed
      let filtersContainer = container.querySelector('[class*="filtersCollapsible"]')
      expect(filtersContainer?.className).not.toMatch(/filtersExpanded/)

      // Click to expand
      await user.click(toggleButton)

      // Verify it's now expanded (the useEffect will save to localStorage)
      filtersContainer = container.querySelector('[class*="filtersCollapsible"]')
      expect(filtersContainer?.className).toMatch(/filtersExpanded/)
    })

    it('toggles filter state correctly', async () => {
      const user = userEvent.setup()
      const { container } = render(<JobSearchBar {...defaultProps} />)

      const toggleButton = screen.getByRole('button', { name: /filtros/i })

      // Click to expand
      await user.click(toggleButton)
      let filtersContainer = container.querySelector('[class*="filtersCollapsible"]')
      expect(filtersContainer?.className).toMatch(/filtersExpanded/)

      // Click to collapse
      await user.click(toggleButton)
      filtersContainer = container.querySelector('[class*="filtersCollapsible"]')
      expect(filtersContainer?.className).not.toMatch(/filtersExpanded/)
    })

    it('starts collapsed by default when no localStorage value', () => {
      // localStorage is cleared in beforeEach
      const { container } = render(<JobSearchBar {...defaultProps} />)

      const filtersContainer = container.querySelector('[class*="filtersCollapsible"]')
      expect(filtersContainer?.className).not.toMatch(/filtersExpanded/)
    })
  })

  describe('filter interactions', () => {
    it('calls onFilterChange when a filter is changed', async () => {
      const user = userEvent.setup()
      const onFilterChange = vi.fn()

      // Start with filters expanded
      localStorage.setItem('job-filters-expanded', 'true')

      render(<JobSearchBar {...defaultProps} onFilterChange={onFilterChange} />)

      const categorySelect = screen.getByDisplayValue('Todas las categorías')
      await user.selectOptions(categorySelect, 'IT')

      expect(onFilterChange).toHaveBeenCalledWith('category', 'IT')
    })
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { JobFilters } from './JobFilters'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
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
  getModalityLabel: (modality: string) => {
    const labels: Record<string, string> = {
      remote: 'Remoto',
      onsite: 'Presencial',
      hybrid: 'Híbrido',
    }
    return labels[modality] || modality
  },
}))

const defaultFilterOptions = {
  categories: ['IT', 'Marketing', 'Sales'],
  locations: ['Madrid', 'Barcelona', 'Remote'],
  modalities: ['remote', 'onsite', 'hybrid'],
  contractTypes: ['Tiempo completo', 'Tiempo parcial', 'Freelance'],
}

const defaultProps = {
  filterOptions: defaultFilterOptions,
  category: '',
  location: '',
  modality: '',
  contractType: '',
  onFilterChange: vi.fn(),
}

describe('JobFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders category select when categories are available', () => {
      render(<JobFilters {...defaultProps} />)

      expect(screen.getByText('Todas las categorías')).toBeInTheDocument()
    })

    it('renders all category options', () => {
      render(<JobFilters {...defaultProps} />)

      expect(screen.getByRole('option', { name: 'IT' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Marketing' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Sales' })).toBeInTheDocument()
    })

    it('renders location select when locations are available', () => {
      render(<JobFilters {...defaultProps} />)

      expect(screen.getByText('Todas las ubicaciones')).toBeInTheDocument()
    })

    it('renders all location options', () => {
      render(<JobFilters {...defaultProps} />)

      expect(screen.getByRole('option', { name: 'Madrid' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Barcelona' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Remote' })).toBeInTheDocument()
    })

    it('renders modality select when modalities are available', () => {
      render(<JobFilters {...defaultProps} />)

      expect(screen.getByText('Todas las modalidades')).toBeInTheDocument()
    })

    it('renders modality options with labels', () => {
      render(<JobFilters {...defaultProps} />)

      expect(screen.getByRole('option', { name: 'Remoto' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Presencial' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Híbrido' })).toBeInTheDocument()
    })

    it('renders contract type select when contract types are available', () => {
      render(<JobFilters {...defaultProps} />)

      expect(screen.getByText('Todos los tipos de contrato')).toBeInTheDocument()
    })

    it('renders all contract type options', () => {
      render(<JobFilters {...defaultProps} />)

      expect(screen.getByRole('option', { name: 'Tiempo completo' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Tiempo parcial' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Freelance' })).toBeInTheDocument()
    })
  })

  describe('empty filter options', () => {
    it('does not render category select when no categories', () => {
      render(
        <JobFilters
          {...defaultProps}
          filterOptions={{ ...defaultFilterOptions, categories: [] }}
        />
      )

      expect(screen.queryByText('Todas las categorías')).not.toBeInTheDocument()
    })

    it('does not render location select when no locations', () => {
      render(
        <JobFilters
          {...defaultProps}
          filterOptions={{ ...defaultFilterOptions, locations: [] }}
        />
      )

      expect(screen.queryByText('Todas las ubicaciones')).not.toBeInTheDocument()
    })

    it('does not render modality select when no modalities', () => {
      render(
        <JobFilters
          {...defaultProps}
          filterOptions={{ ...defaultFilterOptions, modalities: [] }}
        />
      )

      expect(screen.queryByText('Todas las modalidades')).not.toBeInTheDocument()
    })

    it('does not render contract type select when no contract types', () => {
      render(
        <JobFilters
          {...defaultProps}
          filterOptions={{ ...defaultFilterOptions, contractTypes: [] }}
        />
      )

      expect(screen.queryByText('Todos los tipos de contrato')).not.toBeInTheDocument()
    })
  })

  describe('filter changes', () => {
    it('calls onFilterChange when category is selected', async () => {
      const user = userEvent.setup()
      const onFilterChange = vi.fn()
      render(<JobFilters {...defaultProps} onFilterChange={onFilterChange} />)

      const categorySelect = screen.getByDisplayValue('Todas las categorías')
      await user.selectOptions(categorySelect, 'IT')

      expect(onFilterChange).toHaveBeenCalledWith('category', 'IT')
    })

    it('calls onFilterChange when location is selected', async () => {
      const user = userEvent.setup()
      const onFilterChange = vi.fn()
      render(<JobFilters {...defaultProps} onFilterChange={onFilterChange} />)

      const locationSelect = screen.getByDisplayValue('Todas las ubicaciones')
      await user.selectOptions(locationSelect, 'Madrid')

      expect(onFilterChange).toHaveBeenCalledWith('location', 'Madrid')
    })

    it('calls onFilterChange when modality is selected', async () => {
      const user = userEvent.setup()
      const onFilterChange = vi.fn()
      render(<JobFilters {...defaultProps} onFilterChange={onFilterChange} />)

      const modalitySelect = screen.getByDisplayValue('Todas las modalidades')
      await user.selectOptions(modalitySelect, 'remote')

      expect(onFilterChange).toHaveBeenCalledWith('modality', 'remote')
    })

    it('calls onFilterChange when contract type is selected', async () => {
      const user = userEvent.setup()
      const onFilterChange = vi.fn()
      render(<JobFilters {...defaultProps} onFilterChange={onFilterChange} />)

      const contractSelect = screen.getByDisplayValue('Todos los tipos de contrato')
      await user.selectOptions(contractSelect, 'Freelance')

      expect(onFilterChange).toHaveBeenCalledWith('contractType', 'Freelance')
    })
  })

  describe('selected values', () => {
    it('shows selected category', () => {
      render(<JobFilters {...defaultProps} category="IT" />)

      const categorySelect = screen.getAllByRole('combobox')[0]
      expect(categorySelect).toHaveValue('IT')
    })

    it('shows selected location', () => {
      render(<JobFilters {...defaultProps} location="Madrid" />)

      const locationSelect = screen.getAllByRole('combobox')[1]
      expect(locationSelect).toHaveValue('Madrid')
    })

    it('shows selected modality', () => {
      render(<JobFilters {...defaultProps} modality="remote" />)

      const modalitySelect = screen.getAllByRole('combobox')[2]
      expect(modalitySelect).toHaveValue('remote')
    })

    it('shows selected contract type', () => {
      render(<JobFilters {...defaultProps} contractType="Freelance" />)

      const contractSelect = screen.getAllByRole('combobox')[3]
      expect(contractSelect).toHaveValue('Freelance')
    })
  })
})

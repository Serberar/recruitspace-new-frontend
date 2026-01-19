import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { JobCard } from './JobCard'

// Mock i18n
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'public.jobsList.viewed': 'Visto',
        'public.jobsList.new': 'Nuevo',
        'time.just_now': 'Hace un momento',
        'time.minutes_ago': 'Hace {{count}} min',
        'time.hours_ago': 'Hace {{count}} h',
        'time.days_ago': 'Hace {{count}} d',
      }
      return translations[key] || key
    },
  }),
}))

// Mock date utils
vi.mock('../../utils/dateUtils', () => ({
  getRelativeTime: () => 'Hace 2 días',
  isRecentDate: (date: Date, days: number) => {
    const now = new Date()
    const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    return diff <= days
  },
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

const mockJob = {
  id: 'job-123',
  title: 'Frontend Developer',
  displayName: 'Tech Company',
  location: 'Madrid',
  modality: 'remote',
  contractType: 'Tiempo completo',
  salary: '40,000€ - 50,000€',
  createdAt: new Date().toISOString(),
}

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('JobCard', () => {
  describe('rendering', () => {
    it('renders job title', () => {
      renderWithRouter(<JobCard job={mockJob} />)

      expect(screen.getByRole('heading', { name: 'Frontend Developer' })).toBeInTheDocument()
    })

    it('renders as a link to job detail', () => {
      renderWithRouter(<JobCard job={mockJob} />)

      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/jobs/job-123')
    })

    it('shows company name when showCompany is true', () => {
      renderWithRouter(<JobCard job={mockJob} showCompany />)

      expect(screen.getByText('Tech Company')).toBeInTheDocument()
    })

    it('hides company name when showCompany is false', () => {
      renderWithRouter(<JobCard job={mockJob} showCompany={false} />)

      expect(screen.queryByText('Tech Company')).not.toBeInTheDocument()
    })
  })

  describe('job details', () => {
    it('shows location', () => {
      renderWithRouter(<JobCard job={mockJob} />)

      expect(screen.getByText('Madrid')).toBeInTheDocument()
    })

    it('shows modality label', () => {
      renderWithRouter(<JobCard job={mockJob} />)

      expect(screen.getByText('Remoto')).toBeInTheDocument()
    })

    it('shows contract type', () => {
      renderWithRouter(<JobCard job={mockJob} />)

      expect(screen.getByText('Tiempo completo')).toBeInTheDocument()
    })

    it('shows salary', () => {
      renderWithRouter(<JobCard job={mockJob} />)

      expect(screen.getByText('40,000€ - 50,000€')).toBeInTheDocument()
    })

    it('shows relative time', () => {
      renderWithRouter(<JobCard job={mockJob} />)

      expect(screen.getByText('Hace 2 días')).toBeInTheDocument()
    })
  })

  describe('optional fields', () => {
    it('does not show location when not provided', () => {
      const jobWithoutLocation = { ...mockJob, location: undefined }
      renderWithRouter(<JobCard job={jobWithoutLocation} />)

      expect(screen.queryByText('Madrid')).not.toBeInTheDocument()
    })

    it('does not show modality when not provided', () => {
      const jobWithoutModality = { ...mockJob, modality: undefined }
      renderWithRouter(<JobCard job={jobWithoutModality} />)

      expect(screen.queryByText('Remoto')).not.toBeInTheDocument()
    })

    it('does not show contract type when not provided', () => {
      const jobWithoutContract = { ...mockJob, contractType: undefined }
      renderWithRouter(<JobCard job={jobWithoutContract} />)

      expect(screen.queryByText('Tiempo completo')).not.toBeInTheDocument()
    })

    it('does not show salary when not provided', () => {
      const jobWithoutSalary = { ...mockJob, salary: undefined }
      renderWithRouter(<JobCard job={jobWithoutSalary} />)

      expect(screen.queryByText('40,000€ - 50,000€')).not.toBeInTheDocument()
    })

    it('does not show company when displayName is not provided', () => {
      const jobWithoutCompany = { ...mockJob, displayName: undefined }
      renderWithRouter(<JobCard job={jobWithoutCompany} showCompany />)

      expect(screen.queryByText('Tech Company')).not.toBeInTheDocument()
    })
  })

  describe('badges', () => {
    it('shows "Visto" badge when isViewed is true', () => {
      renderWithRouter(<JobCard job={mockJob} isViewed />)

      expect(screen.getByText('Visto')).toBeInTheDocument()
    })

    it('does not show "Nuevo" badge when isViewed is true', () => {
      // Even if job is new, viewed takes precedence
      renderWithRouter(<JobCard job={mockJob} isViewed />)

      expect(screen.queryByText('Nuevo')).not.toBeInTheDocument()
    })

    it('shows "Nuevo" badge for recent jobs that are not viewed', () => {
      // Job with today's date should show "Nuevo"
      const recentJob = { ...mockJob, createdAt: new Date().toISOString() }
      renderWithRouter(<JobCard job={recentJob} isViewed={false} />)

      expect(screen.getByText('Nuevo')).toBeInTheDocument()
    })

    it('does not show "Nuevo" badge for old jobs', () => {
      const oldDate = new Date()
      oldDate.setDate(oldDate.getDate() - 10)
      const oldJob = { ...mockJob, createdAt: oldDate.toISOString() }
      renderWithRouter(<JobCard job={oldJob} isViewed={false} />)

      expect(screen.queryByText('Nuevo')).not.toBeInTheDocument()
    })
  })
})

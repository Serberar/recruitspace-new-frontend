import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getPublicJobOffers,
  getPublicCategories,
  getPublicFilterOptions,
  getPublicJobOfferById,
  getPublicOrganization,
  getModalityLabel,
} from './publicJobsApi'

// Create mock functions that we can control - must be hoisted
const mockGet = vi.hoisted(() => vi.fn())
const mockPost = vi.hoisted(() => vi.fn())

// Mock axios before importing the module
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: mockGet,
      post: mockPost,
    })),
  },
}))

describe('publicJobsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPublicJobOffers', () => {
    it('fetches job offers with pagination', async () => {
      const mockResponse = {
        data: {
          data: {
            items: [
              { id: '1', title: 'Frontend Developer' },
              { id: '2', title: 'Backend Developer' },
            ],
            total: 50,
            page: 1,
            limit: 10,
            totalPages: 5,
          },
        },
      }
      mockGet.mockResolvedValue(mockResponse)

      const result = await getPublicJobOffers()

      expect(mockGet).toHaveBeenCalledWith('/public/job-offers', { params: undefined })
      expect(result.data).toHaveLength(2)
      expect(result.pagination.total).toBe(50)
      expect(result.pagination.totalPages).toBe(5)
    })

    it('passes search params correctly', async () => {
      const mockResponse = {
        data: {
          data: {
            items: [],
            total: 0,
            page: 1,
            limit: 10,
            totalPages: 0,
          },
        },
      }
      mockGet.mockResolvedValue(mockResponse)

      await getPublicJobOffers({
        search: 'developer',
        category: 'Tech',
        location: 'Madrid',
        page: 2,
        limit: 20,
      })

      expect(mockGet).toHaveBeenCalledWith('/public/job-offers', {
        params: {
          search: 'developer',
          category: 'Tech',
          location: 'Madrid',
          page: 2,
          limit: 20,
        },
      })
    })
  })

  describe('getPublicCategories', () => {
    it('fetches categories list', async () => {
      const mockCategories = ['Tech', 'Marketing', 'Sales']
      mockGet.mockResolvedValue({
        data: { data: { categories: mockCategories } },
      })

      const result = await getPublicCategories()

      expect(mockGet).toHaveBeenCalledWith('/public/job-offers/categories')
      expect(result).toEqual(mockCategories)
    })
  })

  describe('getPublicFilterOptions', () => {
    it('fetches all filter options', async () => {
      const mockFilters = {
        categories: ['Tech', 'Marketing'],
        locations: ['Madrid', 'Barcelona'],
        contractTypes: ['Full-time', 'Part-time'],
        modalities: ['Remote', 'Onsite'],
      }
      mockGet.mockResolvedValue({
        data: { data: mockFilters },
      })

      const result = await getPublicFilterOptions()

      expect(mockGet).toHaveBeenCalledWith('/public/job-offers/filters')
      expect(result).toEqual(mockFilters)
    })
  })

  describe('getPublicJobOfferById', () => {
    it('fetches single job offer by id', async () => {
      const mockOffer = {
        id: '123',
        title: 'Senior Developer',
        description: 'Great opportunity',
      }
      mockGet.mockResolvedValue({
        data: { data: mockOffer },
      })

      const result = await getPublicJobOfferById('123')

      expect(mockGet).toHaveBeenCalledWith('/public/job-offers/123')
      expect(result).toEqual(mockOffer)
    })
  })

  describe('getPublicOrganization', () => {
    it('fetches organization by slug', async () => {
      const mockOrg = {
        id: 'org-123',
        name: 'Tech Corp',
        slug: 'tech-corp',
        logoUrl: 'https://example.com/logo.png',
      }
      mockGet.mockResolvedValue({
        data: { data: mockOrg },
      })

      const result = await getPublicOrganization('tech-corp')

      expect(mockGet).toHaveBeenCalledWith('/public/organizations/tech-corp')
      expect(result).toEqual(mockOrg)
    })
  })

  describe('getModalityLabel', () => {
    it('returns empty string for undefined modality', () => {
      expect(getModalityLabel(undefined)).toBe('')
    })

    it('returns empty string for empty string', () => {
      expect(getModalityLabel('')).toBe('')
    })

    it('returns "Remoto" for remote modality', () => {
      expect(getModalityLabel('remote')).toBe('Remoto')
      expect(getModalityLabel('Remote')).toBe('Remoto')
      expect(getModalityLabel('REMOTE')).toBe('Remoto')
    })

    it('returns "Presencial" for onsite modality', () => {
      expect(getModalityLabel('onsite')).toBe('Presencial')
      expect(getModalityLabel('on-site')).toBe('Presencial')
      expect(getModalityLabel('Onsite')).toBe('Presencial')
    })

    it('returns "Híbrido" for hybrid modality', () => {
      expect(getModalityLabel('hybrid')).toBe('Híbrido')
      expect(getModalityLabel('Hybrid')).toBe('Híbrido')
    })

    it('capitalizes unknown modality', () => {
      expect(getModalityLabel('custom')).toBe('Custom')
      expect(getModalityLabel('CUSTOM')).toBe('CUSTOM')
    })
  })
})

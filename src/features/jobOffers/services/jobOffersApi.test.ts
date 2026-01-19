import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getAssignedOffers,
  getOffersByOrganization,
  getJobOfferById,
  getJobOfferByIdSimple,
  createJobOffer,
  updateJobOffer,
  setJobOfferActive,
  getOffersByClient,
  getOfferPipeline,
  getOfferFilters,
  updateOfferFilters,
  assignOfferToRecruiter,
  unassignOfferFromRecruiter,
} from './jobOffersApi'
import api from '../../../api/axios'

// Mock the api module
vi.mock('../../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  },
}))

describe('jobOffersApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAssignedOffers', () => {
    it('fetches assigned offers without userId', async () => {
      const mockOffers = [{ id: '1', title: 'Frontend Dev' }]
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockOffers } })

      const result = await getAssignedOffers()

      expect(api.get).toHaveBeenCalledWith('/job-offer/assigned', { params: {} })
      expect(result).toEqual(mockOffers)
    })

    it('fetches assigned offers with userId', async () => {
      const mockOffers = [{ id: '1', title: 'Frontend Dev' }]
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockOffers } })

      await getAssignedOffers('user-123')

      expect(api.get).toHaveBeenCalledWith('/job-offer/assigned', { params: { userId: 'user-123' } })
    })
  })

  describe('getOffersByOrganization', () => {
    it('fetches paginated offers', async () => {
      const mockResponse = {
        items: [{ id: '1', title: 'Dev' }],
        total: 50,
        page: 1,
        totalPages: 5,
      }
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockResponse } })

      const result = await getOffersByOrganization({ page: 1, limit: 10 })

      expect(api.get).toHaveBeenCalledWith('/job-offer/organization', { params: { page: 1, limit: 10 } })
      expect(result).toEqual(mockResponse)
    })

    it('applies all filters', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: { items: [], total: 0 } } })

      await getOffersByOrganization({
        active: true,
        assignedUserId: 'user-1',
        clientId: 'client-1',
        page: 2,
        limit: 20,
      })

      expect(api.get).toHaveBeenCalledWith('/job-offer/organization', {
        params: {
          active: true,
          assignedUserId: 'user-1',
          clientId: 'client-1',
          page: 2,
          limit: 20,
        },
      })
    })
  })

  describe('getJobOfferById', () => {
    it('fetches offer with job and client id', async () => {
      const mockOffer = { id: 'offer-1', title: 'Senior Dev' }
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockOffer } })

      const result = await getJobOfferById('offer-1', 'client-1')

      expect(api.get).toHaveBeenCalledWith('/job-offer/offer-1/client/client-1')
      expect(result).toEqual(mockOffer)
    })
  })

  describe('getJobOfferByIdSimple', () => {
    it('fetches offer by id only', async () => {
      const mockOffer = { id: 'offer-1', title: 'Senior Dev' }
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockOffer } })

      const result = await getJobOfferByIdSimple('offer-1')

      expect(api.get).toHaveBeenCalledWith('/job-offer/offer-1')
      expect(result).toEqual(mockOffer)
    })
  })

  describe('createJobOffer', () => {
    it('creates offer with required fields', async () => {
      const offerData = {
        title: 'New Position',
        description: 'Great job',
        clientId: 'client-123',
      }
      const mockResponse = { id: 'new-1', ...offerData }
      vi.mocked(api.post).mockResolvedValue({ data: { data: mockResponse } })

      const result = await createJobOffer(offerData)

      expect(api.post).toHaveBeenCalledWith('/job-offer', offerData)
      expect(result).toEqual(mockResponse)
    })

    it('creates offer with all fields', async () => {
      const offerData = {
        title: 'Senior Developer',
        description: 'Join our team',
        clientId: 'client-123',
        salary: '50000-70000',
        location: 'Madrid',
        modality: 'remote' as const,
        requirements: 'TypeScript',
        benefits: 'Remote work',
        category: 'Tech',
        contractType: 'Full-time',
        isPublic: true,
        salaryPublic: false,
        active: true,
        useStandardPipeline: true,
      }
      vi.mocked(api.post).mockResolvedValue({ data: { data: { id: '1', ...offerData } } })

      await createJobOffer(offerData)

      expect(api.post).toHaveBeenCalledWith('/job-offer', offerData)
    })

    it('creates offer with custom pipeline', async () => {
      const offerData = {
        title: 'Position',
        description: 'Description',
        clientId: 'client-1',
        useStandardPipeline: false,
        customPipeline: [
          { name: 'Applied', color: '#3498db', order: 1, isTerminal: false },
          { name: 'Hired', color: '#27ae60', order: 2, isTerminal: true, action: 'hire' },
        ],
      }
      vi.mocked(api.post).mockResolvedValue({ data: { data: { id: '1' } } })

      await createJobOffer(offerData)

      expect(api.post).toHaveBeenCalledWith('/job-offer', offerData)
    })
  })

  describe('updateJobOffer', () => {
    it('updates offer with partial data', async () => {
      const updateData = { title: 'Updated Title' }
      vi.mocked(api.put).mockResolvedValue({ data: { data: { id: '1', ...updateData } } })

      const result = await updateJobOffer('1', updateData)

      expect(api.put).toHaveBeenCalledWith('/job-offer/1', updateData)
      expect(result.title).toBe('Updated Title')
    })
  })

  describe('setJobOfferActive', () => {
    it('activates an offer', async () => {
      vi.mocked(api.patch).mockResolvedValue({ data: { data: { id: '1', active: true } } })

      const result = await setJobOfferActive('1', true)

      expect(api.patch).toHaveBeenCalledWith('/job-offer/active/1', { active: true })
      expect(result.active).toBe(true)
    })

    it('deactivates an offer', async () => {
      vi.mocked(api.patch).mockResolvedValue({ data: { data: { id: '1', active: false } } })

      const result = await setJobOfferActive('1', false)

      expect(api.patch).toHaveBeenCalledWith('/job-offer/active/1', { active: false })
      expect(result.active).toBe(false)
    })
  })

  describe('getOffersByClient', () => {
    it('fetches all offers for client', async () => {
      const mockOffers = [{ id: '1', title: 'Dev' }]
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockOffers } })

      const result = await getOffersByClient('client-1')

      expect(api.get).toHaveBeenCalledWith('/job-offer/client/client-1', { params: {} })
      expect(result).toEqual(mockOffers)
    })

    it('fetches only active offers for client', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: [] } })

      await getOffersByClient('client-1', true)

      expect(api.get).toHaveBeenCalledWith('/job-offer/client/client-1', { params: { active: true } })
    })
  })

  describe('getOfferPipeline', () => {
    it('fetches pipeline statuses for offer', async () => {
      const mockPipeline = [
        { id: '1', name: 'Applied', order: 1 },
        { id: '2', name: 'Interview', order: 2 },
      ]
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockPipeline } })

      const result = await getOfferPipeline('offer-1')

      expect(api.get).toHaveBeenCalledWith('/job-offer/offer-1/pipeline')
      expect(result).toEqual(mockPipeline)
    })
  })

  describe('getOfferFilters', () => {
    it('fetches custom filters for offer', async () => {
      const mockFilters = {
        skillFilters: ['TypeScript', 'React'],
        educationFilters: ['Computer Science'],
      }
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockFilters } })

      const result = await getOfferFilters('offer-1')

      expect(api.get).toHaveBeenCalledWith('/job-offer/offer-1/filters')
      expect(result).toEqual(mockFilters)
    })
  })

  describe('updateOfferFilters', () => {
    it('updates custom filters', async () => {
      const filters = { skillFilters: ['Python', 'Django'] }
      vi.mocked(api.put).mockResolvedValue({ data: { data: filters } })

      const result = await updateOfferFilters('offer-1', filters)

      expect(api.put).toHaveBeenCalledWith('/job-offer/offer-1/filters', filters)
      expect(result).toEqual(filters)
    })
  })

  describe('assignOfferToRecruiter', () => {
    it('assigns offer to recruiter', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { data: { id: 'offer-1' } } })

      await assignOfferToRecruiter('offer-1', 'user-1')

      expect(api.post).toHaveBeenCalledWith('/job-offer/assign', { offerId: 'offer-1', userId: 'user-1' })
    })
  })

  describe('unassignOfferFromRecruiter', () => {
    it('unassigns offer from recruiter', async () => {
      vi.mocked(api.post).mockResolvedValue({ data: { data: { id: 'offer-1' } } })

      await unassignOfferFromRecruiter('offer-1', 'user-1')

      expect(api.post).toHaveBeenCalledWith('/job-offer/unassign', { offerId: 'offer-1', userId: 'user-1' })
    })
  })
})

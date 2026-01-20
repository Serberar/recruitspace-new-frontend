import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getRecruiterAnalytics } from './analyticsApi'
import api from '../api/axios'

// Mock the api module
vi.mock('../../../api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('analyticsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRecruiterAnalytics', () => {
    const mockAnalytics = {
      summary: {
        activeProcesses: 25,
        hiredThisPeriod: 10,
        rejectedThisPeriod: 5,
        conversionRate: 40,
        totalApplicationsThisPeriod: 50,
        avgTimeToHire: 14,
      },
      byStatus: [],
      byClient: [],
      byOffer: [],
    }

    it('fetches analytics with default period', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockAnalytics } })

      const result = await getRecruiterAnalytics()

      expect(api.get).toHaveBeenCalledWith('/dashboard/recruiter/analytics', {
        params: { period: 'month' },
      })
      expect(result).toEqual(mockAnalytics)
    })

    it('fetches analytics with custom period', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockAnalytics } })

      await getRecruiterAnalytics({ period: 'quarter' })

      expect(api.get).toHaveBeenCalledWith('/dashboard/recruiter/analytics', {
        params: { period: 'quarter' },
      })
    })

    it('fetches analytics with year period', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockAnalytics } })

      await getRecruiterAnalytics({ period: 'year' })

      expect(api.get).toHaveBeenCalledWith('/dashboard/recruiter/analytics', {
        params: { period: 'year' },
      })
    })

    it('fetches analytics with all period', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockAnalytics } })

      await getRecruiterAnalytics({ period: 'all' })

      expect(api.get).toHaveBeenCalledWith('/dashboard/recruiter/analytics', {
        params: { period: 'all' },
      })
    })

    it('includes clientId filter when provided', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockAnalytics } })

      await getRecruiterAnalytics({ period: 'month', clientId: 'client-123' })

      expect(api.get).toHaveBeenCalledWith('/dashboard/recruiter/analytics', {
        params: { period: 'month', clientId: 'client-123' },
      })
    })

    it('includes offerId filter when provided', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockAnalytics } })

      await getRecruiterAnalytics({ period: 'month', offerId: 'offer-456' })

      expect(api.get).toHaveBeenCalledWith('/dashboard/recruiter/analytics', {
        params: { period: 'month', offerId: 'offer-456' },
      })
    })

    it('includes all filters when provided', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockAnalytics } })

      await getRecruiterAnalytics({
        period: 'quarter',
        clientId: 'client-123',
        offerId: 'offer-456',
      })

      expect(api.get).toHaveBeenCalledWith('/dashboard/recruiter/analytics', {
        params: {
          period: 'quarter',
          clientId: 'client-123',
          offerId: 'offer-456',
        },
      })
    })

    it('throws error on API failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Server error'))

      await expect(getRecruiterAnalytics()).rejects.toThrow('Server error')
    })
  })
})

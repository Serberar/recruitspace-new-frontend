import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getRecruiterDashboard,
  getPipelineMetrics,
  getRecruiterKPIs,
  getRecentActivity,
} from './dashboardApi'
import api from '../../../api/axios'

// Mock the api module
vi.mock('../../../api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}))

describe('dashboardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRecruiterDashboard', () => {
    it('fetches dashboard data from correct endpoint', async () => {
      const mockData = {
        assignedOffers: [],
        pendingReviewByOffer: [],
        unreadMessages: [],
        totalUnreadMessages: 0,
      }
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockData } })

      const result = await getRecruiterDashboard()

      expect(api.get).toHaveBeenCalledWith('/dashboard/recruiter')
      expect(result).toEqual(mockData)
    })

    it('throws error on API failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Network error'))

      await expect(getRecruiterDashboard()).rejects.toThrow('Network error')
    })
  })

  describe('getPipelineMetrics', () => {
    it('fetches pipeline metrics from correct endpoint', async () => {
      const mockMetrics = {
        totalCandidates: 100,
        byStatus: [
          { status: 'aplicado', count: 50 },
          { status: 'entrevista', count: 30 },
        ],
      }
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockMetrics } })

      const result = await getPipelineMetrics()

      expect(api.get).toHaveBeenCalledWith('/dashboard/recruiter/metrics')
      expect(result).toEqual(mockMetrics)
    })
  })

  describe('getRecruiterKPIs', () => {
    it('fetches KPIs from correct endpoint', async () => {
      const mockKPIs = {
        activeOffers: 5,
        totalCandidates: 50,
        hired: 10,
      }
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockKPIs } })

      const result = await getRecruiterKPIs()

      expect(api.get).toHaveBeenCalledWith('/dashboard/recruiter/kpis')
      expect(result).toEqual(mockKPIs)
    })
  })

  describe('getRecentActivity', () => {
    it('fetches recent activity with default limit', async () => {
      const mockActivity = [
        { id: '1', type: 'application', timestamp: '2024-01-01' },
      ]
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockActivity } })

      const result = await getRecentActivity()

      expect(api.get).toHaveBeenCalledWith('/dashboard/recruiter/activity', {
        params: { limit: 20 },
      })
      expect(result).toEqual(mockActivity)
    })

    it('fetches recent activity with custom limit', async () => {
      vi.mocked(api.get).mockResolvedValue({ data: { data: [] } })

      await getRecentActivity(10)

      expect(api.get).toHaveBeenCalledWith('/dashboard/recruiter/activity', {
        params: { limit: 10 },
      })
    })
  })
})

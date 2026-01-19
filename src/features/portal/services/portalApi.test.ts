import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getOrganization, updateOrganization } from './portalApi'
import api from '../../auth/services/api'

// Mock the api module
vi.mock('../../auth/services/api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

describe('portalApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOrganization', () => {
    it('fetches current organization', async () => {
      const mockOrganization = {
        id: 'org-123',
        name: 'Tech Corp',
        slug: 'tech-corp',
        domain: 'techcorp.com',
        logoUrl: 'https://example.com/logo.png',
        portalTitle: 'Join Our Team',
        portalSubtitle: 'Great opportunities await',
      }
      vi.mocked(api.get).mockResolvedValue({ data: mockOrganization })

      const result = await getOrganization()

      expect(api.get).toHaveBeenCalledWith('/organization/me')
      expect(result).toEqual(mockOrganization)
    })

    it('throws error on API failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Not found'))

      await expect(getOrganization()).rejects.toThrow('Not found')
    })
  })

  describe('updateOrganization', () => {
    it('updates organization with basic info', async () => {
      const updateData = {
        name: 'Updated Corp',
        domain: 'updated.com',
      }
      const mockResponse = {
        id: 'org-123',
        ...updateData,
        slug: 'tech-corp',
      }
      vi.mocked(api.put).mockResolvedValue({ data: mockResponse })

      const result = await updateOrganization(updateData)

      expect(api.put).toHaveBeenCalledWith('/organization/me', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('updates organization with portal settings', async () => {
      const updateData = {
        portalTitle: 'New Title',
        portalSubtitle: 'New Subtitle',
        logoUrl: 'https://example.com/new-logo.png',
        headerImageUrl: 'https://example.com/header.jpg',
      }
      vi.mocked(api.put).mockResolvedValue({ data: { id: '1', ...updateData } })

      await updateOrganization(updateData)

      expect(api.put).toHaveBeenCalledWith('/organization/me', updateData)
    })

    it('updates organization with candidate page branding', async () => {
      const updateData = {
        useBrandingOnCandidatePage: true,
        candidatePageLogoUrl: 'https://example.com/candidate-logo.png',
        candidatePageHeaderImageUrl: 'https://example.com/candidate-header.jpg',
        candidatePageTitle: 'Welcome Candidate',
        candidatePageSubtitle: 'Track your applications',
      }
      vi.mocked(api.put).mockResolvedValue({ data: { id: '1', ...updateData } })

      await updateOrganization(updateData)

      expect(api.put).toHaveBeenCalledWith('/organization/me', updateData)
    })

    it('updates with partial data', async () => {
      const updateData = { name: 'Only Name' }
      vi.mocked(api.put).mockResolvedValue({ data: { id: '1', ...updateData } })

      await updateOrganization(updateData)

      expect(api.put).toHaveBeenCalledWith('/organization/me', updateData)
    })

    it('throws error on unauthorized update', async () => {
      vi.mocked(api.put).mockRejectedValue(new Error('Forbidden'))

      await expect(updateOrganization({ name: 'Test' })).rejects.toThrow('Forbidden')
    })
  })
})

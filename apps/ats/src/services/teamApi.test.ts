import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getOrganizationMembers,
  createOrgRecruiter,
  updateRecruiterStatus,
} from './teamApi'
import api from '../api/axios'

// Mock the api module
vi.mock('../../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}))

describe('teamApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOrganizationMembers', () => {
    it('fetches members from correct endpoint', async () => {
      const mockMembers = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          role: 'org_admin',
          isActive: true,
          createdAt: '2024-01-01',
        },
      ]
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockMembers } })

      const result = await getOrganizationMembers()

      expect(api.get).toHaveBeenCalledWith('/organization/members')
      expect(result).toEqual(mockMembers)
    })

    it('throws error on API failure', async () => {
      vi.mocked(api.get).mockRejectedValue(new Error('Unauthorized'))

      await expect(getOrganizationMembers()).rejects.toThrow('Unauthorized')
    })
  })

  describe('createOrgRecruiter', () => {
    it('creates recruiter with correct data', async () => {
      const recruiterData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        password: 'securePassword123',
      }
      const mockResponse = {
        id: '2',
        ...recruiterData,
        role: 'org_recruiter',
        isActive: true,
        createdAt: '2024-01-01',
      }
      vi.mocked(api.post).mockResolvedValue({ data: { data: mockResponse } })

      const result = await createOrgRecruiter(recruiterData)

      expect(api.post).toHaveBeenCalledWith('/organization/recruiter', recruiterData)
      expect(result).toEqual(mockResponse)
    })

    it('throws error on duplicate email', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Email already exists'))

      await expect(
        createOrgRecruiter({
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'existing@example.com',
          password: 'password',
        })
      ).rejects.toThrow('Email already exists')
    })
  })

  describe('updateRecruiterStatus', () => {
    it('activates recruiter', async () => {
      const mockMember = {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        role: 'org_recruiter',
        isActive: true,
        createdAt: '2024-01-01',
      }
      vi.mocked(api.patch).mockResolvedValue({ data: { data: mockMember } })

      const result = await updateRecruiterStatus('2', true)

      expect(api.patch).toHaveBeenCalledWith('/organization/recruiter/status', {
        userId: '2',
        isActive: true,
      })
      expect(result).toEqual(mockMember)
    })

    it('deactivates recruiter', async () => {
      const mockMember = {
        id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        role: 'org_recruiter',
        isActive: false,
        createdAt: '2024-01-01',
      }
      vi.mocked(api.patch).mockResolvedValue({ data: { data: mockMember } })

      const result = await updateRecruiterStatus('2', false)

      expect(api.patch).toHaveBeenCalledWith('/organization/recruiter/status', {
        userId: '2',
        isActive: false,
      })
      expect(result.isActive).toBe(false)
    })

    it('throws error when updating admin status', async () => {
      vi.mocked(api.patch).mockRejectedValue(new Error('Cannot modify admin status'))

      await expect(updateRecruiterStatus('1', false)).rejects.toThrow(
        'Cannot modify admin status'
      )
    })
  })
})

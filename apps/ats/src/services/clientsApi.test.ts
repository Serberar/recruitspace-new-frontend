import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getOrganizationClients,
  getCreatedClients,
  createClient,
  updateClient,
  setClientActive,
} from './clientsApi'
import api from '../api/axios'

// Mock the api module
vi.mock('../../../api/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
  },
}))

describe('clientsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getOrganizationClients', () => {
    it('fetches organization clients', async () => {
      const mockClients = [{ id: '1', name: 'Tech Corp' }]
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockClients } })

      const result = await getOrganizationClients()

      expect(api.get).toHaveBeenCalledWith('/client/organization')
      expect(result).toEqual(mockClients)
    })
  })

  describe('getCreatedClients', () => {
    it('fetches created clients', async () => {
      const mockClients = [{ id: '1', name: 'My Client' }]
      vi.mocked(api.get).mockResolvedValue({ data: { data: mockClients } })

      const result = await getCreatedClients()

      expect(api.get).toHaveBeenCalledWith('/client/created')
      expect(result).toEqual(mockClients)
    })
  })

  describe('createClient', () => {
    it('creates client with all fields', async () => {
      const clientData = {
        name: 'New Client',
        contact: 'Contact Person',
        email: 'client@example.com',
        phone: '+34600000000',
      }
      const mockResponse = { id: 'new-123', ...clientData }
      vi.mocked(api.post).mockResolvedValue({ data: { data: mockResponse } })

      const result = await createClient(clientData)

      expect(api.post).toHaveBeenCalledWith('/client', clientData)
      expect(result).toEqual(mockResponse)
    })

    it('creates client with only required fields', async () => {
      const clientData = { name: 'Minimal Client' }
      vi.mocked(api.post).mockResolvedValue({ data: { data: { id: '1', ...clientData } } })

      await createClient(clientData)

      expect(api.post).toHaveBeenCalledWith('/client', clientData)
    })

    it('throws error on duplicate name', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Client already exists'))

      await expect(createClient({ name: 'Existing' })).rejects.toThrow('Client already exists')
    })
  })

  describe('updateClient', () => {
    it('updates client with partial data', async () => {
      const updateData = { name: 'Updated Name', email: 'new@example.com' }
      const mockResponse = { id: '1', ...updateData }
      vi.mocked(api.put).mockResolvedValue({ data: { data: mockResponse } })

      const result = await updateClient('1', updateData)

      expect(api.put).toHaveBeenCalledWith('/client/update/1', updateData)
      expect(result).toEqual(mockResponse)
    })

    it('throws error when client not found', async () => {
      vi.mocked(api.put).mockRejectedValue(new Error('Client not found'))

      await expect(updateClient('999', { name: 'Test' })).rejects.toThrow('Client not found')
    })
  })

  describe('setClientActive', () => {
    it('activates client', async () => {
      const mockClient = { id: '1', name: 'Test', active: true }
      vi.mocked(api.patch).mockResolvedValue({ data: { data: mockClient } })

      const result = await setClientActive('1', true)

      expect(api.patch).toHaveBeenCalledWith('/client/active/1', { active: true })
      expect(result).toEqual(mockClient)
    })

    it('deactivates client', async () => {
      const mockClient = { id: '1', name: 'Test', active: false }
      vi.mocked(api.patch).mockResolvedValue({ data: { data: mockClient } })

      const result = await setClientActive('1', false)

      expect(api.patch).toHaveBeenCalledWith('/client/active/1', { active: false })
      expect(result.active).toBe(false)
    })
  })
})

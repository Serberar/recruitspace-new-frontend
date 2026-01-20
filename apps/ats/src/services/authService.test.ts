import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  loginAPI,
  loginCandidateAPI,
  refreshAPI,
  logoutUser,
  registerAPI,
  resendVerificationAPI,
  verifyEmailAPI,
  forgotPasswordAPI,
  resetPasswordAPI,
  registerCandidateAPI,
} from './authService'
import api from './api'

// Mock the api module
vi.mock('./api', () => ({
  default: {
    post: vi.fn(),
  },
}))

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loginAPI', () => {
    it('sends login request with credentials', async () => {
      const mockResponse = {
        data: {
          accessToken: 'token-123',
          id: 'user-123',
          firstName: 'John',
          lastName: 'Doe',
          role: 'recruiter',
        },
      }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await loginAPI({ username: 'john', password: 'secret' })

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        username: 'john',
        password: 'secret',
      })
      expect(result).toEqual(mockResponse.data)
    })

    it('throws error on failed login', async () => {
      vi.mocked(api.post).mockRejectedValue(new Error('Invalid credentials'))

      await expect(loginAPI({ username: 'john', password: 'wrong' })).rejects.toThrow(
        'Invalid credentials'
      )
    })
  })

  describe('loginCandidateAPI', () => {
    it('sends candidate login request', async () => {
      const mockResponse = {
        data: {
          accessToken: 'token-456',
          id: 'candidate-123',
          firstName: 'Jane',
          lastName: 'Doe',
          role: 'candidate',
        },
      }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await loginCandidateAPI({ username: 'jane@email.com', password: 'pass123' })

      expect(api.post).toHaveBeenCalledWith('/auth/login-candidate', {
        username: 'jane@email.com',
        password: 'pass123',
      })
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('refreshAPI', () => {
    it('requests token refresh', async () => {
      const mockResponse = {
        data: { accessToken: 'new-token-123' },
      }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await refreshAPI()

      expect(api.post).toHaveBeenCalledWith('/auth/refresh')
      expect(result).toEqual({ accessToken: 'new-token-123' })
    })
  })

  describe('logoutUser', () => {
    it('sends logout request and returns true on success', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      const result = await logoutUser()

      expect(api.post).toHaveBeenCalledWith('/auth/logout', {}, { withCredentials: true })
      expect(result).toBe(true)
    })

    it('returns false and logs error on failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(api.post).mockRejectedValue(new Error('Network error'))

      const result = await logoutUser()

      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalledWith('Error cerrando sesión:', expect.any(Error))

      consoleSpy.mockRestore()
    })
  })

  describe('registerAPI', () => {
    it('sends registration request with all data', async () => {
      const registerData = {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'secure123',
        type: 'org_admin' as const,
        organizationName: 'My Company',
      }
      const mockResponse = {
        data: {
          id: 'user-123',
          username: 'johndoe',
          organizationId: 'org-456',
        },
      }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await registerAPI(registerData)

      expect(api.post).toHaveBeenCalledWith('/auth/register', registerData)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('resendVerificationAPI', () => {
    it('sends resend verification request', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await resendVerificationAPI('john@example.com')

      expect(api.post).toHaveBeenCalledWith('/auth/resend-verification', {
        email: 'john@example.com',
      })
    })
  })

  describe('verifyEmailAPI', () => {
    it('sends email verification request', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await verifyEmailAPI('verification-token-123')

      expect(api.post).toHaveBeenCalledWith('/auth/verify-email', {
        token: 'verification-token-123',
      })
    })
  })

  describe('forgotPasswordAPI', () => {
    it('sends forgot password request', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await forgotPasswordAPI('john@example.com')

      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'john@example.com',
      })
    })
  })

  describe('resetPasswordAPI', () => {
    it('sends reset password request with token and new password', async () => {
      vi.mocked(api.post).mockResolvedValue({})

      await resetPasswordAPI('reset-token-123', 'newSecurePassword456')

      expect(api.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'reset-token-123',
        newPassword: 'newSecurePassword456',
      })
    })
  })

  describe('registerCandidateAPI', () => {
    it('sends candidate registration request', async () => {
      const candidateData = {
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        password: 'securePass123',
        phone: '+34612345678',
      }
      const mockResponse = {
        data: {
          id: 'candidate-123',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
        },
      }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await registerCandidateAPI(candidateData)

      expect(api.post).toHaveBeenCalledWith('/auth/register-candidate', candidateData)
      expect(result).toEqual(mockResponse.data)
    })

    it('handles registration without optional phone', async () => {
      const candidateData = {
        email: 'jane@example.com',
        firstName: 'Jane',
        lastName: 'Doe',
        password: 'securePass123',
      }
      const mockResponse = {
        data: {
          id: 'candidate-123',
          email: 'jane@example.com',
          firstName: 'Jane',
          lastName: 'Doe',
        },
      }
      vi.mocked(api.post).mockResolvedValue(mockResponse)

      const result = await registerCandidateAPI(candidateData)

      expect(api.post).toHaveBeenCalledWith('/auth/register-candidate', candidateData)
      expect(result).toEqual(mockResponse.data)
    })
  })
})

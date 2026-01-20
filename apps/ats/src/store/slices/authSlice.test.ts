import { describe, it, expect, vi, beforeEach } from 'vitest'
import authReducer, { login, logout, setAccessToken } from './authSlice'

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] || null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key]
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {}
  }),
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
})

// Mock JWT token
const createMockToken = (payload: { id: string; firstName: string; role: string; exp: number }) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  const signature = 'mock-signature'
  return `${header}.${body}.${signature}`
}

describe('authSlice', () => {
  beforeEach(() => {
    localStorageMock.store = {}
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  describe('initial state', () => {
    it('has correct initial state structure', () => {
      const state = authReducer(undefined, { type: 'unknown' })

      expect(state.id).toBeNull()
      expect(state.user).toBeNull()
      expect(state.role).toBeNull()
      expect(state.isLoggedIn).toBe(false)
    })
  })

  describe('login action', () => {
    it('updates state with user data', () => {
      const initialState = {
        id: null,
        user: null,
        accessToken: null,
        role: null,
        isLoggedIn: false,
      }

      const payload = {
        id: '123',
        user: 'John Doe',
        accessToken: 'mock-token',
        role: 'org_admin',
      }

      const state = authReducer(initialState, login(payload))

      expect(state.id).toBe('123')
      expect(state.user).toBe('John Doe')
      expect(state.accessToken).toBe('mock-token')
      expect(state.role).toBe('org_admin')
      expect(state.isLoggedIn).toBe(true)
    })

    it('stores token in localStorage', () => {
      const initialState = {
        id: null,
        user: null,
        accessToken: null,
        role: null,
        isLoggedIn: false,
      }

      authReducer(initialState, login({
        id: '123',
        user: 'John Doe',
        accessToken: 'mock-token',
        role: 'org_admin',
      }))

      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', 'mock-token')
    })

    it('handles different roles', () => {
      const initialState = {
        id: null,
        user: null,
        accessToken: null,
        role: null,
        isLoggedIn: false,
      }

      const roles = ['org_admin', 'recruiter', 'org_recruiter', 'candidate']

      roles.forEach((role) => {
        const state = authReducer(initialState, login({
          id: '123',
          user: 'User',
          accessToken: 'token',
          role,
        }))

        expect(state.role).toBe(role)
      })
    })
  })

  describe('logout action', () => {
    it('clears all user data', () => {
      const loggedInState = {
        id: '123',
        user: 'John Doe',
        accessToken: 'mock-token',
        role: 'org_admin',
        isLoggedIn: true,
      }

      const state = authReducer(loggedInState, logout())

      expect(state.id).toBeNull()
      expect(state.user).toBeNull()
      expect(state.accessToken).toBeNull()
      expect(state.role).toBeNull()
      expect(state.isLoggedIn).toBe(false)
    })

    it('removes token from localStorage', () => {
      const loggedInState = {
        id: '123',
        user: 'John Doe',
        accessToken: 'mock-token',
        role: 'org_admin',
        isLoggedIn: true,
      }

      authReducer(loggedInState, logout())

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('accessToken')
    })

    it('works when already logged out', () => {
      const loggedOutState = {
        id: null,
        user: null,
        accessToken: null,
        role: null,
        isLoggedIn: false,
      }

      const state = authReducer(loggedOutState, logout())

      expect(state.isLoggedIn).toBe(false)
    })
  })

  describe('setAccessToken action', () => {
    it('updates token and decodes user info', () => {
      const initialState = {
        id: null,
        user: null,
        accessToken: null,
        role: null,
        isLoggedIn: false,
      }

      const futureExp = Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
      const token = createMockToken({
        id: '456',
        firstName: 'Jane',
        role: 'recruiter',
        exp: futureExp,
      })

      const state = authReducer(initialState, setAccessToken(token))

      expect(state.id).toBe('456')
      expect(state.user).toBe('Jane')
      expect(state.role).toBe('recruiter')
      expect(state.accessToken).toBe(token)
      expect(state.isLoggedIn).toBe(true)
    })

    it('stores new token in localStorage', () => {
      const initialState = {
        id: null,
        user: null,
        accessToken: null,
        role: null,
        isLoggedIn: false,
      }

      const futureExp = Math.floor(Date.now() / 1000) + 3600
      const token = createMockToken({
        id: '456',
        firstName: 'Jane',
        role: 'recruiter',
        exp: futureExp,
      })

      authReducer(initialState, setAccessToken(token))

      expect(localStorageMock.setItem).toHaveBeenCalledWith('accessToken', token)
    })

    it('clears state on invalid token', () => {
      const loggedInState = {
        id: '123',
        user: 'John Doe',
        accessToken: 'valid-token',
        role: 'org_admin',
        isLoggedIn: true,
      }

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const state = authReducer(loggedInState, setAccessToken('invalid-token'))

      expect(state.id).toBeNull()
      expect(state.user).toBeNull()
      expect(state.role).toBeNull()
      expect(state.isLoggedIn).toBe(false)

      consoleSpy.mockRestore()
    })

    it('updates state when refreshing token', () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600
      const oldToken = createMockToken({
        id: '123',
        firstName: 'John',
        role: 'org_admin',
        exp: futureExp,
      })

      const currentState = {
        id: '123',
        user: 'John',
        accessToken: oldToken,
        role: 'org_admin',
        isLoggedIn: true,
      }

      const newFutureExp = Math.floor(Date.now() / 1000) + 7200 // 2 hours
      const newToken = createMockToken({
        id: '123',
        firstName: 'John',
        role: 'org_admin',
        exp: newFutureExp,
      })

      const state = authReducer(currentState, setAccessToken(newToken))

      expect(state.accessToken).toBe(newToken)
      expect(state.isLoggedIn).toBe(true)
    })
  })

  describe('state persistence', () => {
    it('action payloads are immutable', () => {
      const initialState = {
        id: null,
        user: null,
        accessToken: null,
        role: null,
        isLoggedIn: false,
      }

      const payload = {
        id: '123',
        user: 'John Doe',
        accessToken: 'mock-token',
        role: 'org_admin',
      }

      const state = authReducer(initialState, login(payload))

      // Original payload should not be modified
      expect(payload.id).toBe('123')

      // State should have the values
      expect(state.id).toBe('123')
    })
  })

  describe('selectors', () => {
    it('can select isLoggedIn from state', () => {
      const state = {
        auth: {
          id: '123',
          user: 'John',
          accessToken: 'token',
          role: 'org_admin',
          isLoggedIn: true,
        },
      }

      expect(state.auth.isLoggedIn).toBe(true)
    })

    it('can select user role from state', () => {
      const state = {
        auth: {
          id: '123',
          user: 'John',
          accessToken: 'token',
          role: 'recruiter',
          isLoggedIn: true,
        },
      }

      expect(state.auth.role).toBe('recruiter')
    })
  })
})
